import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { AudioPlayer } from 'expo-audio';
import { PUZZLES } from '../lib/puzzles';
import type { Puzzle } from '../lib/puzzles';
import {
  createSession,
  currentPuzzle,
  recordResult,
  type SessionState,
} from '../lib/session';
import type { AlarmSettings } from '../lib/settings';

const MAX_PLIES = Math.max(...PUZZLES.map((p) => p.plies));
import { startAlarmLoop, stopAlarmLoop } from '../lib/sound';
import { SolveBoard } from './SolveBoard';

type Props = {
  settings: AlarmSettings;
  onFinished: () => void;
};

/** Fisher–Yates in-place shuffle; returns the array. */
function shuffleInPlace(arr: Puzzle[]): Puzzle[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function SolvingScreen({ settings, onFinished }: Props) {
  const [session, setSession] = useState<SessionState>(() => {
    let s = createSession(
      {
        minPlies: settings.minPlies,
        maxPlies: settings.maxPlies,
        requiredCorrect: settings.requiredCorrect,
      },
      PUZZLES,
      shuffleInPlace,
    );
    // Safety fallback: if a previously-persisted bad setting produced an empty pool,
    // widen to the full puzzle range so the alarm cannot soft-lock.
    // This preserves "must solve to stop" — it widens the puzzle set, it does NOT skip/dismiss.
    if (currentPuzzle(s) === null) {
      s = createSession(
        { minPlies: 1, maxPlies: MAX_PLIES, requiredCorrect: settings.requiredCorrect },
        PUZZLES,
        shuffleInPlace,
      );
    }
    return s;
  });

  // Keep a ref to the alarm player so cleanup always has the latest handle.
  const playerRef = useRef<AudioPlayer | null>(null);

  // Start alarm loop on mount; stop on unmount.
  useEffect(() => {
    const player = startAlarmLoop();
    playerRef.current = player;
    return () => {
      stopAlarmLoop(player);
      playerRef.current = null;
    };
  }, []);

  // When the session reaches done, stop alarm and call onFinished.
  useEffect(() => {
    if (session.done) {
      if (playerRef.current) {
        stopAlarmLoop(playerRef.current);
        playerRef.current = null;
      }
      onFinished();
    }
  }, [session.done, onFinished]);

  const handleSolved = useCallback(() => {
    setSession((prev) => recordResult(prev, true));
  }, []);

  const handleWrong = useCallback(() => {
    setSession((prev) => recordResult(prev, false));
  }, []);

  const puzzle = currentPuzzle(session);

  if (!puzzle || session.done) {
    // Transitioning — render nothing while onFinished fires.
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        {session.correct}/{session.requiredCorrect}問正解
      </Text>
      <SolveBoard
        key={puzzle.id}
        puzzleSfen={puzzle.sfen}
        requiredPliesForPuzzle={puzzle.plies}
        onSolved={handleSolved}
        onWrong={handleWrong}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  progress: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
});
