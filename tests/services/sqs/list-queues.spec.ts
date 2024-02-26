import { TestingModule } from '@/tests/utils/testing-module';
import { ListQueuesCommand, ListQueuesCommandOutput, SQSClient } from '@aws-sdk/client-sqs';
import { SqsQueue } from '@/services/sqs/types/sqs-queue.type';
import { sqsQueueDb } from '@/services/sqs/dbs/sqs-queue.db';

describe('SQS - ListQueues', () => {
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

  it('should paginate the returned list of queues correctly', async () => {
    const queueListStub: SqsQueue[] = [
      {
        name: 'first-queue',
        url: `http://sqs.${process.env.AWS_REGION}.localhost:${process.env.PORT}/${process.env.AWS_USER_ID}/first-queue`,
        arn: `arn:aws:sqs:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:first-queue`,
        visibilityTimeout: 30,
        receiveMessageWaitTimeSeconds: 0,
        maximumMessageSize: 262144,
      },
      {
        name: 'seconds-queue',
        url: `http://sqs.${process.env.AWS_REGION}.localhost:${process.env.PORT}/${process.env.AWS_USER_ID}/second-queue`,
        arn: `arn:aws:sqs:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:second-queue`,
        visibilityTimeout: 30,
        receiveMessageWaitTimeSeconds: 0,
        maximumMessageSize: 262144,
      },
      {
        name: 'third-queue',
        url: `http://sqs.${process.env.AWS_REGION}.localhost:${process.env.PORT}/${process.env.AWS_USER_ID}/third-queue`,
        arn: `arn:aws:sqs:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:third-queue`,
        visibilityTimeout: 30,
        receiveMessageWaitTimeSeconds: 0,
        maximumMessageSize: 262144,
      },
      {
        name: 'fourth-queue',
        url: `http://sqs.${process.env.AWS_REGION}.localhost:${process.env.PORT}/${process.env.AWS_USER_ID}/fourth-queue`,
        arn: `arn:aws:sqs:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:fourth-queue`,
        visibilityTimeout: 30,
        receiveMessageWaitTimeSeconds: 0,
        maximumMessageSize: 262144,
      },
      {
        name: 'fifth-queue',
        url: `http://sqs.${process.env.AWS_REGION}.localhost:${process.env.PORT}/${process.env.AWS_USER_ID}/fifth-queue`,
        arn: `arn:aws:sqs:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:fifth-queue`,
        visibilityTimeout: 30,
        receiveMessageWaitTimeSeconds: 0,
        maximumMessageSize: 262144,
      },
    ];

    jest.spyOn(sqsQueueDb, 'getAll').mockReturnValue(queueListStub);

    let command: ListQueuesCommand;
    let response: ListQueuesCommandOutput;

    // Page 1
    command = new ListQueuesCommand({ MaxResults: 2 });
    response = await sqsClient.send(command);
    expect(response.QueueUrls).toHaveLength(2);
    expect(response.QueueUrls![0]).toBe(queueListStub[0].url);
    expect(response.QueueUrls![1]).toBe(queueListStub[1].url);
    expect(response.NextToken).toBe(
      `arn:aws:sqs:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:third-queue`
    );

    // Page 2
    command = new ListQueuesCommand({
      MaxResults: 2,
      NextToken: `arn:aws:sqs:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:third-queue`,
    });
    response = await sqsClient.send(command);
    expect(response.QueueUrls).toHaveLength(2);
    expect(response.QueueUrls![0]).toBe(queueListStub[2].url);
    expect(response.QueueUrls![1]).toBe(queueListStub[3].url);
    expect(response.NextToken).toBe(
      `arn:aws:sqs:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:fifth-queue`
    );

    // Page 3
    command = new ListQueuesCommand({
      MaxResults: 2,
      NextToken: `arn:aws:sqs:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:fifth-queue`,
    });
    response = await sqsClient.send(command);
    expect(response.QueueUrls).toHaveLength(1);
    expect(response.QueueUrls![0]).toBe(queueListStub[4].url);
    expect(response).not.toHaveProperty('NextToken');
  });

  it('should filter and paginate the returned list of queues correctly', async () => {
    const queueListStub: SqsQueue[] = [
      {
        name: 'audio-1-queue',
        url: `http://sqs.${process.env.AWS_REGION}.localhost:${process.env.PORT}/${process.env.AWS_USER_ID}/audio-1-queue`,
        arn: `arn:aws:sqs:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:audio-1-queue`,
        visibilityTimeout: 30,
        receiveMessageWaitTimeSeconds: 0,
        maximumMessageSize: 262144,
      },
      {
        name: 'audio-2-queue',
        url: `http://sqs.${process.env.AWS_REGION}.localhost:${process.env.PORT}/${process.env.AWS_USER_ID}/audio-2-queue`,
        arn: `arn:aws:sqs:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:audio-2-queue`,
        visibilityTimeout: 30,
        receiveMessageWaitTimeSeconds: 0,
        maximumMessageSize: 262144,
      },
      {
        name: 'audio-12-queue',
        url: `http://sqs.${process.env.AWS_REGION}.localhost:${process.env.PORT}/${process.env.AWS_USER_ID}/audio-12-queue`,
        arn: `arn:aws:sqs:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:audio-12-queue`,
        visibilityTimeout: 30,
        receiveMessageWaitTimeSeconds: 0,
        maximumMessageSize: 262144,
      },
    ];

    jest.spyOn(sqsQueueDb, 'getAll').mockReturnValue(queueListStub);

    let command: ListQueuesCommand;
    let response: ListQueuesCommandOutput;

    // Page 1
    command = new ListQueuesCommand({
      MaxResults: 2,
      QueueNamePrefix: 'audio',
    });
    response = await sqsClient.send(command);
    expect(response.QueueUrls).toHaveLength(2);
    expect(response.QueueUrls![0]).toBe(queueListStub[0].url);
    expect(response.QueueUrls![1]).toBe(queueListStub[1].url);
    expect(response.NextToken).toBe(
      `arn:aws:sqs:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:audio-12-queue`
    );

    // Page 2
    command = new ListQueuesCommand({
      MaxResults: 2,
      QueueNamePrefix: 'audio',
      NextToken: `arn:aws:sqs:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:audio-12-queue`,
    });
    response = await sqsClient.send(command);
    expect(response.QueueUrls).toHaveLength(1);
    expect(response.QueueUrls![0]).toBe(queueListStub[2].url);
    expect(response).not.toHaveProperty('NextToken');

    // Only 1 queue starts with `audio-12`
    command = new ListQueuesCommand({
      MaxResults: 2,
      QueueNamePrefix: 'audio-12',
    });
    response = await sqsClient.send(command);
    expect(response.QueueUrls).toHaveLength(1);
    expect(response.QueueUrls![0]).toBe(queueListStub[2].url);
    expect(response).not.toHaveProperty('NextToken');
  });
});
