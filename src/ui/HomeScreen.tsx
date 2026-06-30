import React, { useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { AlarmSettings, normalizeSettings, saveSettings } from '../lib/settings';
import { PUZZLES } from '../lib/puzzles';

const MAX_PLIES = Math.max(...PUZZLES.map((p) => p.plies));

export type HomeScreenProps = {
  settings: AlarmSettings;
  onSettingsChange: (s: AlarmSettings) => void;
  onStartPreview: () => void;
};

// Construct a Date from hour/minute (date portion is irrelevant for time picker)
function toDate(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function HomeScreen({ settings, onSettingsChange, onStartPreview }: HomeScreenProps) {
  const commit = useCallback(
    (patch: Partial<AlarmSettings>) => {
      const next = normalizeSettings({ ...settings, ...patch });
      saveSettings(next).catch(() => {/* ignore persistence errors */});
      onSettingsChange(next);
    },
    [settings, onSettingsChange],
  );

  const handleTimeChange = useCallback(
    (_event: DateTimePickerEvent, date?: Date) => {
      if (!date) return;
      commit({ hour: date.getHours(), minute: date.getMinutes() });
    },
    [commit],
  );

  const pliesLabels: Record<number, string> = { 1: '1手', 3: '3手', 5: '5手' };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>詰将棋アラーム</Text>

      {/* ── アラーム ON/OFF ── */}
      <View style={styles.row}>
        <Text style={styles.label}>アラーム</Text>
        <Switch
          value={settings.enabled}
          onValueChange={(v) => commit({ enabled: v })}
          accessibilityLabel="アラームのオン／オフ"
        />
      </View>

      {/* ── 時刻ピッカー ── */}
      <View style={styles.section}>
        <Text style={styles.label}>起床時刻</Text>
        <DateTimePicker
          value={toDate(settings.hour, settings.minute)}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
          style={styles.timePicker}
        />
      </View>

      {/* ── 最小手数スライダー ── */}
      <View style={styles.section}>
        <View style={styles.sliderHeader}>
          <Text style={styles.label}>最小難易度</Text>
          <Text style={styles.valueText}>{pliesLabels[settings.minPlies] ?? `${settings.minPlies}手`}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={MAX_PLIES}
          step={2}
          value={Math.min(settings.minPlies, MAX_PLIES)}
          onSlidingComplete={(v) => commit({ minPlies: Math.min(Math.round(v), MAX_PLIES) })}
          minimumTrackTintColor="#4a90d9"
          maximumTrackTintColor="#ccc"
          accessibilityLabel="最小手数"
        />
        <View style={styles.sliderTicks}>
          {Array.from({ length: Math.floor((MAX_PLIES - 1) / 2) + 1 }, (_, i) => 1 + i * 2).map((n) => (
            <Text key={n} style={styles.tickLabel}>{n}</Text>
          ))}
        </View>
      </View>

      {/* ── 最大手数スライダー ── */}
      <View style={styles.section}>
        <View style={styles.sliderHeader}>
          <Text style={styles.label}>最大難易度</Text>
          <Text style={styles.valueText}>{pliesLabels[settings.maxPlies] ?? `${settings.maxPlies}手`}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={MAX_PLIES}
          step={2}
          value={Math.min(settings.maxPlies, MAX_PLIES)}
          onSlidingComplete={(v) => commit({ maxPlies: Math.min(Math.round(v), MAX_PLIES) })}
          minimumTrackTintColor="#4a90d9"
          maximumTrackTintColor="#ccc"
          accessibilityLabel="最大手数"
        />
        <View style={styles.sliderTicks}>
          {Array.from({ length: Math.floor((MAX_PLIES - 1) / 2) + 1 }, (_, i) => 1 + i * 2).map((n) => (
            <Text key={n} style={styles.tickLabel}>{n}</Text>
          ))}
        </View>
        {settings.maxPlies < settings.minPlies && (
          <Text style={styles.warningText}>最大は最小以上になります</Text>
        )}
      </View>

      {/* ── 必要正解数 ── */}
      <View style={styles.section}>
        <Text style={styles.label}>必要正解数</Text>
        <View style={styles.counterRow}>
          <TouchableOpacity
            style={styles.counterBtn}
            onPress={() => commit({ requiredCorrect: settings.requiredCorrect - 1 })}
            accessibilityLabel="正解数を減らす"
          >
            <Text style={styles.counterBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.counterValue}>{settings.requiredCorrect}問</Text>
          <TouchableOpacity
            style={styles.counterBtn}
            onPress={() => commit({ requiredCorrect: settings.requiredCorrect + 1 })}
            accessibilityLabel="正解数を増やす"
          >
            <Text style={styles.counterBtnText}>＋</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 今すぐ試すボタン ── */}
      <TouchableOpacity style={styles.previewBtn} onPress={onStartPreview} accessibilityRole="button">
        <Text style={styles.previewBtnText}>今すぐ試す</Text>
      </TouchableOpacity>

      {/* ── OS 制約の注意書き ── */}
      <Text style={styles.note}>
        通知をタップして起動・解答すると音が止まります／アプリ終了中は鳴りません
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  timePicker: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  valueText: {
    fontSize: 16,
    color: '#4a90d9',
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderTicks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  tickLabel: {
    fontSize: 12,
    color: '#888',
  },
  warningText: {
    fontSize: 12,
    color: '#e06c00',
    marginTop: 2,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 16,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4a90d9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 48,
    textAlign: 'center',
  },
  previewBtn: {
    backgroundColor: '#2e7d32',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  previewBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  note: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    lineHeight: 16,
  },
});
