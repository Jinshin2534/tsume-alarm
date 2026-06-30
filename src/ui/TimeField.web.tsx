import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { TimeFieldProps } from './TimeField';

const pad = (n: number) => n.toString().padStart(2, '0');
const wrap = (n: number, mod: number) => ((n % mod) + mod) % mod;

// Web fallback: the native DateTimePicker has no reliable web rendering,
// so on web we use simple +/- steppers (hour 0-23, minute 0-59).
export function TimeField({ hour, minute, onChange }: TimeFieldProps) {
  return (
    <View style={styles.row}>
      <Stepper
        display={pad(hour)}
        onInc={() => onChange(wrap(hour + 1, 24), minute)}
        onDec={() => onChange(wrap(hour - 1, 24), minute)}
        label="時"
      />
      <Text style={styles.colon}>:</Text>
      <Stepper
        display={pad(minute)}
        onInc={() => onChange(hour, wrap(minute + 1, 60))}
        onDec={() => onChange(hour, wrap(minute - 1, 60))}
        label="分"
      />
    </View>
  );
}

function Stepper({
  display,
  onInc,
  onDec,
  label,
}: {
  display: string;
  onInc: () => void;
  onDec: () => void;
  label: string;
}) {
  return (
    <View style={styles.stepper}>
      <TouchableOpacity style={styles.btn} onPress={onInc} accessibilityLabel={`${label}を増やす`}>
        <Text style={styles.btnText}>▲</Text>
      </TouchableOpacity>
      <Text style={styles.value}>{display}</Text>
      <TouchableOpacity style={styles.btn} onPress={onDec} accessibilityLabel={`${label}を減らす`}>
        <Text style={styles.btnText}>▼</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  colon: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  stepper: { alignItems: 'center' },
  btn: { paddingHorizontal: 16, paddingVertical: 2 },
  btnText: { fontSize: 18, color: '#4a90d9' },
  value: { fontSize: 28, fontWeight: '700', minWidth: 48, textAlign: 'center' },
});
