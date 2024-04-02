import { faker } from '@faker-js/faker';
import { WithoutModel } from '@/src/common/core';
import { SnsTopic } from '../../entities/sns-topic.entity';
import { generateTopicArn } from '../../utils/generate-topic-arn';
import { StubBaseOptions } from '@/src/common/mock';

export const generateSnsTopicStub = (
  data: Partial<WithoutModel<SnsTopic>> & Partial<StubBaseOptions> = {}
): WithoutModel<SnsTopic> => {
  const topicName = data.name || faker.word.sample();

  const defaultOptions: WithoutModel<SnsTopic> = {
    name: topicName,
    arn: generateTopicArn({
      region: data.region || faker.location.country(),
      userId: data.userId || faker.number.int().toString(),
      name: topicName,
    }),
  };

  return { ...defaultOptions, ...data };
};
