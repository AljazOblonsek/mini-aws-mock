import { AwsRequestType } from '@/src/common/mock';
import { XMLBuilder } from 'fast-xml-parser';

type GetCreateQueueResponseOptions = {
  type: AwsRequestType;
  requestId: string;
  queueUrl: string;
};

const getCreateQueueXmlResponse = ({
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

const getCreateQueueJsonResponse = ({ queueUrl }: GetCreateQueueResponseOptions): object => ({
  QueueUrl: queueUrl,
});

export const getCreateQueueResponse = (options: GetCreateQueueResponseOptions): string | object => {
  if (options.type === AwsRequestType.XmlRequest) {
    return getCreateQueueXmlResponse(options);
  } else {
    return getCreateQueueJsonResponse(options);
  }
};
