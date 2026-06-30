import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { AlarmSettings } from './settings';

/**
 * Pure function: returns the next Date at hour:minute.
 * If that time is still ahead today, returns today's date; otherwise rolls over to tomorrow.
 * Note: pure utility for display/testing only — NOT used by scheduleAlarm (which relies on the DAILY trigger).
 */
export function nextTriggerDate(now: Date, hour: number, minute: number): Date {
  const d = new Date(now);
  d.setHours(hour, minute, 0, 0);
  if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 1);
  return d;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function cancelAllAlarms(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleAlarm(settings: AlarmSettings): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  await cancelAllAlarms();
  if (!settings.enabled) return null;
  // 通知許可が無いと scheduleNotificationAsync は成功扱いでも実際には発火しない。
  // requestPermissionsAsync はダイアログを一度しか出さない（以後はキャッシュ済み状態を返す）ので毎回呼んで安全。
  const granted = await requestNotificationPermission();
  if (!granted) return null;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: '詰将棋目覚まし',
      body: 'タップして詰将棋を解こう',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: settings.hour,
      minute: settings.minute,
    },
  });
}
