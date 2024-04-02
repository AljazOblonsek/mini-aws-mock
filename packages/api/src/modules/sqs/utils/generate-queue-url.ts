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
  // TODO: Might need to change localhost to whatever this is hosted on
  return `http://sqs.${region}.localhost:${port}/${userId}/${name}`;
};
