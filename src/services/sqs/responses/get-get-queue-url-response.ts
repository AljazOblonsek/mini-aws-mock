import { XMLBuilder } from 'fast-xml-parser';

type GetGetQueueUrlResponseOptions = {
  requestId: string;
  queueUrl: string;
};

export const getGetQueueUrlResponse = ({
  requestId,
  queueUrl,
}: GetGetQueueUrlResponseOptions): string => {
  const options = {
    ignoreAttributes: false,
    format: true,
  };

  const builder = new XMLBuilder(options);
  const xmlDataStr = builder.build({
    GetQueueUrlResponse: {
      '@_xmlns': 'http://sns.amazonaws.com/doc/2012-11-05/',
      GetQueueUrlResult: {
        QueueUrl: queueUrl,
      },
      ResponseMetadata: {
        RequestId: requestId,
      },
    },
  });

  return xmlDataStr;
};
