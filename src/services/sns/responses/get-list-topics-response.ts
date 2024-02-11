import { XMLBuilder } from 'fast-xml-parser';
import { SnsTopic } from '../types/sns-topic.type';

type GetListTopicsResponseOptions = {
  requestId: string;
  topics: SnsTopic[];
  nextToken?: string;
};

export const getListTopicsResponse = ({
  requestId,
  topics,
  nextToken,
}: GetListTopicsResponseOptions): string => {
  const options = {
    ignoreAttributes: false,
    format: true,
  };

  const builder = new XMLBuilder(options);
  const xmlDataStr = builder.build({
    ListTopicsResponse: {
      '@_xmlns': 'http://sns.amazonaws.com/doc/2010-03-31/',
      ListTopicsResult: {
        Topics: {
          member: topics.map((e) => ({ TopicArn: e.arn })),
        },
        NextToken: nextToken,
      },
      ResponseMetadata: {
        RequestId: requestId,
      },
    },
  });

  return xmlDataStr;
};
