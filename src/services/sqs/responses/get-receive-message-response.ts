import { XMLBuilder } from 'fast-xml-parser';
import { SqsMessage } from '../types/sqs-message.type';

const getMessageAttributesForMessage = (message: SqsMessage, messageAttributeNames?: string[]) => {
  if (!messageAttributeNames) {
    return undefined;
  }

  if (messageAttributeNames.includes('All')) {
    return message.messageAttributes.map((e) => ({
      Name: e.name,
      Value: {
        DataType: e.value.dataType,
        StringValue: e.value.stringValue,
        BinaryValue: e.value.binaryValue,
      },
    }));
  }

  return message.messageAttributes
    .filter((e) => messageAttributeNames.includes(e.name))
    .map((e) => ({
      Name: e.name,
      Value: {
        DataType: e.value.dataType,
        StringValue: e.value.stringValue,
        BinaryValue: e.value.binaryValue,
      },
    }));
};

type GetReceiveMessageResponseOptions = {
  requestId: string;
  messages?: SqsMessage[];
  messageAttributeNames?: string[];
};

export const getReceiveMessageResponse = ({
  requestId,
  messages,
  messageAttributeNames,
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
              // Not completely sure if md5 should be of all attributes or only the ones requested in receive message action
              MD5OfMessageAttributes: messageAttributeNames ? e.md5OfMessageAttributes : undefined,
              MessageAttribute: getMessageAttributesForMessage(e, messageAttributeNames),
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
