import { nextTriggerDate } from '../alarm';

test('returns today if the time is still ahead', () => {
  const now = new Date('2026-06-30T06:00:00');
  const d = nextTriggerDate(now, 7, 0);
  expect(d.getDate()).toBe(30);
  expect(d.getHours()).toBe(7);
});

test('rolls over to tomorrow if the time has passed', () => {
  const now = new Date('2026-06-30T08:00:00');
  const d = nextTriggerDate(now, 7, 0);
  expect(d.getDate()).toBe(1); // 翌日
});
