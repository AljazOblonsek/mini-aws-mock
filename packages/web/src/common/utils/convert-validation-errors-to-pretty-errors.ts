import { ValidationError } from 'class-validator';
import { PrettyError } from '../types/pretty-error';

export const convertValidationErrorsToPrettyErrors = (
  validationErrors: ValidationError[]
): PrettyError[] =>
  validationErrors.map((error) => ({
    field: error.property,
    error: Object.values(error.constraints || [])
      .map((message) => `${message.charAt(0).toUpperCase()}${message.slice(1)}.`)
      .join(', '),
  }));
