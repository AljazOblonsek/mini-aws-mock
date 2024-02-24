import { logger } from '@/core';
import { sqsMessageDb } from '../dbs/sqs-message.db';

export const refreshSqsMessageVisbilityJob = () => {
  logger.debug('[SQS] RefreshSqsMessageVisbilityJob - Running refresh sqs message visibility job.');

  const messages = (sqsMessageDb.getAll() || []).filter((e) => e.receiptHandle);

  logger.debug(
    { messages },
    `[SQS] RefreshSqsMessageVisbilityJob - Found ${messages.length} invisible messages.`
  );

  for (const message of messages) {
    if (!message.receiptHandleSentAt) {
      logger.debug(
        { message },
        '[SQS] RefreshSqsMessageVisbilityJob - Found a message with receipt handle but no sent at.'
      );
      continue;
    }

    const now = new Date();

    if (
      new Date(new Date(message.receiptHandleSentAt).getTime() + message.visibilityTimeout * 1000) >
      now
    ) {
      logger.debug(
        { message },
        '[SQS] RefreshSqsMessageVisbilityJob - Message is not yet ready to be set to visible.'
      );
      continue;
    }

    const updatedMessage = sqsMessageDb.updateFirstByKeyValue({
      key: 'messageId',
      value: message.messageId,
      data: { receiptHandle: undefined, receiptHandleSentAt: undefined },
    });

    logger.debug(
      { message, updatedMessage },
      '[SQS] RefreshSqsMessageVisbilityJob - Successfully set message back to visible.'
    );
  }
};

export const startRefreshSqsMessageVisbilityInterval = (intervalInSeconds = 5) => {
  setInterval(refreshSqsMessageVisbilityJob, intervalInSeconds * 1000);
};
