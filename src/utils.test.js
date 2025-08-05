import {
  getCurrentDate,
  getDaysLeft,
  getTodayStr,
  advanceDay,
  resetDay,
  getAge,
  parseBirthday,
  detectOS,
  detectBrowser,
  getDailyProfileLimit,
  getSuperLikeLimit,
  getMaxVideoSeconds,
  getWeekId
} from './utils';

describe('utils', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers().setSystemTime(new Date('2023-01-01T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('getCurrentDate returns date with dayOffset', () => {
    expect(getCurrentDate().toISOString().slice(0, 10)).toBe('2023-01-01');
    localStorage.setItem('dayOffset', '2');
    expect(getCurrentDate().toISOString().slice(0, 10)).toBe('2023-01-03');
  });

  test('getDaysLeft calculates remaining days', () => {
    expect(getDaysLeft('2023-01-05')).toBe(4);
  });

  test('getTodayStr returns formatted date', () => {
    expect(getTodayStr()).toBe('2023-01-01');
  });

  test('advanceDay increments offset and dispatches event', () => {
    const handler = jest.fn();
    window.addEventListener('dayOffsetChange', handler);
    advanceDay();
    expect(localStorage.getItem('dayOffset')).toBe('1');
    expect(handler).toHaveBeenCalled();
  });

  test('resetDay clears offset and dispatches event', () => {
    localStorage.setItem('dayOffset', '3');
    const handler = jest.fn();
    window.addEventListener('dayOffsetChange', handler);
    resetDay();
    expect(localStorage.getItem('dayOffset')).toBeNull();
    expect(handler).toHaveBeenCalled();
  });

  test('getAge computes age', () => {
    expect(getAge('2000-02-01')).toBe(22);
    expect(getAge()).toBe('');
  });

  test('parseBirthday validates input', () => {
    expect(parseBirthday('31.12.1999')).toBe('1999-12-31');
    expect(parseBirthday('31/02/1999')).toBe('');
    expect(parseBirthday('bad')).toBe('');
  });

  test('detectOS reads user agent', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      configurable: true
    });
    expect(detectOS()).toBe('Windows');
  });

  test('detectBrowser reads user agent', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh) Chrome/101.0.0.0 Safari/537.36',
      configurable: true
    });
    expect(detectBrowser()).toBe('Chrome');
  });

  test('getDailyProfileLimit respects tier', () => {
    expect(getDailyProfileLimit({ subscriptionTier: 'gold' })).toBe(8);
    expect(getDailyProfileLimit({})).toBe(3);
  });

  test('getSuperLikeLimit respects tier', () => {
    expect(getSuperLikeLimit({ subscriptionTier: 'platinum' })).toBe(5);
    expect(getSuperLikeLimit({})).toBe(0);
  });

  test('getMaxVideoSeconds respects tier', () => {
    expect(getMaxVideoSeconds({ subscriptionTier: 'gold' })).toBe(15);
    expect(getMaxVideoSeconds({})).toBe(10);
  });

  test('getWeekId returns ISO week id', () => {
    const date = new Date('2023-01-05T00:00:00Z');
    expect(getWeekId(date)).toBe('2023-1');
  });
});
