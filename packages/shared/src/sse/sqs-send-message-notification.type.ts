import { SqsMessageDto } from '../dtos/sqs-message.dto';
import { SseNotificationType } from './sse-notification-type.enum';

export type SqsMessageUpdateNotification = {
  type: SseNotificationType.SqsMessageUpdate;
  payload: SqsMessageDto;
};
