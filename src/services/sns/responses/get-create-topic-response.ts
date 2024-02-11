import { XMLBuilder } from 'fast-xml-parser';

type GetCreateTopicResponseOptions = {
  requestId: string;
  topicArn: string;
};

export const getCreateTopicResponse = ({
  requestId,
  topicArn,
}: GetCreateTopicResponseOptions): string => {
  const options = {
    ignoreAttributes: false,
    format: true,
  };

  const builder = new XMLBuilder(options);
  const xmlDataStr = builder.build({
    CreateTopicResponse: {
      '@_xmlns': 'http://sns.amazonaws.com/doc/2010-03-31/',
      CreateTopicResult: {
        TopicArn: topicArn,
      },
      ResponseMetadata: {
        RequestId: requestId,
      },
    },
  });

  return xmlDataStr;
};
