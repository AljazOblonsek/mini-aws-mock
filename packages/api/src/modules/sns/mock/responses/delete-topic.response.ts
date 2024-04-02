import { XMLBuilder } from 'fast-xml-parser';

type GetDeleteTopicXmlResponseOptions = {
  requestId: string;
};

export const getDeleteTopicXmlResponse = ({
  requestId,
}: GetDeleteTopicXmlResponseOptions): string => {
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
