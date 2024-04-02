export const getShortDateFromTimestamp = (timestamp: string): string => {
  if (!timestamp) {
    return '';
  }

  return timestamp.slice(0, 8);
};
