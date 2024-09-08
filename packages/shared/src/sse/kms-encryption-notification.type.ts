import { KmsEncryptionHistoryDto } from '../dtos';
import { SseNotificationType } from './sse-notification-type.enum';

export type KmsEncryptionNotification = {
  type: SseNotificationType.KmsEncryption;
  payload: KmsEncryptionHistoryDto;
};
