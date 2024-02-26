import { XMLBuilder } from 'fast-xml-parser';

type GetDeleteQueueResponseOptions = {
  requestId: string;
};

export const getDeleteQueueResponse = ({ requestId }: GetDeleteQueueResponseOptions): string => {
  const options = {
    ignoreAttributes: false,
    format: true,
  };

  const builder = new XMLBuilder(options);
  const xmlDataStr = builder.build({
    DeleteQueueResponse: {
      '@_xmlns': 'http://sns.amazonaws.com/doc/2012-11-05/',
      ResponseMetadata: {
        RequestId: requestId,
      },
    },
  });

  return xmlDataStr;
};
