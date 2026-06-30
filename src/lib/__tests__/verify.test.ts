import { verifyPuzzle } from '../verify';

// k8/2S6/9/9/9/9/9/9/8K b GG 1
// 後手玉9一、銀8二。先手2金持ち。G*8a（頭金相当）が唯一の詰み初手で3手詰。
// Confirmed: mateInPlies(pos, 3) === 3, matingFirstMoves(pos, 3).length === 1
// (see solver.test.ts multi-ply test + sfen exploration)
test('valid 3-ply puzzle passes', () => {
  const r = verifyPuzzle('k8/2S6/9/9/9/9/9/9/8K b GG 1', 3);
  expect(r.ok).toBe(true);
});

// 4k4/9/9/9/9/9/9/9/4K4 b G 1
// 中央の玉に金1枚では1手詰なし。
// Confirmed: mateInPlies(pos, 1) === null
test('rejects when not mate in the stated plies', () => {
  const r = verifyPuzzle('4k4/9/9/9/9/9/9/9/4K4 b G 1', 1);
  expect(r.ok).toBe(false);
  expect(r.reason).toMatch(/not mate/i);
});

test('rejects invalid SFEN', () => {
  const r = verifyPuzzle('not-a-valid-sfen', 1);
  expect(r.ok).toBe(false);
  expect(r.reason).toMatch(/invalid sfen/i);
});

test('rejects even plies', () => {
  const r = verifyPuzzle('k8/2S6/9/9/9/9/9/9/8K b GG 1', 2);
  expect(r.ok).toBe(false);
  expect(r.reason).toMatch(/odd/i);
});

// k8/9/1SN6/9/9/9/9/9/8K b G 1
// 頭金局面だが余詰あり（G*8b, G*9b, G*8a など複数の詰み初手がある）。
// Confirmed: mateInPlies(pos, 1) === 1, matingFirstMoves(pos, 1).length === 3
test('rejects cooked puzzle (multiple mating first moves)', () => {
  const r = verifyPuzzle('k8/9/1SN6/9/9/9/9/9/8K b G 1', 1);
  expect(r.ok).toBe(false);
  expect(r.reason).toMatch(/cooked/i);
});
