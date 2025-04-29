export { XMLN_MAP } from './constants/xmln-map.constant';

export { IsMessageAttributeRecord } from './decorators/is-message-attribute-record.decorator';

export { AwsListRequestDto } from './dtos/aws-list-request.dto';
export { AwsRequestBaseDto } from './dtos/aws-request-base.dto';
export { MessageAttributeValueDto } from './dtos/message-attribute-value.dto';

export { AwsRequestType } from './enums/aws-request-type.enum';

export { AwsException } from './exceptions/aws.exception';
export { InternalFailureException } from './exceptions/internal-failure.exception';
export { InvalidActionException } from './exceptions/invalid-action.exception';
export { ValidationErrorException } from './exceptions/validation-error.exception';

export { MockExceptionsFilter } from './filters/mock-exception.filter';

export { AwsActionOptions } from './types/aws-action-options.type';
export { StubBaseOptions } from './types/stub-base-options.type';

export { getServiceNameFromAuthorizationHeader } from './utils/sign-v4';
export { convertAwsExceptionToJson } from './utils/convert-aws-exception-to-json';
export { convertAwsExceptionToXml } from './utils/convert-aws-exception-to-xml';
export { verifyV4Signature } from './utils/verify-v4-signature';
