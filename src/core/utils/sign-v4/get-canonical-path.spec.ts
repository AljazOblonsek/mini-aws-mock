import { getCanonicalPath } from './get-canonical-path';

describe('getCanonicalPath', () => {
  it('should return slash if path is falsy', () => {
    const canonicalPath = getCanonicalPath('');
    expect(canonicalPath).toBe('/');
  });
  it('should return original path if path is not falsy', () => {
    const canonicalPath = getCanonicalPath('/sns/');
    expect(canonicalPath).toBe('/sns/');
  });
});
