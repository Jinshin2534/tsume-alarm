import { createAudioPlayer } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ALARM_ASSET = require('../../assets/alarm.wav') as number;

/**
 * Starts the alarm sound looping. Returns the player so the caller can stop it.
 * API confirmed from node_modules/expo-audio/src/AudioModule.types.ts:
 *   player.loop: boolean — set true to enable looping
 *   player.play(): void — start playback
 *   player.pause(): void — pause playback
 *   player.remove(): void — free native resources
 * createAudioPlayer() from node_modules/expo-audio/src/ExpoAudio.ts (line 401)
 */
export function startAlarmLoop(): AudioPlayer {
  const player = createAudioPlayer(ALARM_ASSET);
  player.loop = true;
  player.play();
  return player;
}

/**
 * Stops and releases the alarm player created by startAlarmLoop().
 */
export function stopAlarmLoop(player: AudioPlayer): void {
  player.pause();
  player.remove();
}
