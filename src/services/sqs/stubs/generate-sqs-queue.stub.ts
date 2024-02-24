import { faker } from '@faker-js/faker';
import { SqsQueue } from '../types/sqs-queue.type';

const QUEUE_NAMES = ['audio-processing', 'video-processing', 'image-processing'] as const;

export const generateSqsQueueStub = (data: Partial<SqsQueue> = {}): SqsQueue => {
  const queueName = faker.helpers.arrayElement(QUEUE_NAMES);

  const defaultOptions: SqsQueue = {
    name: queueName,
    url: `http://sqs.${process.env.AWS_REGION}.localhost:${process.env.PORT}/${process.env.AWS_USER_ID}/${queueName}`,
    arn: `arn:aws:sqs:${process.env.AWS_REGION}:${process.env.AWS_USER_ID}:${queueName}`,
    visibilityTimeout: 30,
    receiveMessageWaitTimeSeconds: 0,
    maximumMessageSize: 262144,
  };

  return { ...defaultOptions, ...data };
};
