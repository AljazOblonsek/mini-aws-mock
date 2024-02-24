import { SqsQueue } from '../types/sqs-queue.type';

export type SqsQueueDto = SqsQueue & {
  numberOfMessages: number;
  numberOfMessagesInHistory: number;
};
