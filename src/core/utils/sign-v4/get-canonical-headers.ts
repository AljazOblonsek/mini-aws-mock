import { addCalculatedHeadersToPreparedHeaders } from './add-calculated-headers-to-prepared-headers';
import { prepareHeadersFromSignedHeaders } from './prepare-headers-from-signed-headers';

type GetCanonicalHeadersOptions = {
  signedHeaders: string[];
  requestHeaders: Record<string, string>;
  textBody: string;
};

export const getCanonicalHeaders = ({
  signedHeaders,
  requestHeaders,
  textBody,
}: GetCanonicalHeadersOptions): string => {
  const preparedHeaders = prepareHeadersFromSignedHeaders(signedHeaders, requestHeaders);

  const preparedAndCalculatedHeaders = addCalculatedHeadersToPreparedHeaders(
    preparedHeaders,
    textBody
  );

  return Object.keys(preparedAndCalculatedHeaders)
    .map((key) => `${key}:${preparedAndCalculatedHeaders[key]}`)
    .join('\n');
};
