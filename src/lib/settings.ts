// AsyncStorage is only used by the I/O wrappers at the bottom of this file;
// the normalize* logic above them stays pure (no runtime dependency on it).
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AlarmSettings = {
  hour: number;
  minute: number;
  enabled: boolean;
  minPlies: number; // 奇数 1..9
  maxPlies: number; // 奇数 1..9, >= minPlies
  requiredCorrect: number; // >=1
};

export const DEFAULT_SETTINGS: AlarmSettings = {
  hour: 7,
  minute: 0,
  enabled: false,
  minPlies: 1,
  maxPlies: 3,
  requiredCorrect: 3,
};

const ODD = [1, 3, 5, 7, 9] as const;

const nearestOdd = (n: number): number =>
  ODD.reduce((a, b) => (Math.abs(b - n) < Math.abs(a - n) ? b : a), 1 as number);

const intInRange = (v: unknown, lo: number, hi: number, fallback: number): number => {
  const n = typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : NaN;
  return Number.isNaN(n) || n < lo || n > hi ? fallback : n;
};

export function normalizeSettings(input: unknown): AlarmSettings {
  const o = (input != null && typeof input === 'object' ? input : {}) as Record<string, unknown>;

  const rawMin = o.minPlies;
  const minPlies: number = (ODD as readonly number[]).includes(rawMin as number)
    ? (rawMin as number)
    : nearestOdd(typeof rawMin === 'number' ? rawMin : DEFAULT_SETTINGS.minPlies);

  const rawMax = o.maxPlies;
  let maxPlies: number = (ODD as readonly number[]).includes(rawMax as number)
    ? (rawMax as number)
    : nearestOdd(typeof rawMax === 'number' ? rawMax : DEFAULT_SETTINGS.maxPlies);
  if (maxPlies < minPlies) maxPlies = minPlies;

  return {
    hour: intInRange(o.hour, 0, 23, DEFAULT_SETTINGS.hour),
    minute: intInRange(o.minute, 0, 59, DEFAULT_SETTINGS.minute),
    enabled: typeof o.enabled === 'boolean' ? o.enabled : DEFAULT_SETTINGS.enabled,
    minPlies,
    maxPlies,
    requiredCorrect: intInRange(o.requiredCorrect, 1, 20, DEFAULT_SETTINGS.requiredCorrect),
  };
}

// 永続化 I/O（AsyncStorage）— 純粋部は normalizeSettings に集約。
const KEY = 'tsume-alarm/settings';

export async function loadSettings(): Promise<AlarmSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return normalizeSettings(raw ? JSON.parse(raw) : {});
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(s: AlarmSettings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(normalizeSettings(s)));
}
