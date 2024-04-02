import { plainToInstance } from 'class-transformer';
import { ValidateBy, ValidationOptions, buildMessage, validateSync } from 'class-validator';
import { MessageAttributeValueDto } from '../dtos/message-attribute-value.dto';

const IS_MESSAGE_ATTRIBUTE_RECORD = 'isMessageAttributeRecord';

function isMessageAttributeRecord(value: unknown): boolean {
  if (!value) {
    return false;
  }

  if (typeof value !== 'object') {
    return false;
  }

  const doAllKeysStartWithUppercase = Object.keys(value).every(
    (e) => e.charAt(0) === e.charAt(0).toUpperCase()
  );

  if (!doAllKeysStartWithUppercase) {
    return false;
  }

  for (const key of Object.keys(value)) {
    const messageAttributeValue = (value as Record<string, unknown>)[key];

    const dto = plainToInstance(MessageAttributeValueDto, messageAttributeValue);
    const validationResult = validateSync(dto);

    if (validationResult.length > 0) {
      return false;
    }
  }

  return true;
}

export function IsMessageAttributeRecord(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: IS_MESSAGE_ATTRIBUTE_RECORD,
      constraints: [],
      validator: {
        validate: (value): boolean => isMessageAttributeRecord(value),
        defaultMessage: buildMessage((eachPrefix) => eachPrefix, validationOptions),
      },
    },
    validationOptions
  );
}
