import { Position } from 'tsshogi';
import { mateInPlies } from '../solver';

test('1-ply mate: head-gold (頭金)', () => {
  // 後手玉9一、銀8三・桂7三で玉の逃げ場(8a/8b)を塞ぐ。先手は金1枚持ち。
  // G*9b（頭金）が詰み。9bの金は銀8三に支えられ取れない。1手詰。
  const pos = Position.newBySFEN('k8/9/1SN6/9/9/9/9/9/8K b G 1')!;
  expect(mateInPlies(pos, 1)).toBe(1);
});

test('non-mate position returns null', () => {
  const pos = Position.newBySFEN('4k4/9/9/9/9/9/9/9/4K4 b G 1')!;
  // 中央の玉に金1枚だけでは1手詰なし
  expect(mateInPlies(pos, 1)).toBeNull();
});

test('pawn-drop mate is illegal: solver does not count it as mate', () => {
  // 上の頭金局面と同じ「箱」で、持ち駒が歩のみの局面。
  // 唯一の詰め筋 P*9b は打ち歩詰め（玉の逃げ場は全て塞がれ、9bの歩は銀8三が支える）。
  // 打ち歩詰め禁止により、これ以外に詰みは無いので1手詰は成立しない。
  const pos = Position.newBySFEN('k8/9/1SN6/9/9/9/9/9/8K b P 1')!;
  expect(mateInPlies(pos, 1)).toBeNull();
});

test('multi-ply (3-ply) AND/OR recursion: k8/2S6/9/9/9/9/9/9/8K b GG 1', () => {
  // 後手玉9一、先手銀8三、先手2金持ち。最短詰みは3手。
  // 1手詰はない（王手しても玉が逃げられる手が残る）。
  // mateInPlies(pos, 5) は最短3手を返す（余分な深さで上書きしない）。
  const pos = Position.newBySFEN('k8/2S6/9/9/9/9/9/9/8K b GG 1')!;
  expect(mateInPlies(pos, 1)).toBeNull();
  expect(mateInPlies(pos, 3)).toBe(3);
  expect(mateInPlies(pos, 5)).toBe(3);
});
