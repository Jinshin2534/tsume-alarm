import type { Puzzle } from './puzzles';

export type SessionConfig = { minPlies: number; maxPlies: number; requiredCorrect: number };
export type SessionState = {
  pool: Puzzle[];
  index: number;
  correct: number;
  done: boolean;
  requiredCorrect: number;
};

export function createSession(
  config: SessionConfig,
  all: Puzzle[],
  shuffle: (a: Puzzle[]) => Puzzle[],
): SessionState {
  const filtered = all.filter((p) => p.plies >= config.minPlies && p.plies <= config.maxPlies);
  return {
    pool: shuffle(filtered.slice()),
    index: 0,
    correct: 0,
    done: false,
    requiredCorrect: config.requiredCorrect,
  };
}

export function currentPuzzle(s: SessionState): Puzzle | null {
  if (s.pool.length === 0) return null;
  return s.pool[s.index % s.pool.length];
}

export function recordResult(s: SessionState, solved: boolean): SessionState {
  const correct = solved ? s.correct + 1 : s.correct;
  const done = correct >= s.requiredCorrect;
  return { ...s, correct, done, index: s.index + 1 };
}
