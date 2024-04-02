import { SnsTopicPublishHistoryDto } from '../dtos/sns-topic-publish-history.dto';
import { SseNotificationType } from './sse-notification-type.enum';

export type SnsPublishNotification = {
  type: SseNotificationType.SnsPublish;
  payload: SnsTopicPublishHistoryDto;
};
