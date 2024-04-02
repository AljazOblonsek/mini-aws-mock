import { AwsRequestType } from '@/src/common/mock';
import { XMLBuilder } from 'fast-xml-parser';

type GetDeleteMessageResponseOptions = {
  type: AwsRequestType;
  requestId: string;
};

const getDeleteMessageXmlResponse = ({ requestId }: GetDeleteMessageResponseOptions): string => {
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

const getDeleteMessageJsonResponse = (): object => ({});

export const getDeleteMessageResponse = (
  options: GetDeleteMessageResponseOptions
): string | object => {
  if (options.type === AwsRequestType.XmlRequest) {
    return getDeleteMessageXmlResponse(options);
  } else {
    return getDeleteMessageJsonResponse();
  }
};
