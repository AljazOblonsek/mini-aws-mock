import { SQSClient, DeleteMessageCommand, ReceiptHandleIsInvalid } from '@aws-sdk/client-sqs';
import { TestingModule } from '@/tests/utils/testing-module';
import { sqsQueueDb } from '@/services/sqs/dbs/sqs-queue.db';
import { generateSqsQueueStub } from '@/services/sqs/stubs/generate-sqs-queue.stub';
import { sqsMessageDb } from '@/services/sqs/dbs/sqs-message.db';
import { generateSqsMessageStub } from '@/services/sqs/stubs/generate-sqs-message.stub';
import { sqsMessageHistoryDb } from '@/services/sqs/dbs/sqs-message-history.db';
import { faker } from '@faker-js/faker';

describe('SQS - DeleteMessage', () => {
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
    const command = new DeleteMessageCommand({ QueueUrl: undefined, ReceiptHandle: undefined });

    await expect(sqsClient.send(command)).rejects.toThrow(
      'The input fails to satisfy the constraints specified by an AWS service.'
    );
  });

  it('should throw not found error if queue is not found by url', async () => {
    const command = new DeleteMessageCommand({
      QueueUrl: `http://sqs.${process.env.AWS_REGION}.localhost:${process.env.PORT}/${process.env.AWS_USER_ID}/non-existing-queue`,
      ReceiptHandle: 'non-existent-receipt-handle',
    });

    await expect(sqsClient.send(command)).rejects.toThrow("The specified queue doesn't exist.");
  });

  it('should throw not found error if message is not found by receipt handle', async () => {
    const queueStub = generateSqsQueueStub();

    jest.spyOn(sqsQueueDb, 'getFirstByKeyValue').mockReturnValueOnce(queueStub);
    jest.spyOn(sqsMessageDb, 'getFirstByKeyValue').mockReturnValueOnce(null);

    const command = new DeleteMessageCommand({
      QueueUrl: queueStub.url,
      ReceiptHandle: 'non-existent-receipt-handle',
    });

    await expect(sqsClient.send(command)).rejects.toThrow(
      "The specified receipt handle isn't valid."
    );
  });

  it('should delete message and save it in message history', async () => {
    const queueStub = generateSqsQueueStub();
    const messageStub = generateSqsMessageStub({
      receiptHandle: faker.string.uuid(),
      receiptHandleSentAt: new Date(),
    });

    jest.spyOn(sqsQueueDb, 'getFirstByKeyValue').mockReturnValueOnce(queueStub);
    jest.spyOn(sqsMessageDb, 'getFirstByKeyValue').mockReturnValueOnce(messageStub);
    const messgeDbDeleteByKeyValueSpy = jest.spyOn(sqsMessageDb, 'deleteByKeyValue');
    messgeDbDeleteByKeyValueSpy.mockReturnValueOnce(1);
    const messageHistoryDbCreateSpy = jest.spyOn(sqsMessageHistoryDb, 'create');

    const command = new DeleteMessageCommand({
      QueueUrl: queueStub.url,
      ReceiptHandle: messageStub.receiptHandle,
    });

    await sqsClient.send(command);

    expect(messgeDbDeleteByKeyValueSpy).toHaveBeenCalledTimes(1);
    expect(messgeDbDeleteByKeyValueSpy).toHaveBeenCalledWith({
      key: 'receiptHandle',
      value: command.input.ReceiptHandle,
    });
    expect(messageHistoryDbCreateSpy).toHaveBeenCalledTimes(1);
    expect(messageHistoryDbCreateSpy).toHaveBeenCalledWith({
      ...messageStub,
      deletedAt: expect.any(Date),
    });
  });
});
