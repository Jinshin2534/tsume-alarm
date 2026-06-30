import AsyncStorage from '@react-native-async-storage/async-storage';

export type Stats = {
  lastClearedISO: string | null;
  streak: number;
};

const DEFAULT_STATS: Stats = { lastClearedISO: null, streak: 0 };

/**
 * Pure function — no I/O.
 * todayISO and lastClearedISO are 'YYYY-MM-DD' strings.
 * - same day  → unchanged
 * - prev day (diff == 1) → streak + 1
 * - gap (diff > 1) or null → reset to 1
 */
export function updateStreak(prev: Stats, todayISO: string): Stats {
  const { lastClearedISO, streak } = prev;

  if (lastClearedISO === null) {
    return { lastClearedISO: todayISO, streak: 1 };
  }

  // Parse as UTC to avoid DST / local-timezone drift.
  const msPerDay = 24 * 60 * 60 * 1000;
  const prevDate = new Date(`${lastClearedISO}T00:00:00Z`);
  const todayDate = new Date(`${todayISO}T00:00:00Z`);
  const diffDays = Math.round((todayDate.getTime() - prevDate.getTime()) / msPerDay);

  if (diffDays === 0) {
    // Same day — don't double-count
    return { lastClearedISO, streak };
  }
  if (diffDays === 1) {
    // Consecutive day
    return { lastClearedISO: todayISO, streak: streak + 1 };
  }
  // Gap or future (diffDays < 0 edge case) → reset
  return { lastClearedISO: todayISO, streak: 1 };
}

// --------------- AsyncStorage I/O ---------------
const KEY = 'tsume-alarm/stats';

export async function loadStats(): Promise<Stats> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw);
    return {
      lastClearedISO:
        typeof parsed.lastClearedISO === 'string' ? parsed.lastClearedISO : null,
      streak:
        typeof parsed.streak === 'number' && Number.isFinite(parsed.streak)
          ? parsed.streak
          : 0,
    };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export async function saveStats(s: Stats): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(s));
}
