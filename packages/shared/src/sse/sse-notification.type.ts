import { KmsEncryptionNotification } from './kms-encryption-notification.type';
import { SnsPublishNotification } from './sns-publish-notification.type';
import { SqsMessageUpdateNotification } from './sqs-send-message-notification.type';

export type SseNotification =
  | SnsPublishNotification
  | SqsMessageUpdateNotification
  | KmsEncryptionNotification;
