import { ImmutablePosition, Move, Square, handPieceTypes, PieceType } from 'tsshogi';

/**
 * 手番側の全合法手を生成する。
 * tsshogi には合法手列挙が無いため createMove + isValidMove でラップする。
 * 盤上移動は成り/不成の両方を試し、合法なものだけ残す（行き所のない駒の成り強制も自然に処理される）。
 */
export function generateMoves(pos: ImmutablePosition): Move[] {
  const color = pos.color;
  const moves: Move[] = [];

  // 盤上の駒の移動
  for (const from of pos.board.listNonEmptySquares()) {
    const piece = pos.board.at(from);
    if (!piece || piece.color !== color) continue;
    for (const to of Square.all) {
      const base = pos.createMove(from, to);
      if (!base) continue;
      if (pos.isValidMove(base)) moves.push(base);
      const promoted = base.withPromote();
      if (!promoted.equals(base) && pos.isValidMove(promoted)) moves.push(promoted);
    }
  }

  // 持ち駒打ち
  const hand = pos.hand(color);
  for (const pt of handPieceTypes) {
    if (hand.count(pt) === 0) continue;
    for (const to of Square.all) {
      const drop = pos.createMove(pt as PieceType, to);
      if (drop && pos.isValidMove(drop)) moves.push(drop);
    }
  }

  return moves;
}
