import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import * as Notifications from 'expo-notifications';
import { HomeScreen } from './src/ui/HomeScreen';
import { SolvingScreen } from './src/ui/SolvingScreen';
import { AlarmSettings, loadSettings } from './src/lib/settings';
import { scheduleAlarm } from './src/lib/alarm';

// Show notifications while app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [screen, setScreen] = useState<'home' | 'solving' | 'result'>('home');
  const [settings, setSettings] = useState<AlarmSettings | null>(null);

  useEffect(() => { loadSettings().then(setSettings); }, []);

  // Route notification tap → solving screen
  useEffect(() => {
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
      {/* result は Task 14 で接続 */}
    </SafeAreaView>
  );
}
