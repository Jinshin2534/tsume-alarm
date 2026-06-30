import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { loadStats, saveStats, updateStreak } from '../lib/stats';

type Props = {
  onClose: () => void;
};

export function ResultScreen({ onClose }: Props): React.ReactElement {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const prev = await loadStats();
      // Format today as YYYY-MM-DD (local date is fine for a daily-streak UX)
      const today = new Date();
      const todayISO = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0'),
      ].join('-');
      const next = updateStreak(prev, todayISO);
      await saveStats(next);
      setStreak(next.streak);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.achievement}>達成！</Text>
      {streak !== null && (
        <Text style={styles.streak}>連続記録: {streak} 日</Text>
      )}
      <Pressable style={styles.button} onPress={onClose}>
        <Text style={styles.buttonText}>閉じる</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  achievement: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  streak: {
    fontSize: 24,
  },
  button: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 40,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
