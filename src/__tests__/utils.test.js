import { getAge } from '../utils.js';

test('getAge calculates age correctly', () => {
  const now = new Date();
  const birthYear = now.getFullYear() - 20;
  const birthDate = new Date(birthYear, now.getMonth(), now.getDate());
  const birthStr = birthDate.toISOString().split('T')[0];
  expect(getAge(birthStr)).toBe(20);
});
