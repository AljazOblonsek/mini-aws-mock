import { XMLBuilder } from 'fast-xml-parser';
import { SqsQueue } from '../types/sqs-queue.type';

type GetListQueuesResponseOptions = {
  requestId: string;
  queues: SqsQueue[];
  nextToken?: string;
};

export const getListQueuesResponse = ({
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
      '@_xmlns': 'http://sns.amazonaws.com/doc/2010-03-31/',
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
