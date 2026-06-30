import { Position, InitialPositionSFEN } from 'tsshogi';

test('tsshogi loads and parses the tsume initial SFEN', () => {
  const pos = Position.newBySFEN(InitialPositionSFEN.TSUME_SHOGI);
  expect(pos).not.toBeNull();
  expect(pos!.sfen).toContain(' b ');
});
