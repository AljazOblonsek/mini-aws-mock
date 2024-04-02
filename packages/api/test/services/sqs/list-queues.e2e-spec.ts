import { SqsQueue } from '@/src/modules/sqs/entities/sqs-queue.entity';
import { generateSqsQueueStub } from '@/src/modules/sqs/mock/stubs/sqs-queue.stub';
import { AwsTestingModule } from '@/test/utils/aws-testing-module';
import { ListQueuesCommand, ListQueuesCommandOutput, SQSClient } from '@aws-sdk/client-sqs';
import { getModelToken } from '@nestjs/sequelize';

describe('SQS - ListQueues', () => {
  let awsTestingModule: AwsTestingModule;
  let sqsClient: SQSClient;
  let sqsQueueModel: typeof SqsQueue;

  beforeEach(async () => {
    awsTestingModule = await new AwsTestingModule().start();

    sqsClient = await awsTestingModule.createAwsClient(SQSClient);

    sqsQueueModel = awsTestingModule.app.get<typeof SqsQueue>(getModelToken(SqsQueue));
  });

  afterEach(async () => {
    await awsTestingModule.stop();
  });

  it('should paginate the returned list of queues correctly', async () => {
    const sqsQueuesStub = await sqsQueueModel.bulkCreate([
      generateSqsQueueStub(),
      generateSqsQueueStub(),
      generateSqsQueueStub(),
      generateSqsQueueStub(),
      generateSqsQueueStub(),
    ]);

    let command: ListQueuesCommand;
    let response: ListQueuesCommandOutput;

    // Page 1
    command = new ListQueuesCommand({ MaxResults: 2 });
    response = await sqsClient.send(command);
    expect(response.QueueUrls).toHaveLength(2);
    expect(response.QueueUrls![0]).toBe(sqsQueuesStub[0].url);
    expect(response.QueueUrls![1]).toBe(sqsQueuesStub[1].url);
    expect(response.NextToken).toBe(sqsQueuesStub[2].arn);

    // Page 2
    command = new ListQueuesCommand({
      MaxResults: 2,
      NextToken: sqsQueuesStub[2].arn,
    });
    response = await sqsClient.send(command);
    expect(response.QueueUrls).toHaveLength(2);
    expect(response.QueueUrls![0]).toBe(sqsQueuesStub[2].url);
    expect(response.QueueUrls![1]).toBe(sqsQueuesStub[3].url);
    expect(response.NextToken).toBe(sqsQueuesStub[4].arn);

    // Page 3
    command = new ListQueuesCommand({
      MaxResults: 2,
      NextToken: sqsQueuesStub[4].arn,
    });
    response = await sqsClient.send(command);
    expect(response.QueueUrls).toHaveLength(1);
    expect(response.QueueUrls![0]).toBe(sqsQueuesStub[4].url);
    expect(response).not.toHaveProperty('NextToken');
  });

  it('should filter and paginate the returned list of queues correctly', async () => {
    const sqsQueuesStub = await sqsQueueModel.bulkCreate([
      generateSqsQueueStub({ name: 'audio-1-queue' }),
      generateSqsQueueStub({ name: 'audio-2-queue' }),
      generateSqsQueueStub({ name: 'video-1-queue' }),
      generateSqsQueueStub({ name: 'video-2-queue' }),
      generateSqsQueueStub({ name: 'audio-12-queue' }),
    ]);

    let command: ListQueuesCommand;
    let response: ListQueuesCommandOutput;

    // Page 1
    command = new ListQueuesCommand({
      MaxResults: 2,
      QueueNamePrefix: 'audio',
    });
    response = await sqsClient.send(command);
    expect(response.QueueUrls).toHaveLength(2);
    expect(response.QueueUrls![0]).toBe(sqsQueuesStub[0].url);
    expect(response.QueueUrls![1]).toBe(sqsQueuesStub[1].url);
    expect(response.NextToken).toBe(sqsQueuesStub[4].arn);

    // Page 2
    command = new ListQueuesCommand({
      MaxResults: 2,
      QueueNamePrefix: 'audio',
      NextToken: sqsQueuesStub[4].arn,
    });
    response = await sqsClient.send(command);
    expect(response.QueueUrls).toHaveLength(1);
    expect(response.QueueUrls![0]).toBe(sqsQueuesStub[4].url);
    expect(response).not.toHaveProperty('NextToken');

    // Only 1 queue starts with `audio-12`
    command = new ListQueuesCommand({
      MaxResults: 2,
      QueueNamePrefix: 'audio-12',
    });
    response = await sqsClient.send(command);
    expect(response.QueueUrls).toHaveLength(1);
    expect(response.QueueUrls![0]).toBe(sqsQueuesStub[4].url);
    expect(response).not.toHaveProperty('NextToken');
  });
});
