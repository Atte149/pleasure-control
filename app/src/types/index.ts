export type ConnectionType = 'websocket' | 'bluetooth';

export interface DeviceState {
  deviceIndex: number;
  deviceName: string;
  vibrateIntensity: number;
  rotateIntensity: number;
  rotateClockwise: boolean;
  oscillateIntensity: number;
  constrictIntensity: number;
  isActive: boolean;
  batteryLevel?: number; // 0-100 percentage, undefined if not supported
  rssi?: number; // Signal strength, undefined if not available
}

export interface WaveformPoint {
  time: number;
  intensity: number;
}

export interface WaveformPattern {
  id: string;
  name: string;
  points: WaveformPoint[];
  duration: number;
  loop: boolean;
}

export interface AudioAnalysisState {
  file: File | null;
  audioBuffer: AudioBuffer | null;
  waveformData: number[];
  duration: number;
  isPlaying: boolean;
  playbackTime: number;
  intensityScale: number;
}

export type TabType = 'devices' | 'manual' | 'patterns' | 'modes' | 'games' | 'audio' | 'settings';

export type OutputCapability = 'Vibrate' | 'Rotate' | 'Oscillate' | 'Constrict';
