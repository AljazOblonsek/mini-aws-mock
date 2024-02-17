import { MessageAttribute } from '../types/message-attribute.type';

type ExtractMessageAttributesFromObjectOptions = {
  prefix: string;
  object: Record<string, unknown>;
};

export const extractMessageAttributesFromObject = ({
  prefix,
  object,
}: ExtractMessageAttributesFromObjectOptions): MessageAttribute[] | undefined => {
  const messageAttributes: MessageAttribute[] = [];

  // Max number of attributes is 10
  // More here: https://aws.amazon.com/sqs/faqs/ -> Question: Does Amazon SQS support message metadata?
  for (let i = 1; i <= 10; i++) {
    const name = object[`${prefix}.${i}.Name`];

    if (!name) {
      break;
    }

    const dataType = object[`${prefix}.${i}.Value.DataType`];

    const stringValue = object[`${prefix}.${i}.Value.StringValue`];
    const binaryValue = object[`${prefix}.${i}.Value.BinaryValue`];

    const messageAttribute: MessageAttribute = {
      Name: name as string,
      Value: {
        DataType: dataType as string,
      },
    };

    if (stringValue) {
      messageAttribute.Value.StringValue = stringValue as string;
    }

    if (binaryValue) {
      messageAttribute.Value.BinaryValue = binaryValue as string;
    }

    messageAttributes.push(messageAttribute);
  }

  if (messageAttributes.length <= 0) {
    return undefined;
  }

  return messageAttributes;
};
