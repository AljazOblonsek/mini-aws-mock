import { hash } from './hash-utils';

export const addCalculatedHeadersToPreparedHeaders = (
  preparedHeaders: Record<string, string>,
  textBody: string
): Record<string, string> => {
  const preparedAndCalculatedHeaders = { ...preparedHeaders };

  if (!('content-type' in preparedHeaders)) {
    return preparedAndCalculatedHeaders;
  }

  if (preparedHeaders['content-type'] !== 'application/x-www-form-urlencoded') {
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
