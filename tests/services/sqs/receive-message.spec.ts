import { SQSClient, ReceiveMessageCommand } from '@aws-sdk/client-sqs';
import { TestingModule } from '@/tests/utils/testing-module';
import { sqsQueueDb } from '@/services/sqs/dbs/sqs-queue.db';
import { sqsMessageDb } from '@/services/sqs/dbs/sqs-message.db';
import { generateSqsMessageStub } from '@/services/sqs/stubs/generate-sqs-message.stub';
import { generateSqsQueueStub } from '@/services/sqs/stubs/generate-sqs-queue.stub';
import { faker } from '@faker-js/faker';

describe('SQS - ReceiveMessage', () => {
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
    const command = new ReceiveMessageCommand({ QueueUrl: undefined });

    await expect(sqsClient.send(command)).rejects.toThrow(
      'The input fails to satisfy the constraints specified by an AWS service.'
    );
  });

  it('should throw error if queue is not found by url', async () => {
    const command = new ReceiveMessageCommand({
      QueueUrl: `http://sqs.${process.env.AWS_REGION}.localhost:${process.env.PORT}/${process.env.AWS_USER_ID}/non-existing-queue`,
    });

    await expect(sqsClient.send(command)).rejects.toThrow("The specified queue doesn't exist.");
  });

  it('should not return any messages if no messages are found', async () => {
    const queueStub = generateSqsQueueStub();

    const command = new ReceiveMessageCommand({
      QueueUrl: queueStub.url,
    });

    jest.spyOn(sqsQueueDb, 'getFirstByKeyValue').mockReturnValueOnce(queueStub);
    jest.spyOn(sqsMessageDb, 'getAllByKeyValue').mockReturnValue([]);

    const response = await sqsClient.send(command);
    expect(response).not.toHaveProperty('Messages');
  });

  it('should return messages (defaults to 1 message) sorted by createdAt that are found and also set their receiptHandle', async () => {
    const queueStub = generateSqsQueueStub();
    const receiptHandleStub = faker.string.uuid();

    const now = new Date();

    const messagesStub = [
      generateSqsMessageStub({
        queueUrl: queueStub.url,
        createdAt: new Date(now.getTime() - 120 * 1000),
      }),
      generateSqsMessageStub({
        queueUrl: queueStub.url,
        createdAt: new Date(now.getTime() - 180 * 1000),
      }),
    ];

    jest.spyOn(sqsQueueDb, 'getFirstByKeyValue').mockReturnValueOnce({ ...queueStub });
    jest.spyOn(sqsMessageDb, 'getAllByKeyValue').mockReturnValue([...messagesStub]);
    jest.spyOn(sqsMessageDb, 'updateFirstByKeyValue').mockImplementation(({ key, value, data }) => {
      const foundMessage = messagesStub.find((e) => e[key] === value)!;
      return { ...foundMessage, ...data, receiptHandle: receiptHandleStub };
    });

    const command = new ReceiveMessageCommand({
      QueueUrl: queueStub.url,
    });

    const response = await sqsClient.send(command);

    expect(response).toHaveProperty('Messages');
    expect(response.Messages).toHaveLength(1);
    expect(response.Messages![0].MessageId).toBe(messagesStub[1].messageId);
    expect(response.Messages![0].Body).toBe(messagesStub[1].messageBody);
    expect(response.Messages![0].MD5OfBody).toBe(messagesStub[1].md5OfMessageBody);
    expect(response.Messages![0].ReceiptHandle).toBe(receiptHandleStub);
  });

  it('should return multiple messages sorted by createdAt that are found and also set their receiptHandle', async () => {
    const queueStub = generateSqsQueueStub();
    const receiptHandleStub = faker.string.uuid();

    const now = new Date();

    const messagesStub = [
      generateSqsMessageStub({
        queueUrl: queueStub.url,
        createdAt: new Date(now.getTime() - 120 * 1000),
      }),
      generateSqsMessageStub({
        queueUrl: queueStub.url,
        createdAt: new Date(now.getTime() - 180 * 1000),
      }),
    ];

    jest.spyOn(sqsQueueDb, 'getFirstByKeyValue').mockReturnValueOnce({ ...queueStub });
    jest.spyOn(sqsMessageDb, 'getAllByKeyValue').mockReturnValue([...messagesStub]);
    jest.spyOn(sqsMessageDb, 'updateFirstByKeyValue').mockImplementation(({ key, value, data }) => {
      const foundMessage = messagesStub.find((e) => e[key] === value)!;
      return { ...foundMessage, ...data, receiptHandle: receiptHandleStub };
    });

    const command = new ReceiveMessageCommand({
      QueueUrl: queueStub.url,
      MaxNumberOfMessages: 5,
    });

    const response = await sqsClient.send(command);

    expect(response).toHaveProperty('Messages');
    expect(response.Messages).toHaveLength(2);
    expect(response.Messages![0].MessageId).toBe(messagesStub[1].messageId);
    expect(response.Messages![0].Body).toBe(messagesStub[1].messageBody);
    expect(response.Messages![0].MD5OfBody).toBe(messagesStub[1].md5OfMessageBody);
    expect(response.Messages![0].ReceiptHandle).toBe(receiptHandleStub);
    expect(response.Messages![1].MessageId).toBe(messagesStub[0].messageId);
    expect(response.Messages![1].Body).toBe(messagesStub[0].messageBody);
    expect(response.Messages![1].MD5OfBody).toBe(messagesStub[0].md5OfMessageBody);
    expect(response.Messages![1].ReceiptHandle).toBe(receiptHandleStub);
  });

  it('should only return messages that are ready', async () => {
    const queueStub = generateSqsQueueStub();
    const receiptHandleStub = faker.string.uuid();

    const now = new Date();

    const messagesStub = [
      generateSqsMessageStub({
        queueUrl: queueStub.url,
        createdAt: now,
        delaySeconds: 60,
      }),
      generateSqsMessageStub({
        queueUrl: queueStub.url,
        createdAt: new Date(now.getTime() - 180 * 1000),
      }),
    ];

    jest.spyOn(sqsQueueDb, 'getFirstByKeyValue').mockReturnValueOnce({ ...queueStub });
    jest.spyOn(sqsMessageDb, 'getAllByKeyValue').mockReturnValue([...messagesStub]);
    jest.spyOn(sqsMessageDb, 'updateFirstByKeyValue').mockImplementation(({ key, value, data }) => {
      const foundMessage = messagesStub.find((e) => e[key] === value)!;
      return { ...foundMessage, ...data, receiptHandle: receiptHandleStub };
    });

    const command = new ReceiveMessageCommand({
      QueueUrl: queueStub.url,
      MaxNumberOfMessages: 5,
    });

    const response = await sqsClient.send(command);

    expect(response).toHaveProperty('Messages');
    expect(response.Messages).toHaveLength(1);
    expect(response.Messages![0].MessageId).toBe(messagesStub[1].messageId);
    expect(response.Messages![0].Body).toBe(messagesStub[1].messageBody);
    expect(response.Messages![0].MD5OfBody).toBe(messagesStub[1].md5OfMessageBody);
    expect(response.Messages![0].ReceiptHandle).toBe(receiptHandleStub);
  });

  it('should only return messages that do not have receipt handle in db yet', async () => {
    const queueStub = generateSqsQueueStub();
    const receiptHandleStub = faker.string.uuid();

    const now = new Date();

    const messagesStub = [
      generateSqsMessageStub({
        queueUrl: queueStub.url,
        receiptHandle: faker.string.uuid(),
        receiptHandleSentAt: new Date(),
        createdAt: new Date(now.getTime() - 180 * 1000),
      }),
      generateSqsMessageStub({
        queueUrl: queueStub.url,
        createdAt: new Date(now.getTime() - 180 * 1000),
      }),
    ];

    jest.spyOn(sqsQueueDb, 'getFirstByKeyValue').mockReturnValueOnce({ ...queueStub });
    jest.spyOn(sqsMessageDb, 'getAllByKeyValue').mockReturnValue([...messagesStub]);
    jest.spyOn(sqsMessageDb, 'updateFirstByKeyValue').mockImplementation(({ key, value, data }) => {
      const foundMessage = messagesStub.find((e) => e[key] === value)!;
      return { ...foundMessage, ...data, receiptHandle: receiptHandleStub };
    });

    const command = new ReceiveMessageCommand({
      QueueUrl: queueStub.url,
      MaxNumberOfMessages: 5,
    });

    const response = await sqsClient.send(command);

    expect(response).toHaveProperty('Messages');
    expect(response.Messages).toHaveLength(1);
    expect(response.Messages![0].MessageId).toBe(messagesStub[1].messageId);
    expect(response.Messages![0].Body).toBe(messagesStub[1].messageBody);
    expect(response.Messages![0].MD5OfBody).toBe(messagesStub[1].md5OfMessageBody);
    expect(response.Messages![0].ReceiptHandle).toBe(receiptHandleStub);
  });

  it('should poll for messages if queue is currently empty', async () => {
    const queueStub = generateSqsQueueStub();
    const receiptHandleStub = faker.string.uuid();

    const now = new Date();

    const messagesStub = [
      generateSqsMessageStub({
        queueUrl: queueStub.url,
        createdAt: new Date(now.getTime() - 120 * 1000),
      }),
      generateSqsMessageStub({
        queueUrl: queueStub.url,
        createdAt: new Date(now.getTime() - 180 * 1000),
      }),
    ];

    jest.spyOn(sqsQueueDb, 'getFirstByKeyValue').mockReturnValueOnce({ ...queueStub });
    jest
      .spyOn(sqsMessageDb, 'getAllByKeyValue')
      .mockReturnValueOnce([]) // Initial get all messages
      .mockReturnValueOnce([]) // Get mesages at 1 second poll
      .mockReturnValue([...messagesStub]); // Everything after the 1 second poll
    jest.spyOn(sqsMessageDb, 'updateFirstByKeyValue').mockImplementation(({ key, value, data }) => {
      const foundMessage = messagesStub.find((e) => e[key] === value)!;
      return { ...foundMessage, ...data, receiptHandle: receiptHandleStub };
    });

    const command = new ReceiveMessageCommand({
      QueueUrl: queueStub.url,
      WaitTimeSeconds: 5,
    });

    const response = await sqsClient.send(command);

    expect(response).toHaveProperty('Messages');
    expect(response.Messages).toHaveLength(1);
    expect(response.Messages![0].MessageId).toBe(messagesStub[1].messageId);
    expect(response.Messages![0].Body).toBe(messagesStub[1].messageBody);
    expect(response.Messages![0].MD5OfBody).toBe(messagesStub[1].md5OfMessageBody);
    expect(response.Messages![0].ReceiptHandle).toBe(receiptHandleStub);
  });

  describe('message attributes', () => {
    it('should return all message attributes if all are requested', async () => {
      const queueStub = generateSqsQueueStub();
      const receiptHandleStub = faker.string.uuid();

      const now = new Date();

      const messagesStub = [
        generateSqsMessageStub({
          queueUrl: queueStub.url,
          messageAttributes: [
            {
              name: 'Type',
              value: {
                dataType: 'String',
                stringValue: 'AudioFormatConvert',
              },
            },
            {
              name: 'Processor',
              value: {
                dataType: 'String',
                stringValue: 'Fast',
              },
            },
          ],
          createdAt: new Date(now.getTime() - 180 * 1000),
        }),
      ];

      jest.spyOn(sqsQueueDb, 'getFirstByKeyValue').mockReturnValueOnce({ ...queueStub });
      jest.spyOn(sqsMessageDb, 'getAllByKeyValue').mockReturnValue([...messagesStub]);
      jest
        .spyOn(sqsMessageDb, 'updateFirstByKeyValue')
        .mockImplementation(({ key, value, data }) => {
          const foundMessage = messagesStub.find((e) => e[key] === value)!;
          return { ...foundMessage, ...data, receiptHandle: receiptHandleStub };
        });

      const command = new ReceiveMessageCommand({
        QueueUrl: queueStub.url,
        MessageAttributeNames: ['All'],
      });

      const response = await sqsClient.send(command);

      expect(response).toHaveProperty('Messages');
      expect(response.Messages).toHaveLength(1);
      expect(response.Messages![0].MessageId).toBe(messagesStub[0].messageId);
      expect(response.Messages![0].Body).toBe(messagesStub[0].messageBody);
      expect(response.Messages![0].MD5OfBody).toBe(messagesStub[0].md5OfMessageBody);
      expect(response.Messages![0].ReceiptHandle).toBe(receiptHandleStub);
      expect(response.Messages![0].MessageAttributes).toBeTruthy();
      expect(response.Messages![0].MessageAttributes!.Type).toMatchObject({
        DataType: 'String',
        StringValue: 'AudioFormatConvert',
      });
      expect(response.Messages![0].MessageAttributes!.Processor).toMatchObject({
        DataType: 'String',
        StringValue: 'Fast',
      });
    });

    it('should return only requested message attributes', async () => {
      const queueStub = generateSqsQueueStub();
      const receiptHandleStub = faker.string.uuid();

      const now = new Date();

      const messagesStub = [
        generateSqsMessageStub({
          queueUrl: queueStub.url,
          messageAttributes: [
            {
              name: 'Type',
              value: {
                dataType: 'String',
                stringValue: 'AudioFormatConvert',
              },
            },
            {
              name: 'Processor',
              value: {
                dataType: 'String',
                stringValue: 'Fast',
              },
            },
          ],
          createdAt: new Date(now.getTime() - 180 * 1000),
        }),
      ];

      jest.spyOn(sqsQueueDb, 'getFirstByKeyValue').mockReturnValueOnce({ ...queueStub });
      jest.spyOn(sqsMessageDb, 'getAllByKeyValue').mockReturnValue([...messagesStub]);
      jest
        .spyOn(sqsMessageDb, 'updateFirstByKeyValue')
        .mockImplementation(({ key, value, data }) => {
          const foundMessage = messagesStub.find((e) => e[key] === value)!;
          return { ...foundMessage, ...data, receiptHandle: receiptHandleStub };
        });

      const command = new ReceiveMessageCommand({
        QueueUrl: queueStub.url,
        MessageAttributeNames: ['Processor'],
      });

      const response = await sqsClient.send(command);

      expect(response).toHaveProperty('Messages');
      expect(response.Messages).toHaveLength(1);
      expect(response.Messages![0].MessageId).toBe(messagesStub[0].messageId);
      expect(response.Messages![0].Body).toBe(messagesStub[0].messageBody);
      expect(response.Messages![0].MD5OfBody).toBe(messagesStub[0].md5OfMessageBody);
      expect(response.Messages![0].ReceiptHandle).toBe(receiptHandleStub);
      expect(response.Messages![0].MessageAttributes).toBeTruthy();
      expect(response.Messages![0].MessageAttributes).not.toHaveProperty('Type');
      expect(response.Messages![0].MessageAttributes!.Processor).toMatchObject({
        DataType: 'String',
        StringValue: 'Fast',
      });
    });
  });
});
