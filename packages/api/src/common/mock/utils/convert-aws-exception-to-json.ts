import { AwsException } from '../exceptions/aws.exception';

type AwsExceptionJsonType = {
  __type: string;
  message: string;
};

type ConvertAwsExceptionToXmlOptions = {
  awsException: AwsException;
};

export const convertAwsExceptionToJson = ({
  awsException,
}: ConvertAwsExceptionToXmlOptions): AwsExceptionJsonType => {
  const awsExceptionJsonType: AwsExceptionJsonType = {
    __type: awsException.awsError.type,
    message: awsException.awsError.message,
  };

  return awsExceptionJsonType;
};
