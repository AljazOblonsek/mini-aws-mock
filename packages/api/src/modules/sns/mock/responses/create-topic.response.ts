import { XMLBuilder } from 'fast-xml-parser';

type GetCreateTopicXmlResponseOptions = {
  requestId: string;
  topicArn: string;
};

export const getCreateTopicXmlResponse = ({
  requestId,
  topicArn,
}: GetCreateTopicXmlResponseOptions) => {
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
