import { Position, Square } from 'tsshogi';
import { judgeMove } from '../judge';
import { matingFirstMoves } from '../verify';

// k8/9/1SN6/9/9/9/9/9/8K b G 1
// 後手玉9一、銀8三、桂8三隣。先手持ち金1枚。1手詰（余詰あり）。
// Confirmed: mateInPlies(pos, 1) === 1, matingFirstMoves(pos, 1).length === 3
const SFEN = 'k8/9/1SN6/9/9/9/9/9/8K b G 1';

test('correct 1-ply mating move is solved', () => {
  const pos = Position.newBySFEN(SFEN)!;
  const correct = matingFirstMoves(pos, 1)[0];
  const r = judgeMove(pos, correct, 1);
  expect(r.status).toBe('solved');
});

test('a non-checking / non-mating move is wrong', () => {
  const pos = Position.newBySFEN(SFEN)!;
  // 玉から遠い無関係な金打ち（王手にならない手）
  const idle = pos.createMove('gold' as any, Square.newByUSI('1i')!)!;
  const r = judgeMove(pos, idle, 1);
  expect(r.status).toBe('wrong');
});
