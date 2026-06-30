import { ImmutablePosition, Piece, Square } from 'tsshogi';
import { generateMoves } from '../lib/moves';

export type Cell = { square: Square; piece: Piece | null };

/** 9段×9筋のグリッド（index 0 = 一段目, 0 = 9筋側）。Square.index 準拠で並べる。 */
export function toGrid(pos: ImmutablePosition): Cell[][] {
  const grid: Cell[][] = [];
  for (let y = 0; y < 9; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < 9; x++) {
      const sq = Square.newByXY(x, y);
      row.push({ square: sq, piece: pos.board.at(sq) });
    }
    grid.push(row);
  }
  return grid;
}

/** from から動ける合法手の移動先マス（成り/不成は同一マスに集約）。 */
export function destinationsFrom(pos: ImmutablePosition, from: Square): Square[] {
  const seen = new Set<string>();
  const dests: Square[] = [];
  for (const m of generateMoves(pos)) {
    if (typeof m.from === 'string') continue; // 打ちは別扱い
    if (!(m.from as Square).equals(from)) continue;
    if (seen.has(m.to.usi)) continue;
    seen.add(m.to.usi);
    dests.push(m.to);
  }
  return dests;
}
