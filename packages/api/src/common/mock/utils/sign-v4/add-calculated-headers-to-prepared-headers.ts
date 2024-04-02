import { hash } from './hash-utils';

export const addCalculatedHeadersToPreparedHeaders = (
  preparedHeaders: Record<string, string>,
  textBody: string
): Record<string, string> => {
  const preparedAndCalculatedHeaders = { ...preparedHeaders };

  if (!('content-type' in preparedHeaders)) {
    return preparedAndCalculatedHeaders;
  }

  if (
    ![
      'application/x-www-form-urlencoded',
      'application/x-amz-json-1.0',
      'application/x-amz-json-1.1',
    ].includes(preparedHeaders['content-type'])
  ) {
    return preparedAndCalculatedHeaders;
  }

  preparedAndCalculatedHeaders['content-length'] = textBody.length.toString();
  preparedAndCalculatedHeaders['x-amz-content-sha256'] = hash(textBody);

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
