import { XMLBuilder } from 'fast-xml-parser';

type GetDeleteMessageResponseOptions = {
  requestId: string;
};

export const getDeleteMessageResponse = ({
  requestId,
}: GetDeleteMessageResponseOptions): string => {
  const options = {
    ignoreAttributes: false,
    format: true,
  };

  const builder = new XMLBuilder(options);
  const xmlDataStr = builder.build({
    DeleteMessageResponse: {
      '@_xmlns': 'http://sns.amazonaws.com/doc/2012-11-05/',
      ResponseMetadata: {
        RequestId: requestId,
      },
    },
  });

  return xmlDataStr;
};
