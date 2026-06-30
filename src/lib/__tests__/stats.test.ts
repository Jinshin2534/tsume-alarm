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
