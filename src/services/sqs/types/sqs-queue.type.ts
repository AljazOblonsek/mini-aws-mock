export type SqsQueue = {
  name: string;
  url: string;
  arn: string;
  visibilityTimeout: number;
  receiveMessageWaitTimeSeconds: number;
  maximumMessageSize: number;
};
