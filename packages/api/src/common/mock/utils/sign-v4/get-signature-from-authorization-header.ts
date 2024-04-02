export const getSignatureFromAuthorizationHeader = (authorizationHeader: string): string | null => {
  const match = authorizationHeader.match(/Signature=([^]+)/);

  if (!match) {
    return null;
  }

  return match[1];
};
