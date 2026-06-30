import { PUZZLES } from '../puzzles';
import { verifyPuzzle } from '../verify';

test('puzzle ids are unique', () => {
  const ids = PUZZLES.map((p) => p.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test('has at least 3 puzzles each for 1, 3, 5 plies', () => {
  for (const n of [1, 3, 5]) {
    expect(PUZZLES.filter((p) => p.plies === n).length).toBeGreaterThanOrEqual(3);
  }
});

describe('every bundled puzzle is sound', () => {
  for (const p of PUZZLES) {
    test(`${p.id} is mate in exactly ${p.plies} with unique first move`, () => {
      const r = verifyPuzzle(p.sfen, p.plies);
      expect(r.ok).toBe(true);
    });
  }
});
