export const emptyStringToUndefined = (arg: unknown) => {
  if (typeof arg !== 'string') {
    return arg;
  }

  if (arg.trim() === '') {
    return undefined;
  }

  return arg;
};
