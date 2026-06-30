import { Position, Square } from 'tsshogi';
import { resolvePress } from '../../ui/interaction';

test('selecting own piece then a legal destination yields a move', () => {
  const pos = Position.newBySFEN('4k4/9/9/9/9/9/9/9/4K4 b - 1')!;
  const from = Square.newByUSI('5i')!; // 先手玉
  const s1 = resolvePress(pos, { kind: 'none' }, from);
  expect(s1.selection).toEqual({ kind: 'square', from });
  const to = Square.newByUSI('5h')!;
  const s2 = resolvePress(pos, s1.selection, to);
  expect(s2.move?.usi).toBe('5i5h');
});

test('a move that can promote requests a promotion choice', () => {
  // 先手銀5三→5二: 銀が敵陣(1〜3段)に入る手 → 成り選択が出る
  const pos = Position.newBySFEN('4k4/9/4S4/9/9/9/9/9/4K4 b - 1')!; // 5三銀→5二で成り選択
  const from = Square.newByUSI('5c')!;
  const s1 = resolvePress(pos, { kind: 'none' }, from);
  const s2 = resolvePress(pos, s1.selection, Square.newByUSI('5b')!);
  expect(s2.needsPromotionChoice).toBeTruthy();
});
