import { XMLBuilder } from 'fast-xml-parser';
import { AwsException } from '@/core';

type AwsExceptionXmlType = {
  ErrorResponse: {
    '@_xmlns': 'http://sns.amazonaws.com/doc/2010-03-31/';
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
};

export const convertAwsExceptionToXml = ({
  awsException,
  requestId,
}: ConvertAwsExceptionToXmlOptions): string => {
  const awsExceptionXmlType: AwsExceptionXmlType = {
    ErrorResponse: {
      '@_xmlns': 'http://sns.amazonaws.com/doc/2010-03-31/',
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
