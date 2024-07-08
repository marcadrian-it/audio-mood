import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as autoscaling from "aws-cdk-lib/aws-autoscaling";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as s3Notifications from "aws-cdk-lib/aws-s3-notifications";
import * as path from "path";

export class ServerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "AudioMoodVpc", {
      maxAzs: 2,
    });

    const bucket = new s3.Bucket(this, "AudioMoodBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
    });

    const queue = new sqs.Queue(this, "AudioMoodServerQueue", {
      visibilityTimeout: cdk.Duration.seconds(300),
    });

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3Notifications.SqsDestination(queue),
    );

    const uploaderLambda = new lambda.Function(
      this,
      "AudioMoodUploaderLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "uploader.handler",
        code: lambda.Code.fromAsset("lambda/uploader"),
        environment: {
          BUCKET_NAME: bucket.bucketName,
          QUEUE_URL: queue.queueUrl,
        },
      },
    );
    bucket.grantReadWrite(uploaderLambda);

    const cluster = new ecs.Cluster(this, "AudioProcessingCluster", { vpc });

    cluster.addCapacity("DefaultAutoScalingGroup", {
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO,
      ),
      minCapacity: 1,
      maxCapacity: 5,
    });

    const taskDefinition = new ecs.Ec2TaskDefinition(this, "TaskDef");
    taskDefinition.addContainer("DefaultContainer", {
      image: ecs.ContainerImage.fromAsset(path.join(__dirname, "../container")),
      memoryLimitMiB: 512,
      cpu: 256,
      environment: {
        BUCKET_NAME: bucket.bucketName,
        QUEUE_URL: queue.queueUrl,
      },
    });

    const service = new ecs.Ec2Service(this, "Service", {
      cluster,
      taskDefinition,
      desiredCount: 1,
    });

    const scaling = service.autoScaleTaskCount({ maxCapacity: 10 });
    scaling.scaleOnMetric("ScaleOnQueueSize", {
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

    const api = new apigateway.RestApi(this, "AudioMoodApi", {
      restApiName: "Transcription Service",
      description: "This service receives audio files for transcription.",
    });

    const transcriptionIntegration = new apigateway.LambdaIntegration(
      uploaderLambda,
    );

    api.root
      .addResource("transcribe")
      .addMethod("POST", transcriptionIntegration);
  }
}
