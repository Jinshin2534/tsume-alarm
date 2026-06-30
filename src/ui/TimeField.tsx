import React, { useCallback } from 'react';
import { Platform, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export type TimeFieldProps = {
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
};

function toDate(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

// Native time picker. Metro substitutes TimeField.web.tsx on web.
export function TimeField({ hour, minute, onChange }: TimeFieldProps) {
  const handle = useCallback(
    (_event: DateTimePickerEvent, date?: Date) => {
      if (!date) return;
      onChange(date.getHours(), date.getMinutes());
    },
    [onChange],
  );
  return (
    <DateTimePicker
      value={toDate(hour, minute)}
      mode="time"
      is24Hour
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      onChange={handle}
      style={styles.picker}
    />
  );
}

const styles = StyleSheet.create({
  picker: { marginTop: 4, alignSelf: 'flex-start' },
});
