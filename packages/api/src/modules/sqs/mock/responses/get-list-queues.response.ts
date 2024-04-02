import { AwsRequestType } from '@/src/common/mock';
import { XMLBuilder } from 'fast-xml-parser';
import { SqsQueue } from '../../entities/sqs-queue.entity';
import { WithoutModel } from '@/src/common/core';

type GetListQueuesResponseOptions = {
  type: AwsRequestType;
  requestId: string;
  queues: Array<WithoutModel<SqsQueue>>;
  nextToken?: string;
};

const getListQueuesXmlResponse = ({
  requestId,
  queues,
  nextToken,
}: GetListQueuesResponseOptions): string => {
  const options = {
    ignoreAttributes: false,
    format: true,
  };

  const builder = new XMLBuilder(options);
  const xmlDataStr = builder.build({
    ListQueuesResponse: {
      '@_xmlns': 'http://sns.amazonaws.com/doc/2012-11-05/',
      ListQueuesResult: {
        QueueUrl: queues.map((e) => e.url),
        NextToken: nextToken,
      },
      ResponseMetadata: {
        RequestId: requestId,
      },
    },
  });

  return xmlDataStr;
};

const getListQueuesJsonResponse = ({
  queues,
  nextToken,
}: GetListQueuesResponseOptions): object => ({
  QueueUrls: queues.map((e) => e.url),
  NextToken: nextToken,
});

export const getListQueuesResponse = (options: GetListQueuesResponseOptions): string | object => {
  if (options.type === AwsRequestType.XmlRequest) {
    return getListQueuesXmlResponse(options);
  } else {
    return getListQueuesJsonResponse(options);
  }
};
