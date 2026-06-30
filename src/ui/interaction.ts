import { ImmutablePosition, Move, PieceType, Square } from 'tsshogi';

export type Selection =
  | { kind: 'none' }
  | { kind: 'square'; from: Square }
  | { kind: 'drop'; pt: PieceType };

export type PressResult = {
  selection: Selection;
  move?: Move;
  needsPromotionChoice?: { base: Move; promoted: Move };
};

export function resolvePress(
  pos: ImmutablePosition,
  sel: Selection,
  target: Square,
): PressResult {
  // 未選択: 自駒なら選択
  if (sel.kind === 'none') {
    const piece = pos.board.at(target);
    if (piece && piece.color === pos.color) return { selection: { kind: 'square', from: target } };
    return { selection: { kind: 'none' } };
  }

  // 盤上移動
  if (sel.kind === 'square') {
    if (sel.from.equals(target)) return { selection: { kind: 'none' } }; // 同じマス＝選択解除
    const base = pos.createMove(sel.from, target);
    if (!base || !pos.isValidMove(base)) {
      // 別の自駒を選び直し / それ以外は解除
      const piece = pos.board.at(target);
      if (piece && piece.color === pos.color) return { selection: { kind: 'square', from: target } };
      return { selection: { kind: 'none' } };
    }
    const promoted = base.withPromote();
    const canPromote = !promoted.equals(base) && pos.isValidMove(promoted);
    const mustPromote = canPromote && !pos.isValidMove(base);
    if (canPromote && !mustPromote) {
      return { selection: { kind: 'none' }, needsPromotionChoice: { base, promoted } };
    }
    return { selection: { kind: 'none' }, move: mustPromote ? promoted : base };
  }

  // 持ち駒打ち (sel.kind === 'drop')
  const drop = pos.createMove(sel.pt, target);
  if (drop && pos.isValidMove(drop)) return { selection: { kind: 'none' }, move: drop };
  return { selection: { kind: 'none' } };
}
