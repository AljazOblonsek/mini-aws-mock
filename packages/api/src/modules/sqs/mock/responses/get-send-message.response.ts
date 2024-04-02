import { AwsRequestType } from '@/src/common/mock';
import { XMLBuilder } from 'fast-xml-parser';

type GetSendMessageResponseOptions = {
  type: AwsRequestType;
  requestId: string;
  messageId: string;
  md5OfMessageBody: string;
  md5OfMessageAttributes?: string;
};

const getSendMessageXmlResponse = ({
  requestId,
  messageId,
  md5OfMessageBody,
  md5OfMessageAttributes,
}: GetSendMessageResponseOptions): string => {
  const options = {
    ignoreAttributes: false,
    format: true,
  };

  const builder = new XMLBuilder(options);
  const xmlDataStr = builder.build({
    SendMessageResponse: {
      '@_xmlns': 'http://sns.amazonaws.com/doc/2012-11-05/',
      SendMessageResult: {
        MessageId: messageId,
        MD5OfMessageBody: md5OfMessageBody,
        MD5OfMessageAttributes: md5OfMessageAttributes,
      },
      ResponseMetadata: {
        RequestId: requestId,
      },
    },
  });

  return xmlDataStr;
};

const getSendMessageJsonResponse = ({
  messageId,
  md5OfMessageBody,
  md5OfMessageAttributes,
}: GetSendMessageResponseOptions): object => ({
  MessageId: messageId,
  MD5OfMessageBody: md5OfMessageBody,
  MD5OfMessageAttributes: md5OfMessageAttributes,
});

export const getSendMessageResponse = (options: GetSendMessageResponseOptions): string | object => {
  if (options.type === AwsRequestType.XmlRequest) {
    return getSendMessageXmlResponse(options);
  } else {
    return getSendMessageJsonResponse(options);
  }
};
