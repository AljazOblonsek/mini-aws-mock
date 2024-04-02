import { SqsMessageHistory } from '@/src/modules/sqs/entities/sqs-message-history.entity';
import { SqsMessage } from '@/src/modules/sqs/entities/sqs-message.entity';
import { SqsQueue } from '@/src/modules/sqs/entities/sqs-queue.entity';
import { generateSqsMessageStub } from '@/src/modules/sqs/mock/stubs/sqs-message.stub';
import { generateSqsQueueStub } from '@/src/modules/sqs/mock/stubs/sqs-queue.stub';
import { AwsTestingModule } from '@/test/utils/aws-testing-module';
import { DeleteMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { faker } from '@faker-js/faker';
import { getModelToken } from '@nestjs/sequelize';

describe('SQS - DeleteMessage', () => {
  let awsTestingModule: AwsTestingModule;
  let sqsClient: SQSClient;
  let sqsQueueModel: typeof SqsQueue;
  let sqsMessageModel: typeof SqsMessage;
  let sqsMessageHistoryModel: typeof SqsMessageHistory;

  beforeEach(async () => {
    awsTestingModule = await new AwsTestingModule().start();

    sqsClient = await awsTestingModule.createAwsClient(SQSClient);

    sqsQueueModel = awsTestingModule.app.get<typeof SqsQueue>(getModelToken(SqsQueue));
    sqsMessageModel = awsTestingModule.app.get<typeof SqsMessage>(getModelToken(SqsMessage));
    sqsMessageHistoryModel = awsTestingModule.app.get<typeof SqsMessageHistory>(
      getModelToken(SqsMessageHistory)
    );
  });

  afterEach(async () => {
    await awsTestingModule.stop();
  });

  it('should throw validation error if body parsing fails', async () => {
    const command = new DeleteMessageCommand({ QueueUrl: undefined, ReceiptHandle: undefined });

    await expect(sqsClient.send(command)).rejects.toThrow(
      'The input fails to satisfy the constraints specified by an AWS service.'
    );
  });

  it('should throw not found error if queue is not found by url', async () => {
    const sqsQueueStub = generateSqsQueueStub();

    const command = new DeleteMessageCommand({
      QueueUrl: sqsQueueStub.url,
      ReceiptHandle: 'non-existent-receipt-handle',
    });

    await expect(sqsClient.send(command)).rejects.toThrow("The specified queue doesn't exist.");
  });

  it('should throw not found error if message is not found by receipt handle', async () => {
    const sqsQueueStub = await sqsQueueModel.create(
      generateSqsQueueStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
        port: awsTestingModule.configService.getOrThrow('PORT'),
      })
    );

    const command = new DeleteMessageCommand({
      QueueUrl: sqsQueueStub.url,
      ReceiptHandle: 'non-existent-receipt-handle',
    });

    await expect(sqsClient.send(command)).rejects.toThrow(
      "The specified receipt handle isn't valid."
    );
  });

  it('should delete message and save it in message history', async () => {
    const sqsQueueStub = await sqsQueueModel.create(
      generateSqsQueueStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
        port: awsTestingModule.configService.getOrThrow('PORT'),
      })
    );

    const sqsMessageStub = await sqsMessageModel.create(
      generateSqsMessageStub({
        queueUrl: sqsQueueStub.url,
        receiptHandle: faker.string.uuid(),
        receiptHandleSentAt: new Date(),
      })
    );

    const command = new DeleteMessageCommand({
      QueueUrl: sqsQueueStub.url,
      ReceiptHandle: sqsMessageStub.receiptHandle,
    });

    await sqsClient.send(command);

    expect(
      await sqsMessageModel.findOne({ where: { messageId: sqsMessageStub.messageId } })
    ).toBeNull();
    expect(
      await sqsMessageHistoryModel.findOne({
        where: { messageId: sqsMessageStub.messageId },
      })
    ).not.toBeNull();
  });
});
