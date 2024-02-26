type GenerateQueueArnOptions = {
  region: string;
  userId: string;
  name: string;
};

export const generateQueueArn = ({ region, userId, name }: GenerateQueueArnOptions): string => {
  return `arn:aws:sqs:${region}:${userId}:${name}`;
};
