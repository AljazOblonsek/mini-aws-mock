import { SqsQueue } from '@/src/modules/sqs/entities/sqs-queue.entity';
import { generateSqsQueueStub } from '@/src/modules/sqs/mock/stubs/sqs-queue.stub';
import { generateQueueUrl } from '@/src/modules/sqs/utils/generate-queue-url';
import { AwsTestingModule } from '@/test/utils/aws-testing-module';
import { CreateQueueCommand, SQSClient } from '@aws-sdk/client-sqs';
import { faker } from '@faker-js/faker';
import { getModelToken } from '@nestjs/sequelize';

describe('SQS - CreateQueue', () => {
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
    const command = new CreateQueueCommand({ QueueName: undefined });

    await expect(sqsClient.send(command)).rejects.toThrow(
      'The input fails to satisfy the constraints specified by an AWS service.'
    );
  });

  it('should return existing queue if queue with same name already exists', async () => {
    const sqsQueueStub = await sqsQueueModel.create(
      generateSqsQueueStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
        port: awsTestingModule.configService.getOrThrow('PORT'),
      })
    );

    const command = new CreateQueueCommand({ QueueName: sqsQueueStub.name });

    const response = await sqsClient.send(command);

    expect(response.QueueUrl).toBeTruthy();
    expect(response.QueueUrl).toBe(sqsQueueStub.url);

    expect(await sqsQueueModel.findAll()).toHaveLength(1);
  });

  it('should create a new queue and returns its url', async () => {
    const queueNameStub = faker.word.sample();

    const command = new CreateQueueCommand({ QueueName: queueNameStub });

    const response = await sqsClient.send(command);

    expect(response.QueueUrl).toBeTruthy();
    expect(response.QueueUrl).toBe(
      generateQueueUrl({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
        port: awsTestingModule.configService.getOrThrow('PORT'),
        name: queueNameStub,
      })
    );

    expect(await sqsQueueModel.findAll()).toHaveLength(1);
  });
});
