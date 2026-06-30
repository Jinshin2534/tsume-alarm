import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ImmutablePosition, Square, Color, standardPieceName } from 'tsshogi';
import { toGrid } from './boardModel';

type Props = {
  pos: ImmutablePosition;
  selectedFrom: Square | null;
  highlights: Square[];
  onSquarePress: (sq: Square) => void;
};

export function Board({ pos, selectedFrom, highlights, onSquarePress }: Props) {
  const grid = toGrid(pos);
  const hi = new Set(highlights.map((s) => s.usi));
  return (
    <View style={styles.board}>
      {grid.map((row, y) => (
        <View key={y} style={styles.row}>
          {row.map((cell) => {
            const isSel = selectedFrom?.equals(cell.square);
            const isHi = hi.has(cell.square.usi);
            return (
              <Pressable
                key={cell.square.usi}
                onPress={() => onSquarePress(cell.square)}
                style={[styles.cell, isHi && styles.hi, isSel && styles.sel]}
              >
                {cell.piece && (
                  <Text style={[styles.piece, cell.piece.color === Color.WHITE && styles.white]}>
                    {standardPieceName(cell.piece.type)}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: { borderWidth: 2, borderColor: '#5b3', alignSelf: 'center', backgroundColor: '#f3d9a4' },
  row: { flexDirection: 'row' },
  cell: { width: 36, height: 40, borderWidth: 0.5, borderColor: '#8a6', alignItems: 'center', justifyContent: 'center' },
  hi: { backgroundColor: '#bfe3ff' },
  sel: { backgroundColor: '#ffd27f' },
  piece: { fontSize: 20, fontWeight: '600' },
  white: { transform: [{ rotate: '180deg' }] },
});
