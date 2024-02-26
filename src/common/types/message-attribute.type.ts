type MessageAttributeValue = {
  DataType: string;
  StringValue?: string;
  BinaryValue?: unknown;
};

export type MessageAttribute = {
  Name: string;
  Value: MessageAttributeValue;
};
