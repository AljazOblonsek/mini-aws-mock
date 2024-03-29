type SqsMessageAttribute = {
  name: string;
  value: {
    dataType: string;
    stringValue?: string;
    binaryValue?: unknown;
  };
};

export type SqsMessage = {
  messageId: string;
  messageBody: string;
  md5OfMessageBody: string;
  delaySeconds?: number;
  visibilityTimeout: number;
  messageAttributes: SqsMessageAttribute[];
  md5OfMessageAttributes?: string;
  queueUrl: string;
  receiptHandle?: string;
  receiptHandleSentAt?: Date;
  createdAt: Date;
};
