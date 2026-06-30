import { DEFAULT_SETTINGS, normalizeSettings } from '../settings';

test('fills defaults for missing/invalid fields', () => {
  const s = normalizeSettings({ hour: 25, minPlies: 4 });
  expect(s.hour).toBe(DEFAULT_SETTINGS.hour); // 25 は不正→既定
  expect([1, 3, 5, 7, 9]).toContain(s.minPlies); // 偶数4→最近傍の奇数等に補正
  expect(s.maxPlies).toBeGreaterThanOrEqual(s.minPlies);
  expect(s.requiredCorrect).toBeGreaterThanOrEqual(1);
});

test('accepts valid values unchanged', () => {
  const s = normalizeSettings({ hour: 8, minute: 30, enabled: true, minPlies: 3, maxPlies: 7, requiredCorrect: 5 });
  expect(s.hour).toBe(8);
  expect(s.minute).toBe(30);
  expect(s.enabled).toBe(true);
  expect(s.minPlies).toBe(3);
  expect(s.maxPlies).toBe(7);
  expect(s.requiredCorrect).toBe(5);
});

test('clamps maxPlies to minPlies when maxPlies < minPlies', () => {
  const s = normalizeSettings({ minPlies: 7, maxPlies: 3 });
  expect(s.maxPlies).toBeGreaterThanOrEqual(s.minPlies);
});

test('normalizes empty input to defaults', () => {
  const s = normalizeSettings({});
  expect(s).toEqual(DEFAULT_SETTINGS);
});

test('normalizes null/undefined input to defaults', () => {
  expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
  expect(normalizeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
});
