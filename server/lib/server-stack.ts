import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as sqsEventSources from "aws-cdk-lib/aws-lambda-event-sources";

export class ServerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "AudioMoodBucket");

    const queue = new sqs.Queue(this, "AudioMoodServerQueue", {
      visibilityTimeout: cdk.Duration.seconds(300),
    });

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
    queue.grantSendMessages(uploaderLambda);

    const repo = ecr.Repository.fromRepositoryArn(
      this,
      "AudioMoodProcessorRepo",
      "arn:aws:ecr:<region>:<account-id>:repository/my-processor-repo",
    );

    const processorLambda = new lambda.DockerImageFunction(
      this,
      "AudioMoodProcessorLambda",
      {
        code: lambda.DockerImageCode.fromEcr(repo),
      },
    );

    processorLambda.addEventSource(new sqsEventSources.SqsEventSource(queue));
    bucket.grantRead(processorLambda);

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
