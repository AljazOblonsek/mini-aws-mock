import { SqsMessage } from '@/src/modules/sqs/entities/sqs-message.entity';
import { SqsQueue } from '@/src/modules/sqs/entities/sqs-queue.entity';
import { generateSqsQueueStub } from '@/src/modules/sqs/mock/stubs/sqs-queue.stub';
import { AwsTestingModule } from '@/test/utils/aws-testing-module';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { faker } from '@faker-js/faker';
import { getModelToken } from '@nestjs/sequelize';
import { createHash } from 'crypto';

describe('SQS - SendMessage', () => {
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
    const command = new SendMessageCommand({ QueueUrl: undefined, MessageBody: undefined });

    await expect(sqsClient.send(command)).rejects.toThrow(
      'The input fails to satisfy the constraints specified by an AWS service.'
    );
  });

  it('should throw not found error if queue is not found by url', async () => {
    const sqsQueueStub = generateSqsQueueStub();

    const command = new SendMessageCommand({
      QueueUrl: sqsQueueStub.url,
      MessageBody: faker.lorem.paragraph(),
    });

    await expect(sqsClient.send(command)).rejects.toThrow("The specified queue doesn't exist.");
  });

  it('should throw validation error if message body is too big', async () => {
    const sqsQueueStub = await sqsQueueModel.create(
      generateSqsQueueStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
        port: awsTestingModule.configService.getOrThrow('PORT'),
        maximumMessageSize: 1024,
      })
    );

    const command = new SendMessageCommand({
      QueueUrl: sqsQueueStub.url,
      MessageBody: faker.string.alphanumeric({ length: 2048 }),
    });

    await expect(sqsClient.send(command)).rejects.toThrow('MessageBody is too big.');
  });

  it('should add message and return message id and md5 of message body', async () => {
    const sqsQueueStub = await sqsQueueModel.create(
      generateSqsQueueStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
        port: awsTestingModule.configService.getOrThrow('PORT'),
      })
    );

    const messageBodyStub = {
      file: 'far-beyond-the-sun.mp3',
      convertToFormat: 'aac',
    };

    const command = new SendMessageCommand({
      QueueUrl: sqsQueueStub.url,
      MessageBody: JSON.stringify(messageBodyStub),
    });

    const response = await sqsClient.send(command);

    expect(response).toHaveProperty('MessageId');
    expect(response).toHaveProperty(
      'MD5OfMessageBody',
      createHash('md5').update(JSON.stringify(messageBodyStub)).digest('hex')
    );
    expect(response).not.toHaveProperty('MD5OfMessageAttributes');

    expect(
      await sqsMessageModel.findOne({ where: { messageId: response.MessageId } })
    ).not.toBeNull();
  });

  it('should add message and return message id, md5 of message body and md5 of message attributes', async () => {
    const sqsQueueStub = await sqsQueueModel.create(
      generateSqsQueueStub({
        region: awsTestingModule.configService.getOrThrow('AWS_REGION'),
        userId: awsTestingModule.configService.getOrThrow('AWS_USER_ID'),
        port: awsTestingModule.configService.getOrThrow('PORT'),
      })
    );

    const messageBodyStub = {
      file: 'far-beyond-the-sun.mp3',
      convertToFormat: 'aac',
    };

    // Ths order of keys in each attribute matters for this e2e test
    // Looks like AWS SDK does some sorting under the hood (e.g. if DataType is before StringValue - the SDK puts StringValue first isntead if the dictionary)
    const messageAttributesStub = {
      Type: {
        StringValue: 'AudioFormatConvert',
        DataType: 'String',
      },
      Processor: {
        StringValue: 'Fast',
        DataType: 'String',
      },
    };

    const command = new SendMessageCommand({
      QueueUrl: sqsQueueStub.url,
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
      createHash('md5').update(JSON.stringify(messageAttributesStub)).digest('hex')
    );

    expect(
      await sqsMessageModel.findOne({ where: { messageId: response.MessageId } })
    ).not.toBeNull();
  });
});
