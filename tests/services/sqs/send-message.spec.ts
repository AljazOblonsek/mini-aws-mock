import { SQSClient, CreateQueueCommand, SendMessageCommand } from '@aws-sdk/client-sqs';
import { TestingModule } from '@/tests/utils/testing-module';
import { SqsQueue } from '@/services/sqs/types/sqs-queue.type';
import { sqsQueueDb } from '@/services/sqs/dbs/sqs-queue.db';
import { createHash } from 'crypto';

describe('SQS - SendMessage', () => {
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
    const command = new SendMessageCommand({ QueueUrl: undefined, MessageBody: undefined });

    await expect(sqsClient.send(command)).rejects.toThrow(
      'The input fails to satisfy the constraints specified by an AWS service.'
    );
  });

  it('should throw error if queue is not found by url', async () => {
    const command = new SendMessageCommand({
      QueueUrl: `http://sqs.${process.env.AWS_REGION}.localhost:${process.env.PORT}/${process.env.AWS_USER_ID}/non-existing-queue`,
      MessageBody: 'My message',
    });

    await expect(sqsClient.send(command)).rejects.toThrow("The specified queue doesn't exist.");
  });

  it('should add message and return message id and md5 of message body', async () => {
    const queueStub: SqsQueue = {
      name: 'audio-processing',
      url: `http://sqs.${process.env.AWS_REGION}.localhost:${process.env.PORT}/${process.env.AWS_USER_ID}/audio-processing`,
      arn: `arn:aws:sqs:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:audio-processing`,
      visibilityTimeout: 30,
      receiveMessageWaitTimeSeconds: 0,
      maximumMessageSize: 262144,
    };

    const messageBodyStub = {
      file: 'far-beyond-the-sun.mp3',
      convertToFormat: 'aac',
    };

    jest.spyOn(sqsQueueDb, 'getFirstByKeyValue').mockReturnValueOnce(queueStub);

    const command = new SendMessageCommand({
      QueueUrl: queueStub.url,
      MessageBody: JSON.stringify(messageBodyStub),
    });

    const response = await sqsClient.send(command);

    expect(response).toHaveProperty('MessageId');
    expect(response).toHaveProperty(
      'MD5OfMessageBody',
      createHash('md5').update(JSON.stringify(messageBodyStub)).digest('hex')
    );
    expect(response).not.toHaveProperty('MD5OfMessageAttributes');
  });

  it('should add message and return message id, md5 of message body and md5 of message attributes', async () => {
    const queueStub: SqsQueue = {
      name: 'audio-processing',
      url: `http://sqs.${process.env.AWS_REGION}.localhost:${process.env.PORT}/${process.env.AWS_USER_ID}/audio-processing`,
      arn: `arn:aws:sqs:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:audio-processing`,
      visibilityTimeout: 30,
      receiveMessageWaitTimeSeconds: 0,
      maximumMessageSize: 262144,
    };

    const messageBodyStub = {
      file: 'far-beyond-the-sun.mp3',
      convertToFormat: 'aac',
    };

    const messageAttributesStub = {
      Type: {
        DataType: 'String',
        StringValue: 'AudioFormatConvert',
      },
      Processor: {
        DataType: 'String',
        StringValue: 'Fast',
      },
    };

    jest.spyOn(sqsQueueDb, 'getFirstByKeyValue').mockReturnValueOnce(queueStub);

    const command = new SendMessageCommand({
      QueueUrl: queueStub.url,
      MessageBody: JSON.stringify(messageBodyStub),
      MessageAttributes: messageAttributesStub,
    });

    const response = await sqsClient.send(command);

    expect(response).toHaveProperty('MessageId');
    expect(response).toHaveProperty(
      'MD5OfMessageBody',
      createHash('md5').update(JSON.stringify(messageBodyStub)).digest('hex')
    );
    expect(response).toHaveProperty(
      'MD5OfMessageAttributes',
      createHash('md5')
        .update(
          JSON.stringify([
            {
              Name: 'Type',
              Value: messageAttributesStub.Type,
            },
            {
              Name: 'Processor',
              Value: messageAttributesStub.Processor,
            },
          ])
        )
        .digest('hex')
    );
  });
});
