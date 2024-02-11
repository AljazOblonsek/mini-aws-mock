type AwsExceptionType = {
  httpStatus: number;
  type: string;
  code: string;
  message: string;
};

export abstract class AwsException extends Error {
  awsError: AwsExceptionType;

  constructor(awsError: AwsExceptionType) {
    super();
    this.name = 'AwsError';
    this.awsError = awsError;
  }
}
