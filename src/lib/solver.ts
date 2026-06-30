import { ImmutablePosition, Move } from 'tsshogi';
import { generateMoves } from './moves';

/** 攻方手のうち「王手になり、打ち歩詰めでない」手のみを返す。 */
export function attackingMoves(pos: ImmutablePosition): Move[] {
  const result: Move[] = [];
  for (const m of generateMoves(pos)) {
    if (pos.isPawnDropMate(m)) continue; // 打ち歩詰めは反則
    const next = pos.clone();
    next.doMove(m);
    if (next.checked) result.push(m); // doMove 後の手番（玉方）が王手されている＝この手は王手
  }
  return result;
}

/**
 * 攻方手番。maxPlies 以内に詰ませられる最短プライ数（奇数）。詰まなければ null。
 */
export function mateInPlies(pos: ImmutablePosition, maxPlies: number): number | null {
  if (maxPlies < 1) return null;
  let best: number | null = null;
  for (const m of attackingMoves(pos)) {
    const child = pos.clone();
    child.doMove(m);
    const resist = defenderResist(child, maxPlies - 1);
    if (resist === null) continue;
    const total = 1 + resist;
    if (best === null || total < best) best = total;
  }
  return best;
}

/**
 * 玉方手番（王手中）。最善（最長抵抗）でも詰むなら必要プライ数、逃れられるなら null。
 */
export function defenderResist(pos: ImmutablePosition, maxPlies: number): number | null {
  const moves = generateMoves(pos); // 王手回避手（isValidMove が自玉放置を除外済み）
  if (moves.length === 0) return 0; // 詰み（これ以上手は要らない）
  if (maxPlies < 1) return null; // 逃げ手があるのに残り手数ゼロ＝間に合わない
  let worst = 0;
  for (const d of moves) {
    const child = pos.clone();
    child.doMove(d);
    const a = mateInPlies(child, maxPlies - 1);
    if (a === null) return null; // 一つでも逃れられたら不詰
    if (1 + a > worst) worst = 1 + a;
  }
  return worst;
}
