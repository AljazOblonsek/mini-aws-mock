export const getCanonicalQuery = (query: Record<string, string>): string => {
  const canonicalQueryValues = [];

  for (const queryKey of Object.keys(query)) {
    const canonicalQueryValue = `${encodeURIComponent(queryKey)}=${encodeURIComponent(query[queryKey])}`;
    canonicalQueryValues.push(canonicalQueryValue);
  }

  return canonicalQueryValues.sort().join('&');
};
