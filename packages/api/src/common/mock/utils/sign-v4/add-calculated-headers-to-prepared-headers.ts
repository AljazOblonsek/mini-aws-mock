import { hash } from './hash-utils';

const HEADERS_TO_CALCULATE_VALUES_FOR = [
  'application/x-www-form-urlencoded',
  'application/x-amz-json-1.0',
  'application/x-amz-json-1.1',
  'application/json',
];

export const addCalculatedHeadersToPreparedHeaders = (
  preparedHeaders: Record<string, string>,
  textBody: string
): Record<string, string> => {
  const preparedAndCalculatedHeaders = { ...preparedHeaders };

  if ('content-type' in preparedHeaders) {
    if (HEADERS_TO_CALCULATE_VALUES_FOR.includes(preparedHeaders['content-type'])) {
      preparedAndCalculatedHeaders['content-length'] = textBody.length.toString();
      preparedAndCalculatedHeaders['x-amz-content-sha256'] = hash(textBody);
    }
  }

  if (textBody === '') {
    // AWS still expectshashed empty string in the `x-amz-content-sha256` header even if there is no request body
    // But does not want the `content-length` header
    preparedAndCalculatedHeaders['x-amz-content-sha256'] = hash('');
  }

  // Sort the headers alphabetically again because new ones were added
  return Object.keys(preparedAndCalculatedHeaders)
    .sort()
    .reduce(
      (acc, key) => ({
        ...acc,
        [key]: preparedAndCalculatedHeaders[key],
      }),
      {}
    );
};
