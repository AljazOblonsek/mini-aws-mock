import { getShortDateFromTimestamp } from './get-short-date-from-timestamp';

describe('getShortDateFromTimestamp', () => {
  it('should return empty string if timestamp is empty', () => {
    const shortDate = getShortDateFromTimestamp('');
    expect(shortDate).toBe('');
  });
  it('should return short date from timestamp', () => {
    const shortDate = getShortDateFromTimestamp('20240120T095417Z');
    expect(shortDate).toBe('20240120');
  });
});
