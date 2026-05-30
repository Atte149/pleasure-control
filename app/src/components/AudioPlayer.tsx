import { useEffect } from 'react';
import { ButtplugClientDevice } from 'buttplug';
import { useDeviceOutput } from '@/hooks/useDeviceOutput';
import type { DeviceState } from '@/types';

interface AudioPlayerProps {
  isPlaying: boolean;
  playbackTime: number;
  duration: number;
  waveformData: number[];
  intensityScale: number;
  devices: Map<number, DeviceState>;
  getDevice: (index: number) => ButtplugClientDevice | undefined;
}

export function AudioPlayer({
  isPlaying,
  playbackTime,
  duration,
  waveformData,
  intensityScale,
  devices,
  getDevice,
}: AudioPlayerProps) {
  const { sendIntensity, stopAll } = useDeviceOutput(devices, getDevice);

  useEffect(() => {
    if (!isPlaying || waveformData.length === 0 || duration === 0) return;

    const normalizedTime = Math.max(0, Math.min(playbackTime / duration, 0.999));
    const index = Math.floor(normalizedTime * (waveformData.length - 1));
    const intensity = (waveformData[index] || 0) * intensityScale;

    sendIntensity(intensity, 0.03);
  }, [isPlaying, playbackTime, duration, waveformData, intensityScale, sendIntensity]);

  useEffect(() => {
    if (!isPlaying) stopAll();
  }, [isPlaying, stopAll]);

  return null;
}
