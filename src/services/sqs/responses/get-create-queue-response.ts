import { XMLBuilder } from 'fast-xml-parser';

type GetCreateQueueResponseOptions = {
  requestId: string;
  queueUrl: string;
};

export const getCreateQueueResponse = ({
  requestId,
  queueUrl,
}: GetCreateQueueResponseOptions): string => {
  const options = {
    ignoreAttributes: false,
    format: true,
  };

  const builder = new XMLBuilder(options);
  const xmlDataStr = builder.build({
    CreateQueueResponse: {
      '@_xmlns': 'http://sns.amazonaws.com/doc/2012-11-05/',
      CreateQueueResult: {
        QueueUrl: queueUrl,
      },
      ResponseMetadata: {
        RequestId: requestId,
      },
    },
  });

  return xmlDataStr;
};
