import React, { useState, useCallback } from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { Position, Color, Move, PieceType, Square } from 'tsshogi';
import { judgeMove } from '../lib/judge';
import { destinationsFrom } from './boardModel';
import { Board } from './Board';
import { Hand } from './Hand';
import { Selection, resolvePress, PressResult } from './interaction';

type Props = {
  puzzleSfen: string;
  requiredPliesForPuzzle: number;
  onSolved: () => void;
  onWrong: () => void;
};

type PromotionModal = {
  base: Move;
  promoted: Move;
};

export function SolveBoard({ puzzleSfen, requiredPliesForPuzzle, onSolved, onWrong }: Props) {
  const [pos, setPos] = useState<Position>(() => {
    const p = Position.newBySFEN(puzzleSfen);
    if (!p) throw new Error(`Invalid SFEN: ${puzzleSfen}`);
    return p as Position;
  });
  const [selection, setSelection] = useState<Selection>({ kind: 'none' });
  const [remainingPlies, setRemainingPlies] = useState(requiredPliesForPuzzle);
  const [promotionModal, setPromotionModal] = useState<PromotionModal | null>(null);

  // Compute highlights from current selection
  const highlights: Square[] =
    selection.kind === 'square' ? destinationsFrom(pos, selection.from) : [];

  const selectedFrom: Square | null =
    selection.kind === 'square' ? selection.from : null;

  const applyAttackerMove = useCallback(
    (move: Move, currentPos: Position, currentPlies: number) => {
      const r = judgeMove(currentPos, move, currentPlies);
      if (r.status === 'wrong') {
        onWrong();
        return;
      }
      if (r.status === 'solved') {
        const next = currentPos.clone() as Position;
        next.doMove(move);
        setPos(next);
        onSolved();
        return;
      }
      // continue: apply attacker move + defender reply
      const next = currentPos.clone() as Position;
      next.doMove(move);
      next.doMove(r.defenderReply);
      setPos(next);
      setRemainingPlies(currentPlies - 2);
    },
    [onSolved, onWrong],
  );

  const handleSquarePress = useCallback(
    (sq: Square) => {
      const result: PressResult = resolvePress(pos, selection, sq);
      if (result.needsPromotionChoice) {
        setSelection({ kind: 'none' });
        setPromotionModal(result.needsPromotionChoice);
        return;
      }
      setSelection(result.selection);
      if (result.move) {
        applyAttackerMove(result.move, pos, remainingPlies);
      }
    },
    [pos, selection, remainingPlies, applyAttackerMove],
  );

  const handleSelectDrop = useCallback(
    (pt: PieceType) => {
      if (selection.kind === 'drop' && selection.pt === pt) {
        setSelection({ kind: 'none' });
      } else {
        setSelection({ kind: 'drop', pt });
      }
    },
    [selection],
  );

  const handlePromotionChoice = useCallback(
    (move: Move) => {
      setPromotionModal(null);
      applyAttackerMove(move, pos, remainingPlies);
    },
    [pos, remainingPlies, applyAttackerMove],
  );

  const attackerColor = pos.color;
  const defenderColor = attackerColor === Color.BLACK ? Color.WHITE : Color.BLACK;

  return (
    <View style={styles.container}>
      {/* Defender hand (top) */}
      <Hand
        pos={pos}
        color={defenderColor}
        selection={{ kind: 'none' }}
        onSelectDrop={() => {}}
      />

      {/* Board */}
      <Board
        pos={pos}
        selectedFrom={selectedFrom}
        highlights={highlights}
        onSquarePress={handleSquarePress}
      />

      {/* Attacker hand (bottom) */}
      <Hand
        pos={pos}
        color={attackerColor}
        selection={selection}
        onSelectDrop={handleSelectDrop}
      />

      {/* Remaining plies indicator */}
      <Text style={styles.pliesText}>{remainingPlies}手詰め</Text>

      {/* Promotion choice modal */}
      <Modal
        visible={promotionModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPromotionModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>成りますか？</Text>
            <View style={styles.modalButtons}>
              {promotionModal && (
                <>
                  <Pressable
                    style={styles.modalBtn}
                    onPress={() => handlePromotionChoice(promotionModal.promoted)}
                  >
                    <Text style={styles.modalBtnText}>成る</Text>
                  </Pressable>
                  <Pressable
                    style={styles.modalBtn}
                    onPress={() => handlePromotionChoice(promotionModal.base)}
                  >
                    <Text style={styles.modalBtnText}>成らない</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 8 },
  pliesText: { marginTop: 8, fontSize: 14, color: '#555' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    minWidth: 200,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  modalButtons: { flexDirection: 'row', gap: 16 },
  modalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#5b3',
    borderRadius: 6,
  },
  modalBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
