import { scoreProfiles } from './selectProfiles.js';
import { getCurrentDate } from './utils.js';

describe('scoreProfiles', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2023-01-01T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('prioritizes boosted profiles', () => {
    const user = { id: '1', gender: 'Mand', interest: 'Kvinde', age: 30, city: 'X' };
    const boosted = {
      id: '2', gender: 'Kvinde', interest: 'Mand', age: 25, city: 'X',
      boostExpires: new Date(getCurrentDate().getTime() + 3600000).toISOString()
    };
    const regular = { id: '3', gender: 'Kvinde', interest: 'Mand', age: 25, city: 'X' };
    const res = scoreProfiles(user, [regular, boosted], [20, 40]);
    expect(res[0].id).toBe('2');
  });
});
