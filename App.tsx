import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import { HomeScreen } from './src/ui/HomeScreen';
import { AlarmSettings, loadSettings } from './src/lib/settings';

export default function App() {
  const [screen, setScreen] = useState<'home' | 'solving' | 'result'>('home');
  const [settings, setSettings] = useState<AlarmSettings | null>(null);
  useEffect(() => { loadSettings().then(setSettings); }, []);
  if (!settings) return <SafeAreaView />;
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {screen === 'home' && (
        <HomeScreen
          settings={settings}
          onSettingsChange={setSettings}
          onStartPreview={() => setScreen('solving')}
        />
      )}
      {/* solving / result は Task 13/14 で接続 */}
    </SafeAreaView>
  );
}
