import { XMLBuilder } from 'fast-xml-parser';
import { SnsTopic } from '../../entities/sns-topic.entity';

type GetListTopicsXmlResponseOptions = {
  requestId: string;
  topics: SnsTopic[];
  nextToken?: string;
};

export const getListTopicsXmlResponse = ({
  requestId,
  topics,
  nextToken,
}: GetListTopicsXmlResponseOptions): string => {
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
