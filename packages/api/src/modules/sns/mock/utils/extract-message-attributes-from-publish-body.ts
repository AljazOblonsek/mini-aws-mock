import { MessageAttributeValueDto } from '@/src/common/mock';

export const extractMessageAttributesFromPublishBody = (
  body: Record<string, unknown>
): Record<string, MessageAttributeValueDto> | undefined => {
  const messageAttributes: Record<string, MessageAttributeValueDto> = {};

  for (let i = 1; i <= 10; i++) {
    const name = body[`MessageAttributes.entry.${i}.Name`];

    if (!name) {
      break;
    }

    const dataType = body[`MessageAttributes.entry.${i}.Value.DataType`];

    const stringValue = body[`MessageAttributes.entry.${i}.Value.StringValue`];
    const binaryValue = body[`MessageAttributes.entry.${i}.Value.BinaryValue`];

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

  return messageAttributes || undefined;
};
