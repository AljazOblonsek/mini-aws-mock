import { XMLBuilder } from 'fast-xml-parser';
import { AwsException } from '../exceptions/aws.exception';

type AwsExceptionXmlType = {
  ErrorResponse: {
    '@_xmlns': string;
    Error: {
      Type: string;
      Code: string;
      Message: string;
    };
    RequestId: string;
  };
};

type ConvertAwsExceptionToXmlOptions = {
  awsException: AwsException;
  requestId: string;
  xlmnUrl?: string;
};

export const convertAwsExceptionToXml = ({
  awsException,
  requestId,
  xlmnUrl,
}: ConvertAwsExceptionToXmlOptions): string => {
  const awsExceptionXmlType: AwsExceptionXmlType = {
    ErrorResponse: {
      '@_xmlns': xlmnUrl ? xlmnUrl : 'http://unknown.amazonaws.com/doc/2010-03-31/',
      Error: {
        Type: awsException.awsError.type,
        Code: awsException.awsError.code,
        Message: awsException.awsError.message,
      },
      RequestId: requestId,
    },
  };

  const xmlBuilder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
  });

  return xmlBuilder.build(awsExceptionXmlType);
};
