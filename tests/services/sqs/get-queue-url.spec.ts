import { SQSClient, GetQueueUrlCommand } from '@aws-sdk/client-sqs';
import { TestingModule } from '@/tests/utils/testing-module';
import { sqsQueueDb } from '@/services/sqs/dbs/sqs-queue.db';

describe('SQS - GetQueueUrl', () => {
  let app: TestingModule;
  let sqsClient: SQSClient;

  beforeAll(async () => {
    app = await new TestingModule().start();
    sqsClient = new SQSClient({
      endpoint: app.getBaseUrl(),
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY as string,
        secretAccessKey: process.env.AWS_SECRET_KEY as string,
      },
    });
  });

  afterAll(async () => {
    await app.stop();
  });

  it('should throw validation error if body parsing fails', async () => {
    const command = new GetQueueUrlCommand({ QueueName: undefined });

    await expect(sqsClient.send(command)).rejects.toThrow(
      'The input fails to satisfy the constraints specified by an AWS service.'
    );
  });

  it('should throw not found error if queue is not found by url', async () => {
    const command = new GetQueueUrlCommand({ QueueName: 'non-existing-queue' });

    await expect(sqsClient.send(command)).rejects.toThrow("The specified queue doesn't exist.");
  });

  it('should return url of the queue', async () => {
    const queue = sqsQueueDb.create({
      name: 'audio-processing',
      url: `http://sqs.${process.env.AWS_REGION}.localhost:${process.env.PORT}/${process.env.AWS_USER_ID}/audio-processing`,
      arn: `arn:aws:sqs:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:audio-processing`,
      visibilityTimeout: 30,
      receiveMessageWaitTimeSeconds: 0,
      maximumMessageSize: 262144,
    });

    const command = new GetQueueUrlCommand({ QueueName: queue.name });

    const response = await sqsClient.send(command);

    expect(response.QueueUrl).toBeTruthy();
    expect(response.QueueUrl).toBe(queue.url);
  });
});
