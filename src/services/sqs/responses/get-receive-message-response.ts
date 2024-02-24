import { XMLBuilder } from 'fast-xml-parser';
import { SqsMessage } from '../types/sqs-message.type';

type GetReceiveMessageResponseOptions = {
  requestId: string;
  messages?: SqsMessage[];
};

export const getReceiveMessageResponse = ({
  requestId,
  messages,
}: GetReceiveMessageResponseOptions): string => {
  const options = {
    ignoreAttributes: false,
    format: true,
  };

  const builder = new XMLBuilder(options);
  const xmlDataStr = builder.build({
    ReceiveMessageResponse: {
      '@_xmlns': 'http://sns.amazonaws.com/doc/2012-11-05/',
      ReceiveMessageResult: messages
        ? {
            Message: messages.map((e) => ({
              MessageId: e.messageId,
              ReceiptHandle: e.receiptHandle,
              MD5OfBody: e.md5OfMessageBody,
              Body: e.messageBody,
              // TODO: Add message attributes
            })),
          }
        : { Message: undefined },
      ResponseMetadata: {
        RequestId: requestId,
      },
    },
  });

  return xmlDataStr;
};
