import { SQSClient, CreateQueueCommand } from '@aws-sdk/client-sqs';
import { TestingModule } from '@/tests/utils/testing-module';
import { SqsQueue } from '@/services/sqs/types/sqs-queue.type';
import { sqsQueueDb } from '@/services/sqs/dbs/sqs-queue.db';

describe('SQS - CreateQueue', () => {
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
    const command = new CreateQueueCommand({ QueueName: undefined });

    await expect(sqsClient.send(command)).rejects.toThrow(
      'The input fails to satisfy the constraints specified by an AWS service.'
    );
  });

  it('should return existing queue if queue with same name already exists', async () => {
    const queueStub: SqsQueue = {
      name: 'audio-processing',
      url: `http://sqs.${process.env.AWS_REGION}.localhost:${process.env.PORT}/${process.env.AWS_USER_ID}/audio-processing`,
      arn: `arn:aws:sqs:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:audio-processing`,
      visibilityTimeout: 30,
      receiveMessageWaitTimeSeconds: 0,
      maximumMessageSize: 262144,
    };

    jest.spyOn(sqsQueueDb, 'getFirstByKeyValue').mockReturnValueOnce(queueStub);

    const command = new CreateQueueCommand({ QueueName: queueStub.name });

    const response = await sqsClient.send(command);

    expect(response.QueueUrl).toBeTruthy();
    expect(response.QueueUrl).toBe(queueStub.url);
  });

  it('should create a new queue and returns its url', async () => {
    jest.spyOn(sqsQueueDb, 'getFirstByKeyValue').mockReturnValueOnce(null);

    const queueNameStub = 'audio-processing';

    const command = new CreateQueueCommand({ QueueName: queueNameStub });

    const response = await sqsClient.send(command);

    expect(response.QueueUrl).toBeTruthy();
    expect(response.QueueUrl).toBe(
      `http://sqs.${process.env.AWS_REGION}.localhost:${process.env.PORT}/${process.env.AWS_USER_ID}/${queueNameStub}`
    );
  });
});
