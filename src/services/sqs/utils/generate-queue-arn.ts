type GenerateQueueUrlOptions = {
  region: string;
  userId: string;
  name: string;
  port: number;
};

export const generateQueueUrl = ({
  region,
  userId,
  name,
  port,
}: GenerateQueueUrlOptions): string => {
  return `http://sqs.${region}.localhost:${port}/${userId}/${name}`;
};
