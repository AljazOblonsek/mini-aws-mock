import { AwsRequestType } from '@/src/common/mock';
import { XMLBuilder } from 'fast-xml-parser';

type GetDeleteQueueResponseOptions = {
  type: AwsRequestType;
  requestId: string;
};

const getDeleteQueueXmlResponse = ({ requestId }: GetDeleteQueueResponseOptions): string => {
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

const getDeleteQueueJsonResponse = (): object => ({});

export const getDeleteQueueResponse = (options: GetDeleteQueueResponseOptions): string | object => {
  if (options.type === AwsRequestType.XmlRequest) {
    return getDeleteQueueXmlResponse(options);
  } else {
    return getDeleteQueueJsonResponse();
  }
};
