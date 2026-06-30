import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ImmutablePosition, Color, PieceType, standardPieceName } from 'tsshogi';
import { Selection } from './interaction';

type Props = {
  pos: ImmutablePosition;
  color: Color;
  selection: Selection;
  onSelectDrop: (pt: PieceType) => void;
};

export function Hand({ pos, color, selection, onSelectDrop }: Props) {
  const hand = pos.hand(color);
  const items: { pt: PieceType; count: number }[] = [];
  hand.forEach((pt, count) => {
    if (count > 0) items.push({ pt, count });
  });

  if (items.length === 0) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {items.map(({ pt, count }) => {
        const isSelected = selection.kind === 'drop' && selection.pt === pt;
        return (
          <Pressable
            key={pt}
            onPress={() => onSelectDrop(pt)}
            style={[styles.piece, isSelected && styles.selected]}
          >
            <Text style={[styles.label, color === Color.WHITE && styles.white]}>
              {standardPieceName(pt)}
            </Text>
            {count > 1 && <Text style={styles.count}>{count}</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: 44,
    paddingHorizontal: 4,
    backgroundColor: '#e8c97a',
    alignItems: 'center',
  },
  piece: {
    margin: 3,
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#8a6',
    backgroundColor: '#f3d9a4',
    alignItems: 'center',
    minWidth: 36,
  },
  selected: {
    backgroundColor: '#ffd27f',
    borderColor: '#e97',
  },
  label: { fontSize: 18, fontWeight: '600' },
  white: { transform: [{ rotate: '180deg' }] },
  count: { fontSize: 10, color: '#555' },
});
