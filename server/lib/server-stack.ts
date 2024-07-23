import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3Notifications from 'aws-cdk-lib/aws-s3-notifications';
import * as path from 'path';

const env = { account: '975050297850', region: 'eu-central-1' };

export class ServerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, { env, ...props });

    const vpc = new ec2.Vpc(this, 'MyVPC', {
      maxAzs: 3,
      natGateways: 0, // Disable AWS managed NAT Gateways
    });

    const fckNatInstance = new ec2.Instance(this, 'FckNatInstance', {
      instanceType: new ec2.InstanceType('t4g.nano'),
      machineImage: ec2.MachineImage.genericLinux({
        'eu-central-1': 'ami-0adfb4e8d8a3bdf82',
      }),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });

    const securityGroup = new ec2.SecurityGroup(this, 'FckNatSecurityGroup', {
      vpc,
      allowAllOutbound: true, // Modify as needed
    });

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.allTraffic(),
      'Allow all inbound traffic'
    );

    fckNatInstance.addSecurityGroup(securityGroup);

    const bucket = new s3.Bucket(this, 'AudioMoodBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
    });

    const queue = new sqs.Queue(this, 'AudioMoodServerQueue', {
      visibilityTimeout: cdk.Duration.seconds(300),
    });

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3Notifications.SqsDestination(queue)
    );

    const uploaderLambda = new lambda.Function(
      this,
      'AudioMoodUploaderLambda',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'uploader.handler',
        code: lambda.Code.fromAsset('lambda/uploader'),
        vpc,
        environment: {
          BUCKET_NAME: bucket.bucketName,
          QUEUE_URL: queue.queueUrl,
        },
      }
    );
    bucket.grantReadWrite(uploaderLambda);

    const cluster = new ecs.Cluster(this, 'AudioProcessingCluster', {
      vpc,
      containerInsights: true,
    });

    const key = new ec2.CfnKeyPair(this, 'EcsInstanceKey', {
      keyName: 'ecs-instance-key',
    });

    const asg = new autoscaling.AutoScalingGroup(this, 'ASG', {
      vpc: vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ecs.EcsOptimizedImage.amazonLinux2023(),
      minCapacity: 1,
      maxCapacity: 5,
      keyName: key.keyName,
    });

    const asgSecurityGroup = new ec2.SecurityGroup(this, 'AsgSecurityGroup', {
      vpc: vpc,
      description: 'Security group for ECS instances',
      allowAllOutbound: true,
    });

    asgSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allow SSH access'
    );

    asg.addSecurityGroup(asgSecurityGroup);

    const capacityProvider = new ecs.AsgCapacityProvider(
      this,
      'AsgCapacityProvider',
      {
        autoScalingGroup: asg,
      }
    );

    cluster.addAsgCapacityProvider(capacityProvider);

    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'TaskDef', {
      executionRole: new iam.Role(this, 'TaskExecutionRole', {
        assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            'service-role/AmazonECSTaskExecutionRolePolicy'
          ),
        ],
      }),
    });

    taskDefinition.addToTaskRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['logs:CreateLogStream', 'logs:PutLogEvents'],
        resources: ['*'],
      })
    );

    const container = taskDefinition.addContainer('DefaultContainer', {
      image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../container')),
      memoryReservationMiB: 512,
      environment: {
        BUCKET_NAME: bucket.bucketName,
        QUEUE_URL: queue.queueUrl,
      },
      healthCheck: {
        command: ['CMD-SHELL', 'node /home/node/app/healthcheck.js || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(10),
        retries: 3,
        startPeriod: cdk.Duration.seconds(5),
      },
      logging: new ecs.AwsLogDriver({ streamPrefix: 'AudioProcessor' }),
    });

    container.addPortMappings({
      containerPort: 80,
    });

    const service = new ecs.Ec2Service(this, 'Service', {
      cluster,
      taskDefinition,

      capacityProviderStrategies: [
        {
          capacityProvider: capacityProvider.capacityProviderName,
          weight: 1,
        },
      ],
      desiredCount: 1,
      minHealthyPercent: 50,
      maxHealthyPercent: 200,
    });

    const scaling = service.autoScaleTaskCount({ maxCapacity: 10 });
    scaling.scaleOnMetric('ScaleOnQueueSize', {
      metric: queue.metricApproximateNumberOfMessagesVisible(),
      scalingSteps: [
        { upper: 0, change: -1 },
        { lower: 10, change: +1 },
        { lower: 50, change: +3 },
      ],
      adjustmentType: autoscaling.AdjustmentType.CHANGE_IN_CAPACITY,
    });

    bucket.grantReadWrite(taskDefinition.taskRole);
    queue.grantConsumeMessages(taskDefinition.taskRole);

    const api = new apigateway.RestApi(this, 'AudioMoodApi', {
      restApiName: 'Transcription Service',
      description: 'This service receives audio files for transcription.',
    });

    const transcriptionIntegration = new apigateway.LambdaIntegration(
      uploaderLambda
    );

    api.root
      .addResource('transcribe')
      .addMethod('POST', transcriptionIntegration);

    const privateSubnets = vpc.selectSubnets({
      subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
    });

    privateSubnets.subnets.forEach((subnet) => {
      subnet.addRoute('RouteToInternetViaFckNat', {
        routerId: fckNatInstance.instanceId,
        routerType: ec2.RouterType.INSTANCE,
        destinationCidrBlock: '0.0.0.0/0',
      });
    });
  }
}
