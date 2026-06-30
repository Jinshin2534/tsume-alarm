import { ImmutablePosition, Move } from 'tsshogi';
import { attackingMoves, defenderResist, mateInPlies } from './solver';
import { generateMoves } from './moves';

export type JudgeResult =
  | { status: 'solved' }
  | { status: 'wrong' }
  | { status: 'continue'; defenderReply: Move };

/** 玉方手番で最長抵抗の応手。既に詰みなら null。 */
export function bestDefense(pos: ImmutablePosition, plies: number): Move | null {
  const moves = generateMoves(pos);
  if (moves.length === 0) return null;
  let best: { move: Move; resist: number } | null = null;
  for (const d of moves) {
    const child = pos.clone();
    child.doMove(d);
    const a = mateInPlies(child, plies - 1);
    const resist = a === null ? Infinity : 1 + a; // 逃れられる手を最優先で選ぶ
    if (best === null || resist > best.resist) best = { move: d, resist };
  }
  return best!.move;
}

/**
 * 攻方手番 pos でユーザーが userMove を指したときの判定。
 * remainingPlies: この局面から詰ますべき残りプライ数（奇数）。
 */
export function judgeMove(
  pos: ImmutablePosition,
  userMove: Move,
  remainingPlies: number,
): JudgeResult {
  // userMove が「王手になり、打ち歩詰めでない」攻方手であること
  const legalAttacks = attackingMoves(pos);
  if (!legalAttacks.some((m) => m.equals(userMove))) return { status: 'wrong' };

  const afterUser = pos.clone();
  afterUser.doMove(userMove);

  // 玉方に合法手が無ければ詰み＝正解
  const defenderMoves = generateMoves(afterUser);
  if (defenderMoves.length === 0) return { status: 'solved' };

  // まだ手数が残り、かつ最善防御でも remainingPlies-1 で詰むなら継続
  const resist = defenderResist(afterUser, remainingPlies - 1);
  if (resist === null) return { status: 'wrong' }; // この手では詰まない＝逸れた

  const reply = bestDefense(afterUser, remainingPlies - 1);
  // unreachable: the defenderMoves.length===0 case is handled above, so
  // bestDefense always finds a move here. Kept as a defensive fallback.
  if (!reply) return { status: 'solved' };
  return { status: 'continue', defenderReply: reply };
}
