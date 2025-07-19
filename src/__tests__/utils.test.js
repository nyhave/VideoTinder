import { getCurrentDate, getAge, getTodayStr } from '../utils.js';

// Control time for deterministic tests
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2024-05-20T00:00:00Z'));
  localStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
  localStorage.clear();
});

test('getCurrentDate returns the mocked current date when no offset is set', () => {
  const date = getCurrentDate();
  expect(date).toBeInstanceOf(Date);
  expect(date.toISOString()).toBe('2024-05-20T00:00:00.000Z');
});

test('getCurrentDate applies dayOffset from localStorage', () => {
  localStorage.setItem('dayOffset', '3');
  const date = getCurrentDate();
  expect(date.toISOString()).toBe('2024-05-23T00:00:00.000Z');
});

test('getTodayStr returns YYYY-MM-DD string for the mocked date', () => {
  expect(getTodayStr()).toBe('2024-05-20');
});

test('getAge calculates age relative to getCurrentDate', () => {
  // Birthday after the mocked current date this year
  const birthStr = '2000-05-21';
  expect(getAge(birthStr)).toBe(23);
});
