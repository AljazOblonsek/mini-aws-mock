import { SqsQueue } from '@/src/modules/sqs/entities/sqs-queue.entity';
import { generateSqsQueueStub } from '@/src/modules/sqs/mock/stubs/sqs-queue.stub';
import { AwsTestingModule } from '@/test/utils/aws-testing-module';
import { GetQueueUrlCommand, SQSClient } from '@aws-sdk/client-sqs';
import { getModelToken } from '@nestjs/sequelize';

describe('SQS - GetQueueUrl', () => {
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

  it('should throw validation error if body parsing fails', async () => {
    const command = new GetQueueUrlCommand({ QueueName: undefined });

    await expect(sqsClient.send(command)).rejects.toThrow(
      'The input fails to satisfy the constraints specified by an AWS service.'
    );
  });

  it('should throw not found error if queue is not found by name', async () => {
    const sqsQueueStub = generateSqsQueueStub();

    const command = new GetQueueUrlCommand({ QueueName: sqsQueueStub.name });

    await expect(sqsClient.send(command)).rejects.toThrow("The specified queue doesn't exist.");
  });

  it('should return url of the queue', async () => {
    const sqsQueueStub = await sqsQueueModel.create(
      generateSqsQueueStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
        port: awsTestingModule.configService.getOrThrow('PORT'),
      })
    );

    const command = new GetQueueUrlCommand({ QueueName: sqsQueueStub.name });

    const response = await sqsClient.send(command);

    expect(response.QueueUrl).toBeTruthy();
    expect(response.QueueUrl).toBe(sqsQueueStub.url);
  });
});
