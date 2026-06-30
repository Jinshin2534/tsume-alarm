import { Position, Square } from 'tsshogi';
import { toGrid, destinationsFrom } from '../../ui/boardModel';

test('toGrid returns 9x9 with the kings placed', () => {
  const pos = Position.newBySFEN('4k4/9/9/9/9/9/9/9/4K4 b - 1')!;
  const grid = toGrid(pos);
  expect(grid.length).toBe(9);
  expect(grid[0].length).toBe(9);
  const kings = grid.flat().filter((c) => c.piece?.type === 'king');
  expect(kings.length).toBe(2);
});

test('destinationsFrom lists legal targets for a piece', () => {
  const pos = Position.newBySFEN('4k4/9/9/9/9/9/9/9/4K4 b G 1')!;
  // 盤上の先手玉の移動先
  const from = Square.newByUSI('5i')!;
  const dests = destinationsFrom(pos, from)
    .map((s) => s.usi)
    .sort();
  // 5九の先手玉は最下段なので前方向の5マス（4八/5八/6八/4九/6九）へ動ける。
  expect(dests).toEqual(['4h', '4i', '5h', '6h', '6i']);
});
