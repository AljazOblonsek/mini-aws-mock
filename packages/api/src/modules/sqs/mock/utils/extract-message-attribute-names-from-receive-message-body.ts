import { AwsRequestType } from '@/src/common/mock';

type ExtractMessageAttributeNamesFromReceiveMessageBodyOptions = {
  type: AwsRequestType;
  body: Record<string, unknown>;
};

const extractMessageAttributeNamesFromXmlReceiveMessageBody = (
  body: Record<string, unknown>
): string[] | undefined => {
  const messageAttributeNames: string[] = [];

  for (let i = 1; i <= 50; i++) {
    const name = body[`MessageAttributeName.${i}`];

    if (!name) {
      break;
    }

    messageAttributeNames.push(name as string);
  }

  if (messageAttributeNames.length <= 0) {
    return undefined;
  }

  return messageAttributeNames;
};

const extractMessageAttributeNamesFromJsonReceiveMessageBody = (
  body: Record<string, unknown>
): string[] | undefined => {
  if ('MessageAttributeNames' in body) {
    return body.MessageAttributeNames as string[];
  }

  return undefined;
};

export const extractMessageAttributeNamesFromReceiveMessageBody = ({
  type,
  body,
}: ExtractMessageAttributeNamesFromReceiveMessageBodyOptions): string[] | undefined => {
  if (type === AwsRequestType.XmlRequest) {
    return extractMessageAttributeNamesFromXmlReceiveMessageBody(body);
  } else {
    return extractMessageAttributeNamesFromJsonReceiveMessageBody(body);
  }
};
