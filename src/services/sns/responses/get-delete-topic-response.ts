import { XMLBuilder } from 'fast-xml-parser';

type GetDeleteTopicResponseOptions = {
  requestId: string;
};

export const getDeleteTopicResponse = ({ requestId }: GetDeleteTopicResponseOptions): string => {
  const options = {
    ignoreAttributes: false,
    format: true,
  };

  const builder = new XMLBuilder(options);
  const xmlDataStr = builder.build({
    DeleteTopicResponse: {
      '@_xmlns': 'http://sns.amazonaws.com/doc/2010-03-31/',
      ResponseMetadata: {
        RequestId: requestId,
      },
    },
  });

  return xmlDataStr;
};
