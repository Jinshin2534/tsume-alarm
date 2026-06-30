import { Position } from 'tsshogi';
import { generateMoves } from '../moves';

// 玉方の初期局面（後手玉のみ、後手の合法手＝玉の動き）
test('lone white king on 5a has up to 5 legal king moves', () => {
  const pos = Position.newBySFEN('4k4/9/9/9/9/9/9/9/9 w - 1')!;
  const moves = generateMoves(pos);
  // 5一の玉: 6a,4a,6b,5b,4b の最大5マス（盤端で上方向は無い）
  expect(moves.length).toBe(5);
  expect(moves.every((m) => m.pieceType === 'king')).toBe(true);
});

test('a pawn that can only reach the last rank generates the promoting move, not the illegal non-promote', () => {
  // 先手歩が9二、敵陣最奥9一が空。成りのみ合法。
  const pos = Position.newBySFEN('9/P8/9/9/9/9/9/9/4K4 b - 1')!;
  const moves = generateMoves(pos).filter((m) => m.to.usi === '9a');
  expect(moves.length).toBe(1);
  expect(moves[0].promote).toBe(true);
});

test('drops are generated for pieces in hand', () => {
  // 先手が金1枚持ち、盤上は玉だけ。打てる空きマス分の金打ちが出る。
  const pos = Position.newBySFEN('4k4/9/9/9/9/9/9/9/4K4 b G 1')!;
  const goldDrops = generateMoves(pos).filter((m) => m.pieceType === 'gold' && typeof m.from === 'string');
  expect(goldDrops.length).toBeGreaterThan(0);
});
