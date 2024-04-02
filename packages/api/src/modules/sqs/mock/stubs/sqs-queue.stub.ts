import { faker } from '@faker-js/faker';
import { WithoutModel } from '@/src/common/core';
import { StubBaseOptions } from '@/src/common/mock';
import { SqsQueue } from '../../entities/sqs-queue.entity';
import { generateQueueUrl } from '../../utils/generate-queue-url';
import { generateQueueArn } from '../../utils/generate-queue-arn';
import { SQS_QUEUE_CONSTANTS } from '@mini-aws-mock/shared';

export const generateSqsQueueStub = (
  data: Partial<WithoutModel<SqsQueue>> & Partial<StubBaseOptions> = {}
): WithoutModel<SqsQueue> => {
  const queueName = data.name || faker.word.sample();

  const defaultOptions: WithoutModel<SqsQueue> = {
    name: queueName,
    url: generateQueueUrl({
      region: data.region || faker.location.country(),
      userId: data.userId || faker.number.int().toString(),
      name: queueName,
      port: data.port || 8000,
    }),
    arn: generateQueueArn({
      region: data.region || faker.location.country(),
      userId: data.userId || faker.number.int().toString(),
      name: queueName,
    }),
    visibilityTimeout: faker.number.int({
      min: 0,
      max: SQS_QUEUE_CONSTANTS.MaximumVisibilityTimeoutInSeconds,
    }),
    receiveMessageWaitTimeSeconds: faker.number.int({
      min: 0,
      max: SQS_QUEUE_CONSTANTS.MaximumReceiveMessageWaitTimeInSeconds,
    }),
    maximumMessageSize: faker.number.int({
      min: SQS_QUEUE_CONSTANTS.MinimumMessageSizeInBytes,
      max: SQS_QUEUE_CONSTANTS.MaximumMessageSizeInBytes,
    }),
  };

  return { ...defaultOptions, ...data };
};
