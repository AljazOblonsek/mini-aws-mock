import { AwsRequestType, MessageAttributeValueDto } from '@/src/common/mock';

type ExtractMessageAttributesFromSendMessageBodyOptions = {
  type: AwsRequestType;
  body: Record<string, unknown>;
};

const extractMessageAttributesFromXmlSendMessageBody = (
  body: Record<string, unknown>
): Record<string, MessageAttributeValueDto> | undefined => {
  const messageAttributes: Record<string, MessageAttributeValueDto> = {};

  for (let i = 1; i <= 10; i++) {
    const name = body[`MessageAttribute.${i}.Name`];

    if (!name) {
      break;
    }

    const dataType = body[`MessageAttribute.${i}.Value.DataType`];

    const stringValue = body[`MessageAttribute.${i}.Value.StringValue`];
    const binaryValue = body[`MessageAttribute.${i}.Value.BinaryValue`];

    const messageAttribute: MessageAttributeValueDto = {
      DataType: dataType as string,
    };

    if (stringValue) {
      messageAttribute.StringValue = stringValue as string;
    }

    if (binaryValue) {
      messageAttribute.BinaryValue = binaryValue as string;
    }

    messageAttributes[name as string] = messageAttribute;
  }

  return Object.keys(messageAttributes).length > 0 ? messageAttributes : undefined;
};

const extractMessageAttributesFromJsonSendMessageBody = (
  body: Record<string, unknown>
): Record<string, MessageAttributeValueDto> | undefined => {
  if ('MessageAttributes' in body) {
    return { ...(body as { MessageAttributes: object }).MessageAttributes } as Record<
      string,
      MessageAttributeValueDto
    >;
  }

  return undefined;
};

export const extractMessageAttributesFromSendMessageBody = ({
  type,
  body,
}: ExtractMessageAttributesFromSendMessageBodyOptions):
  | Record<string, MessageAttributeValueDto>
  | undefined => {
  if (type === AwsRequestType.XmlRequest) {
    return extractMessageAttributesFromXmlSendMessageBody(body);
  } else {
    return extractMessageAttributesFromJsonSendMessageBody(body);
  }
};
