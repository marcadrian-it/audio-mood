import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler,
} from "aws-lambda";
import { S3 } from "aws-sdk";

const s3 = new S3();

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid request, missing body" }),
      };
    }

    const bucketName = process.env.BUCKET_NAME as string;
    const fileName = `upload-${Date.now()}`;

    // Generate pre-signed URL for S3 upload
    const params = {
      Bucket: bucketName,
      Key: fileName,
      ContentType: "audio/*",
      Expires: 60 * 5,
    };

    const signedUrl = await s3.getSignedUrlPromise("putObject", params);

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl: signedUrl }),
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Failed to generate upload URL: ${errorMessage}`,
      }),
    };
  }
};
