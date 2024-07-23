import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  Message,
} from "@aws-sdk/client-sqs";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import AudioProcessor from "./audioProcessor.js";

const s3Client = new S3Client({ region: "eu-central-1" });
const sqsClient = new SQSClient({ region: "eu-central-1" });

const BUCKET_NAME = process.env.BUCKET_NAME!;
const QUEUE_URL = process.env.QUEUE_URL!;
const MESSAGES_PER_TASK = 3;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, "config.json");
let audioProcessor: AudioProcessor;

async function initializeAudioProcessor() {
  const configData = await fs.readFile(configPath, "utf-8");
  const config = JSON.parse(configData);
  audioProcessor = new AudioProcessor(config);
}

async function processMessage(message: Message) {
  if (!message.Body) {
    console.error("Message body is empty");
    return;
  }

  const messageBody = JSON.parse(message.Body);
  const s3Key = messageBody.Records[0].s3.object.key;
  const fileName = path.basename(s3Key);
  const inputFile = `/tmp/${fileName}`;

  try {
    // Download file from S3
    const { Body } = await s3Client.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
      }),
    );

    if (!Body || !(Body instanceof Readable)) {
      console.error("S3 object body is empty or not a readable stream");
      return;
    }

    // Write the S3 object to a temporary file
    await fs.writeFile(inputFile, await streamToBuffer(Body));

    // Process audio file
    const outputFile = await audioProcessor.processAudio(inputFile);

    // Read transcription JSON
    const transcriptionJson = await fs.readFile(outputFile, "utf8");

    // Upload transcription JSON to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `transcriptions/${fileName}.json`,
        Body: transcriptionJson,
        ContentType: "application/json",
      }),
    );

    // Delete message from queue
    await sqsClient.send(
      new DeleteMessageCommand({
        QueueUrl: QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle,
      }),
    );
  } catch (error) {
    console.error(`Error processing message: ${error}`);
  } finally {
    // Clean up temporary files
    await audioProcessor.cleanupFiles([inputFile, `${inputFile}.json`]);
  }
}

async function pollQueue() {
  while (true) {
    const command = new ReceiveMessageCommand({
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: MESSAGES_PER_TASK,
      WaitTimeSeconds: 20,
    });

    try {
      const response = await sqsClient.send(command);

      if (response.Messages && response.Messages.length > 0) {
        await Promise.all(response.Messages.map(processMessage));
      } else {
        console.log("No messages received");
      }
    } catch (error) {
      console.error("Error polling queue:", error);
      // Add a delay before the next poll attempt
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function main() {
  console.log("Application starting...");
  console.log("Initializing AudioProcessor...");
  await initializeAudioProcessor();
  console.log("AudioProcessor initialized. Starting to poll queue...");
  await pollQueue();
}

main().catch(console.error);
