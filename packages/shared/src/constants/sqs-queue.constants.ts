export const SQS_QUEUE_CONSTANTS = {
  DefaultVisibilityTimeoutInSeconds: 30,
  MaximumVisibilityTimeoutInSeconds: 43200,
  DefaultReceiveMessageWaitTimeInSeconds: 0,
  MaximumReceiveMessageWaitTimeInSeconds: 20,
  MinimumMessageSizeInBytes: 1024,
  MaximumMessageSizeInBytes: 262144,
} as const;
