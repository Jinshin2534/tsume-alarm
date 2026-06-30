import { updateStreak } from '../stats';

test('consecutive day increments streak', () => {
  const s = updateStreak({ lastClearedISO: '2026-06-29', streak: 2 }, '2026-06-30');
  expect(s.streak).toBe(3);
});

test('a gap resets streak to 1', () => {
  const s = updateStreak({ lastClearedISO: '2026-06-25', streak: 5 }, '2026-06-30');
  expect(s.streak).toBe(1);
});

test('same day does not double count', () => {
  const s = updateStreak({ lastClearedISO: '2026-06-30', streak: 3 }, '2026-06-30');
  expect(s.streak).toBe(3);
});

test('null lastClearedISO starts the streak at 1 (first ever clear)', () => {
  const s = updateStreak({ lastClearedISO: null, streak: 0 }, '2026-06-30');
  expect(s.streak).toBe(1);
  expect(s.lastClearedISO).toBe('2026-06-30');
});

test('consecutive across a month boundary increments', () => {
  const s = updateStreak({ lastClearedISO: '2026-06-30', streak: 4 }, '2026-07-01');
  expect(s.streak).toBe(5);
});
