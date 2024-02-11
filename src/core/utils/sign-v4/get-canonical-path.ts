export const getCanonicalPath = (path: string): string => {
  if (!path) {
    return '/';
  }

  return path;
};
