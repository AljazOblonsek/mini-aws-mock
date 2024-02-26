import { SqsMessage } from './sqs-message.type';

export type SqsMessageHistory = SqsMessage & {
  deletedAt: Date;
};
