type GenerateTopicArnOptions = {
  region: string;
  userId: string;
  name: string;
};

export const generateTopicArn = ({ region, userId, name }: GenerateTopicArnOptions): string => {
  return `arn:aws:sns:${region}:${userId}:${name}`;
};
