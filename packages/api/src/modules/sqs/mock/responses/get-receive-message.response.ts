import { WithoutModel } from '@/src/common/core';
import { AwsRequestType, MessageAttributeValueDto } from '@/src/common/mock';
import { XMLBuilder } from 'fast-xml-parser';
import { SqsMessage } from '../../entities/sqs-message.entity';

type GetReceiveMessageResponseOptions = {
  type: AwsRequestType;
  requestId: string;
  messages?: Array<WithoutModel<SqsMessage>>;
  messageAttributeNames?: string[];
};

const getMessageAttributesForXmlMessage = (
  message: WithoutModel<SqsMessage>,
  messageAttributeNames?: string[]
) => {
  if (!messageAttributeNames) {
    return undefined;
  }

  if (!message.messageAttributes) {
    return undefined;
  }

  const messageAttributes: Record<string, MessageAttributeValueDto> = JSON.parse(
    message.messageAttributes
  );

  if (messageAttributeNames.includes('All')) {
    return Object.keys(messageAttributes).map((e) => ({
      Name: e,
      Value: {
        DataType: messageAttributes[e].DataType,
        StringValue: messageAttributes[e].StringValue,
        BinaryValue: messageAttributes[e].BinaryValue,
      },
    }));
  }

  return Object.keys(messageAttributes)
    .filter((e) => messageAttributeNames.includes(e))
    .map((e) => ({
      Name: e,
      Value: {
        DataType: messageAttributes[e].DataType,
        StringValue: messageAttributes[e].StringValue,
        BinaryValue: messageAttributes[e].BinaryValue,
      },
    }));
};

const getReceiveMessageXmlResponse = ({
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
              MessageAttribute: getMessageAttributesForXmlMessage(e, messageAttributeNames),
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

const getMessageAttributesForJsonMessage = (
  message: WithoutModel<SqsMessage>,
  messageAttributeNames?: string[]
) => {
  if (!messageAttributeNames) {
    return undefined;
  }

  if (!message.messageAttributes) {
    return undefined;
  }

  const messageAttributes: Record<string, MessageAttributeValueDto> = JSON.parse(
    message.messageAttributes
  );

  if (messageAttributeNames.includes('All')) {
    return Object.keys(messageAttributes).reduce((accumulator, currentValue) => {
      return {
        ...accumulator,
        [currentValue]: {
          DataType: messageAttributes[currentValue].DataType,
          StringValue: messageAttributes[currentValue].StringValue,
          BinaryValue: messageAttributes[currentValue].BinaryValue,
        },
      };
    }, {});
  }

  return Object.keys(messageAttributes)
    .filter((e) => messageAttributeNames.includes(e))
    .reduce((accumulator, currentValue) => {
      return {
        ...accumulator,
        [currentValue]: {
          DataType: messageAttributes[currentValue].DataType,
          StringValue: messageAttributes[currentValue].StringValue,
          BinaryValue: messageAttributes[currentValue].BinaryValue,
        },
      };
    }, {});
};

const getReceiveMessageJsonResponse = ({
  messages,
  messageAttributeNames,
}: GetReceiveMessageResponseOptions): object => ({
  Messages: messages?.map((e) => ({
    MessageId: e.messageId,
    ReceiptHandle: e.receiptHandle,
    MD5OfBody: e.md5OfMessageBody,
    Body: e.messageBody,
    // Not completely sure if md5 should be of all attributes or only the ones requested in receive message action
    MD5OfMessageAttributes: messageAttributeNames ? e.md5OfMessageAttributes : undefined,
    MessageAttributes: getMessageAttributesForJsonMessage(e, messageAttributeNames),
  })),
});

export const getReceiveMessageResponse = (
  options: GetReceiveMessageResponseOptions
): string | object => {
  if (options.type === AwsRequestType.XmlRequest) {
    return getReceiveMessageXmlResponse(options);
  } else {
    return getReceiveMessageJsonResponse(options);
  }
};
