export const getSignedHeadersFromAuthorizationHeader = (authorizationHeader: string): string[] => {
  if (!authorizationHeader) {
    return [];
  }

  const match = authorizationHeader.match(/SignedHeaders=([^,]+)/);

  if (!match) {
    return [];
  }

  return match[1].split(';');
};
