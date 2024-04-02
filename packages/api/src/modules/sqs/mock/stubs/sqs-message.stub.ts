import { WithoutModel } from '@/src/common/core';
import { SqsMessage } from '../../entities/sqs-message.entity';
import { StubBaseOptions } from '@/src/common/mock';
import { faker } from '@faker-js/faker';
import { createHash } from 'crypto';

export const generateSqsMessageStub = (
  data: Partial<WithoutModel<SqsMessage>> & Partial<StubBaseOptions>
): WithoutModel<SqsMessage> => {
  const messageBodyStub = data.messageBody || faker.lorem.paragraph();

  const defaultOptions: WithoutModel<SqsMessage> = {
    messageId: faker.string.uuid(),
    messageBody: messageBodyStub,
    md5OfMessageBody: createHash('md5').update(messageBodyStub).digest('hex'),
    visibilityTimeout: 30,
    queueUrl: faker.internet.url(),
    createdAt: faker.date.recent(),
  };

  return { ...defaultOptions, ...data };
};
