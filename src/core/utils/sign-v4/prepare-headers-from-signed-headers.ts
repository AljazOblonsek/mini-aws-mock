const CALCULATED_HEADERS = ['content-length', 'x-amz-content-sha256'];

export const prepareHeadersFromSignedHeaders = (
  signedHeaders: string[],
  requestHeaders: Record<string, string>
): Record<string, string> => {
  const preparedHeaders: Record<string, string> = {};

  const alphabeticallySortedRequestHeaders: Record<string, string> = Object.keys(requestHeaders)
    .sort()
    .reduce(
      (acc, key) => ({
        ...acc,
        [key]: requestHeaders[key],
      }),
      {}
    );

  for (const requestHeaderKey in alphabeticallySortedRequestHeaders) {
    if (
      signedHeaders.includes(requestHeaderKey.toLocaleLowerCase()) &&
      !CALCULATED_HEADERS.includes(requestHeaderKey.toLowerCase())
    ) {
      preparedHeaders[requestHeaderKey.toLocaleLowerCase()] =
        alphabeticallySortedRequestHeaders[requestHeaderKey].trim();
    }
  }

  return preparedHeaders;
};
