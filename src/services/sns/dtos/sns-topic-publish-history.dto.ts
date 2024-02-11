import { CamelCaseProperties } from '@/core';
import { SnsTopicPublishHistory } from '../types/sns-topic-publish-history.type';

export type SnsTopicPublicHistoryDto = CamelCaseProperties<SnsTopicPublishHistory>;

export const transformSnsTopicPublishHistoryToDto = (
  snsTopicPublishHistory: SnsTopicPublishHistory
): SnsTopicPublicHistoryDto => {
  return {
    messageId: snsTopicPublishHistory.MessageId,
    topicArn: snsTopicPublishHistory.TopicArn,
    message: snsTopicPublishHistory.Message,
    messageAttributes: snsTopicPublishHistory.MessageAttributes,
    messageDeduplicationId: snsTopicPublishHistory.MessageDeduplicationId,
    messageGroupId: snsTopicPublishHistory.MessageGroupId,
    messageStructure: snsTopicPublishHistory.MessageStructure,
    phoneNumber: snsTopicPublishHistory.PhoneNumber,
    subject: snsTopicPublishHistory.Subject,
    targetArn: snsTopicPublishHistory.TargetArn,
    createdAt: snsTopicPublishHistory.CreatedAt,
  };
};
