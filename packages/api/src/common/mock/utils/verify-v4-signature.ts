import { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { ValidationErrorException } from '../exceptions/validation-error.exception';
import { NotAuthorizedException } from '../exceptions/not-authorized.exception';
import { getSignatureFromAuthorizationHeader, getV4Signature } from './sign-v4';
import { InternalFailureException } from '../exceptions/internal-failure.exception';
import { AwsRequestType } from '../enums/aws-request-type.enum';

type VerifyV4SignatureOptions = Readonly<{
  request: RawBodyRequest<Request>;
  configService: ConfigService;
  awsRequestType: AwsRequestType;
}>;

export const verifyV4Signature = ({
  request,
  configService,
  awsRequestType,
}: VerifyV4SignatureOptions) => {
  if (!('x-amz-date' in request.headers)) {
    throw new ValidationErrorException(
      '`x-amz-date` header is missing but is  requried to verify signature.'
    );
  }

  if (!('authorization' in request.headers)) {
    throw new NotAuthorizedException('`authorization` header is missing.');
  }

  const clientSignature = getSignatureFromAuthorizationHeader(
    request.headers.authorization as string
  );

  if (!clientSignature) {
    throw new NotAuthorizedException(
      'Could not extract signature hash from `authorization` header.'
    );
  }

  let textBody = '';

  if (awsRequestType === AwsRequestType.XmlRequest) {
    textBody = request.rawBody?.toString() || '';
  } else if (awsRequestType === AwsRequestType.JsonRequest) {
    textBody = JSON.stringify(request.body);
  }

  const serverSignature = getV4Signature({
    secretKey: configService.getOrThrow('AWS_SECRET_KEY'),
    region: configService.getOrThrow('AWS_REGION'),
    method: request.method,
    path: request.path,
    query: request.query as Record<string, string>,
    headers: request.headers as Record<string, string>,
    textBody,
  });

  if (!serverSignature) {
    throw new InternalFailureException('Failed to calculate signature.');
  }

  if (clientSignature !== serverSignature) {
    throw new NotAuthorizedException('Invalid signature.');
  }
};
