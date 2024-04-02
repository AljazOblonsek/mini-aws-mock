import { AwsRequestType } from '@/src/common/mock';
import { XMLBuilder } from 'fast-xml-parser';

type GetGetQueueUrlResponseOptions = {
  type: AwsRequestType;
  requestId: string;
  queueUrl: string;
};

const getGetQueueUrlXmlResponse = ({
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

const getGetQueueUrlJsonResponse = ({ queueUrl }: GetGetQueueUrlResponseOptions): object => ({
  QueueUrl: queueUrl,
});

export const getGetQueueUrlResponse = (options: GetGetQueueUrlResponseOptions): string | object => {
  if (options.type === AwsRequestType.XmlRequest) {
    return getGetQueueUrlXmlResponse(options);
  } else {
    return getGetQueueUrlJsonResponse(options);
  }
};
