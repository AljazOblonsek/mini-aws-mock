export const getServiceNameFromAuthorizationHeader = (
  authorizationHeader: string
): string | null => {
  const match = authorizationHeader.match(/AWS4-HMAC-SHA256 Credential=([^,]+)/);

  if (!match) {
    return null;
  }

  const splitCrendential = match[1].split('/');

  if (splitCrendential.length !== 5) {
    return null;
  }

  return splitCrendential[3];
};
