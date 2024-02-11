import { XMLBuilder } from 'fast-xml-parser';

type GetPublishResponseOptions = {
  requestId: string;
  messageId: string;
};

export const getPublishResponse = ({ requestId, messageId }: GetPublishResponseOptions): string => {
  const options = {
    ignoreAttributes: false,
    format: true,
  };

  const builder = new XMLBuilder(options);
  const xmlDataStr = builder.build({
    PublishResponse: {
      '@_xmlns': 'http://sns.amazonaws.com/doc/2010-03-31/',
      PublishResult: {
        MessageId: messageId,
      },
      ResponseMetadata: {
        RequestId: requestId,
      },
    },
  });

  return xmlDataStr;
};
