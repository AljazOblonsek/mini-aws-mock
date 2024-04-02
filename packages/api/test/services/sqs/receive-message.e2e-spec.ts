import { SqsMessage } from '@/src/modules/sqs/entities/sqs-message.entity';
import { SqsQueue } from '@/src/modules/sqs/entities/sqs-queue.entity';
import { generateSqsMessageStub } from '@/src/modules/sqs/mock/stubs/sqs-message.stub';
import { generateSqsQueueStub } from '@/src/modules/sqs/mock/stubs/sqs-queue.stub';
import { AwsTestingModule } from '@/test/utils/aws-testing-module';
import { ReceiveMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { faker } from '@faker-js/faker';
import { getModelToken } from '@nestjs/sequelize';

describe('SQS - ReceiveMessage', () => {
  let awsTestingModule: AwsTestingModule;
  let sqsClient: SQSClient;
  let sqsQueueModel: typeof SqsQueue;
  let sqsMessageModel: typeof SqsMessage;

  beforeEach(async () => {
    awsTestingModule = await new AwsTestingModule().start();

    sqsClient = await awsTestingModule.createAwsClient(SQSClient);

    sqsQueueModel = awsTestingModule.app.get<typeof SqsQueue>(getModelToken(SqsQueue));
    sqsMessageModel = awsTestingModule.app.get<typeof SqsMessage>(getModelToken(SqsMessage));
  });

  afterEach(async () => {
    await awsTestingModule.stop();
  });

  it('should throw validation error if body parsing fails', async () => {
    const command = new ReceiveMessageCommand({ QueueUrl: undefined });

    await expect(sqsClient.send(command)).rejects.toThrow(
      'The input fails to satisfy the constraints specified by an AWS service.'
    );
  });

  it('should throw not found error if queue is not found by url', async () => {
    const sqsQueueStub = generateSqsQueueStub();

    const command = new ReceiveMessageCommand({ QueueUrl: sqsQueueStub.url });

    await expect(sqsClient.send(command)).rejects.toThrow("The specified queue doesn't exist.");
  });

  it('should not return any messages if no messages are found', async () => {
    const sqsQueueStub = await sqsQueueModel.create(
      generateSqsQueueStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
        port: awsTestingModule.configService.getOrThrow('PORT'),
        receiveMessageWaitTimeSeconds: 0,
      })
    );

    const command = new ReceiveMessageCommand({ QueueUrl: sqsQueueStub.url });

    const response = await sqsClient.send(command);
    expect(response).not.toHaveProperty('Messages');
  });

  it('should return messages (defaults to 1 message) sorted by createdAt that are found and also set their receiptHandle', async () => {
    const sqsQueueStub = await sqsQueueModel.create(
      generateSqsQueueStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
        port: awsTestingModule.configService.getOrThrow('PORT'),
        receiveMessageWaitTimeSeconds: 0,
      })
    );

    const now = new Date();

    const sqsMessagesStub = await sqsMessageModel.bulkCreate([
      generateSqsMessageStub({
        queueUrl: sqsQueueStub.url,
        createdAt: new Date(now.getTime() - 120 * 1000),
      }),
      generateSqsMessageStub({
        queueUrl: sqsQueueStub.url,
        createdAt: new Date(now.getTime() - 180 * 1000),
      }),
    ]);

    const command = new ReceiveMessageCommand({
      QueueUrl: sqsQueueStub.url,
    });

    const response = await sqsClient.send(command);

    expect(response).toHaveProperty('Messages');
    expect(response.Messages).toHaveLength(1);
    expect(response.Messages![0].MessageId).toBe(sqsMessagesStub[1].messageId);
    expect(response.Messages![0].Body).toBe(sqsMessagesStub[1].messageBody);
    expect(response.Messages![0].MD5OfBody).toBe(sqsMessagesStub[1].md5OfMessageBody);
    expect(response.Messages![0]).toHaveProperty('ReceiptHandle');
  });

  it('should return multiple messages sorted by createdAt that are found and also set their receiptHandle', async () => {
    const sqsQueueStub = await sqsQueueModel.create(
      generateSqsQueueStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
        port: awsTestingModule.configService.getOrThrow('PORT'),
        receiveMessageWaitTimeSeconds: 0,
      })
    );

    const now = new Date();

    const sqsMessagesStub = await sqsMessageModel.bulkCreate([
      generateSqsMessageStub({
        queueUrl: sqsQueueStub.url,
        createdAt: new Date(now.getTime() - 120 * 1000),
      }),
      generateSqsMessageStub({
        queueUrl: sqsQueueStub.url,
        createdAt: new Date(now.getTime() - 180 * 1000),
      }),
    ]);

    const command = new ReceiveMessageCommand({
      QueueUrl: sqsQueueStub.url,
      MaxNumberOfMessages: 5,
    });

    const response = await sqsClient.send(command);

    expect(response).toHaveProperty('Messages');
    expect(response.Messages).toHaveLength(2);
    expect(response.Messages![0].MessageId).toBe(sqsMessagesStub[1].messageId);
    expect(response.Messages![0].Body).toBe(sqsMessagesStub[1].messageBody);
    expect(response.Messages![0].MD5OfBody).toBe(sqsMessagesStub[1].md5OfMessageBody);
    expect(response.Messages![0]).toHaveProperty('ReceiptHandle');
    expect(response.Messages![1].MessageId).toBe(sqsMessagesStub[0].messageId);
    expect(response.Messages![1].Body).toBe(sqsMessagesStub[0].messageBody);
    expect(response.Messages![1].MD5OfBody).toBe(sqsMessagesStub[0].md5OfMessageBody);
    expect(response.Messages![1]).toHaveProperty('ReceiptHandle');
  });

  it('should only return messages that are ready', async () => {
    const sqsQueueStub = await sqsQueueModel.create(
      generateSqsQueueStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
        port: awsTestingModule.configService.getOrThrow('PORT'),
        receiveMessageWaitTimeSeconds: 0,
      })
    );

    const now = new Date();

    const sqsMessagesStub = await sqsMessageModel.bulkCreate([
      generateSqsMessageStub({
        queueUrl: sqsQueueStub.url,
        createdAt: now,
        delaySeconds: 60,
      }),
      generateSqsMessageStub({
        queueUrl: sqsQueueStub.url,
        createdAt: new Date(now.getTime() - 180 * 1000),
      }),
    ]);

    const command = new ReceiveMessageCommand({
      QueueUrl: sqsQueueStub.url,
      MaxNumberOfMessages: 5,
    });

    const response = await sqsClient.send(command);

    expect(response).toHaveProperty('Messages');
    expect(response.Messages).toHaveLength(1);
    expect(response.Messages![0].MessageId).toBe(sqsMessagesStub[1].messageId);
    expect(response.Messages![0].Body).toBe(sqsMessagesStub[1].messageBody);
    expect(response.Messages![0].MD5OfBody).toBe(sqsMessagesStub[1].md5OfMessageBody);
    expect(response.Messages![0]).toHaveProperty('ReceiptHandle');
  });

  it('should only return messages that do not have receipt handle in db yet', async () => {
    const sqsQueueStub = await sqsQueueModel.create(
      generateSqsQueueStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
        port: awsTestingModule.configService.getOrThrow('PORT'),
        receiveMessageWaitTimeSeconds: 0,
      })
    );

    const now = new Date();

    const sqsMessagesStub = await sqsMessageModel.bulkCreate([
      generateSqsMessageStub({
        queueUrl: sqsQueueStub.url,
        receiptHandle: faker.string.uuid(),
        receiptHandleSentAt: new Date(),
        createdAt: new Date(now.getTime() - 180 * 1000),
      }),
      generateSqsMessageStub({
        queueUrl: sqsQueueStub.url,
        createdAt: new Date(now.getTime() - 180 * 1000),
      }),
    ]);

    const command = new ReceiveMessageCommand({
      QueueUrl: sqsQueueStub.url,
      MaxNumberOfMessages: 5,
    });

    const response = await sqsClient.send(command);

    expect(response).toHaveProperty('Messages');
    expect(response.Messages).toHaveLength(1);
    expect(response.Messages![0].MessageId).toBe(sqsMessagesStub[1].messageId);
    expect(response.Messages![0].Body).toBe(sqsMessagesStub[1].messageBody);
    expect(response.Messages![0].MD5OfBody).toBe(sqsMessagesStub[1].md5OfMessageBody);
    expect(response.Messages![0]).toHaveProperty('ReceiptHandle');
  });

  it('should poll for messages if queue is currently empty', async () => {
    const sqsQueueStub = await sqsQueueModel.create(
      generateSqsQueueStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
        port: awsTestingModule.configService.getOrThrow('PORT'),
      })
    );

    const now = new Date();

    const sqsMessagesStub = await sqsMessageModel.bulkCreate([
      generateSqsMessageStub({
        queueUrl: sqsQueueStub.url,
        createdAt: new Date(now.getTime() - 120 * 1000),
      }),
      generateSqsMessageStub({
        queueUrl: sqsQueueStub.url,
        createdAt: new Date(now.getTime() - 180 * 1000),
      }),
    ]);

    jest
      .spyOn(sqsMessageModel, 'findAll')
      .mockResolvedValueOnce([]) // Mock initial get all messages call to db
      .mockResolvedValueOnce([]); // Mock get all messages at 1 second poll - still empty

    const command = new ReceiveMessageCommand({
      QueueUrl: sqsQueueStub.url,
      WaitTimeSeconds: 5,
    });

    const response = await sqsClient.send(command);

    expect(response).toHaveProperty('Messages');
    expect(response.Messages).toHaveLength(1);
    expect(response.Messages![0].MessageId).toBe(sqsMessagesStub[1].messageId);
    expect(response.Messages![0].Body).toBe(sqsMessagesStub[1].messageBody);
    expect(response.Messages![0].MD5OfBody).toBe(sqsMessagesStub[1].md5OfMessageBody);
    expect(response.Messages![0]).toHaveProperty('ReceiptHandle');
  });

  describe('message attributes', () => {
    it('should return all message attributes if all are requested', async () => {
      const sqsQueueStub = await sqsQueueModel.create(
        generateSqsQueueStub({
          region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
          userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
          port: awsTestingModule.configService.getOrThrow('PORT'),
        })
      );

      const now = new Date();

      const sqsMessagetub = await sqsMessageModel.create(
        generateSqsMessageStub({
          queueUrl: sqsQueueStub.url,
          messageAttributes: JSON.stringify({
            Type: {
              DataType: 'String',
              StringValue: 'AudioFormatConvert',
            },
            Procesor: {
              DataType: 'String',
              StringValue: 'Fast',
            },
          }),
          createdAt: new Date(now.getTime() - 180 * 1000),
        })
      );

      const command = new ReceiveMessageCommand({
        QueueUrl: sqsQueueStub.url,
        MessageAttributeNames: ['All'],
      });

      const response = await sqsClient.send(command);

      expect(response).toHaveProperty('Messages');
      expect(response.Messages).toHaveLength(1);
      expect(response.Messages![0].MessageId).toBe(sqsMessagetub.messageId);
      expect(response.Messages![0].Body).toBe(sqsMessagetub.messageBody);
      expect(response.Messages![0].MD5OfBody).toBe(sqsMessagetub.md5OfMessageBody);
      expect(response.Messages![0]).toHaveProperty('ReceiptHandle');
      expect(response.Messages![0].MessageAttributes).toBeTruthy();
      expect(response.Messages![0].MessageAttributes!.Type).toStrictEqual({
        DataType: 'String',
        StringValue: 'AudioFormatConvert',
      });
      expect(response.Messages![0].MessageAttributes!.Procesor).toStrictEqual({
        DataType: 'String',
        StringValue: 'Fast',
      });
    });

    it('should return only requested message attributes', async () => {
      const sqsQueueStub = await sqsQueueModel.create(
        generateSqsQueueStub({
          region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
          userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
          port: awsTestingModule.configService.getOrThrow('PORT'),
        })
      );

      const now = new Date();

      const sqsMessageStub = await sqsMessageModel.create(
        generateSqsMessageStub({
          queueUrl: sqsQueueStub.url,
          messageAttributes: JSON.stringify({
            Type: {
              DataType: 'String',
              StringValue: 'AudioFormatConvert',
            },
            Procesor: {
              DataType: 'String',
              StringValue: 'Fast',
            },
          }),
          createdAt: new Date(now.getTime() - 180 * 1000),
        })
      );

      const command = new ReceiveMessageCommand({
        QueueUrl: sqsQueueStub.url,
        MessageAttributeNames: ['Procesor'],
      });

      const response = await sqsClient.send(command);

      expect(response).toHaveProperty('Messages');
      expect(response.Messages).toHaveLength(1);
      expect(response.Messages![0].MessageId).toBe(sqsMessageStub.messageId);
      expect(response.Messages![0].Body).toBe(sqsMessageStub.messageBody);
      expect(response.Messages![0].MD5OfBody).toBe(sqsMessageStub.md5OfMessageBody);
      expect(response.Messages![0]).toHaveProperty('ReceiptHandle');
      expect(response.Messages![0].MessageAttributes).toBeTruthy();
      expect(response.Messages![0].MessageAttributes).not.toHaveProperty('Type');
      expect(response.Messages![0].MessageAttributes!.Procesor).toStrictEqual({
        DataType: 'String',
        StringValue: 'Fast',
      });
    });
  });
});
