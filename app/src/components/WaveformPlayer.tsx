import { useEffect } from 'react';
import { ButtplugClientDevice } from 'buttplug';
import { useDeviceOutput } from '@/hooks/useDeviceOutput';
import type { WaveformPattern, DeviceState } from '@/types';

interface WaveformPlayerProps {
  isPlaying: boolean;
  currentTime: number;
  activePattern: WaveformPattern | null;
  devices: Map<number, DeviceState>;
  getIntensityAtTime: (pattern: WaveformPattern, time: number) => number;
  getDevice: (index: number) => ButtplugClientDevice | undefined;
}

export function WaveformPlayer({
  isPlaying,
  currentTime,
  activePattern,
  devices,
  getIntensityAtTime,
  getDevice,
}: WaveformPlayerProps) {
  const { sendIntensity, stopAll } = useDeviceOutput(devices, getDevice);

  useEffect(() => {
    if (!isPlaying || !activePattern) return;
    const intensity = getIntensityAtTime(activePattern, currentTime);
    sendIntensity(intensity, 0.02);
  }, [isPlaying, currentTime, activePattern, getIntensityAtTime, sendIntensity]);

  useEffect(() => {
    if (!isPlaying) stopAll();
  }, [isPlaying, stopAll]);

  return null;
}
