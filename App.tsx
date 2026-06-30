import React, { useState, useEffect } from 'react';
import { SafeAreaView, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { HomeScreen } from './src/ui/HomeScreen';
import { SolvingScreen } from './src/ui/SolvingScreen';
import { ResultScreen } from './src/ui/ResultScreen';
import { AlarmSettings, loadSettings } from './src/lib/settings';
import { scheduleAlarm } from './src/lib/alarm';

// Show notifications while app is foregrounded (native only — browsers can't fire local alarms)
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export default function App() {
  const [screen, setScreen] = useState<'home' | 'solving' | 'result'>('home');
  const [settings, setSettings] = useState<AlarmSettings | null>(null);

  useEffect(() => { loadSettings().then(setSettings); }, []);

  // Route notification tap → solving screen (native only)
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      setScreen('solving');
    });
    return () => subscription.remove();
  }, []);

  // Re-schedule alarm whenever settings change
  useEffect(() => {
    if (settings) {
      scheduleAlarm(settings).catch(() => {});
    }
  }, [settings]);

  const handleSettingsChange = (s: AlarmSettings) => {
    setSettings(s);
  };

  if (!settings) return <SafeAreaView />;
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {screen === 'home' && (
        <HomeScreen
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onStartPreview={() => setScreen('solving')}
        />
      )}
      {screen === 'solving' && (
        <SolvingScreen settings={settings} onFinished={() => setScreen('result')} />
      )}
      {screen === 'result' && (
        <ResultScreen onClose={() => setScreen('home')} />
      )}
    </SafeAreaView>
  );
}
