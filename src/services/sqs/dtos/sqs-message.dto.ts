import { SqsMessage } from '../types/sqs-message.type';

export type SqsMessageDto = SqsMessage & {
  isInTransit: boolean;
};
