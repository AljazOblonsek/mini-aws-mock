import { SnsTopic } from '../types/sns-topic.type';

export type SnsTopicDto = SnsTopic & {
  numberOfPublishes: number;
};
