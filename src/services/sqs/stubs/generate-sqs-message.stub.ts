import { faker } from '@faker-js/faker';
import { SqsMessage } from '../types/sqs-message.type';
import { createHash } from 'crypto';

export const generateSqsMessageStub = (data: Partial<SqsMessage> = {}): SqsMessage => {
  const messageBody = faker.lorem.paragraph();

  const defaultOptions: SqsMessage = {
    messageId: faker.string.uuid(),
    messageBody,
    md5OfMessageBody: createHash('md5').update(messageBody).digest('hex'),
    delaySeconds: undefined,
    visibilityTimeout: 30,
    messageAttributes: [],
    md5OfMessageAttributes: '',
    receiptHandle: undefined,
    receiptHandleSentAt: undefined,
    queueUrl: faker.internet.url(),
    createdAt: new Date(),
  };

  return { ...defaultOptions, ...data };
};
