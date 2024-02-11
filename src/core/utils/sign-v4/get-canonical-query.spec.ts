import { getCanonicalQuery } from './get-canonical-query';

describe('getCanonicalQuery', () => {
  it('should return empty string if query is empty', () => {
    const canonicalQuery = getCanonicalQuery({});
    expect(canonicalQuery).toBe('');
  });
  it('should join the headers with `&` sign, encode them and sort them alphabetically before joining', () => {
    const canonicalQuery = getCanonicalQuery({
      search: 'search-for-value',
      page: '10',
    });
    expect(canonicalQuery).toBe(
      `${encodeURIComponent('page')}=${encodeURIComponent('10')}&${encodeURIComponent('search')}=${encodeURIComponent('search-for-value')}`
    );
  });
});
