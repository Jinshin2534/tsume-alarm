import { ImmutablePosition, Move, Position } from 'tsshogi';
import { attackingMoves, defenderResist, mateInPlies } from './solver';

/** ちょうど plies 手で詰ます攻方初手の一覧。 */
export function matingFirstMoves(pos: ImmutablePosition, plies: number): Move[] {
  const result: Move[] = [];
  for (const m of attackingMoves(pos)) {
    const child = pos.clone();
    child.doMove(m);
    const resist = defenderResist(child, plies - 1);
    if (resist !== null && 1 + resist === plies) result.push(m);
  }
  return result;
}

/**
 * 健全性検証: ちょうど plies 手詰＋初手余詰なし。
 * ok=true の条件:
 *   1. SFEN が正しくパースできる
 *   2. plies が奇数
 *   3. mateInPlies === plies（過不足なく plies 手詰）
 *   4. matingFirstMoves の長さがちょうど 1（余詰なし）
 */
export function verifyPuzzle(sfen: string, plies: number): { ok: boolean; reason?: string } {
  const pos = Position.newBySFEN(sfen);
  if (!pos) return { ok: false, reason: 'invalid SFEN' };
  if (plies % 2 !== 1) return { ok: false, reason: 'plies must be odd' };

  const got = mateInPlies(pos, plies);
  if (got !== plies) {
    return { ok: false, reason: `not mate in exactly ${plies} plies (solver: ${got})` };
  }
  const firsts = matingFirstMoves(pos, plies);
  if (firsts.length !== 1) {
    return { ok: false, reason: `cooked: ${firsts.length} mating first moves (expected 1)` };
  }
  return { ok: true };
}
