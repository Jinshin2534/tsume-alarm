import { createSession, currentPuzzle, recordResult } from '../session';
import type { Puzzle } from '../puzzles';

const P = (id: string, plies: number): Puzzle => ({ id, plies, sfen: 'x', tags: [] });
const noShuffle = (a: Puzzle[]) => a;
const all = [P('a', 1), P('b', 3), P('c', 5), P('d', 1)];

test('filters by plies range', () => {
  const s = createSession({ minPlies: 1, maxPlies: 1, requiredCorrect: 2 }, all, noShuffle);
  expect(s.pool.map((p) => p.id)).toEqual(['a', 'd']);
});

test('done becomes true after requiredCorrect correct answers', () => {
  let s = createSession({ minPlies: 1, maxPlies: 5, requiredCorrect: 2 }, all, noShuffle);
  s = recordResult(s, true); // 1
  expect(s.done).toBe(false);
  s = recordResult(s, false); // wrong: not counted
  expect(s.correct).toBe(1);
  s = recordResult(s, true); // 2
  expect(s.done).toBe(true);
});

test('reuses pool from the start when exhausted', () => {
  let s = createSession({ minPlies: 1, maxPlies: 1, requiredCorrect: 5 }, all, noShuffle);
  // pool = [a, d]; 3問目は a に戻る
  expect(currentPuzzle(s)!.id).toBe('a');
  s = recordResult(s, false);
  expect(currentPuzzle(s)!.id).toBe('d');
  s = recordResult(s, false);
  expect(currentPuzzle(s)!.id).toBe('a');
});
