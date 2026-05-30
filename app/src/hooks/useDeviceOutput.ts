import { useRef, useCallback, useEffect } from 'react';
import { DeviceOutput, ButtplugClientDevice, OutputType } from 'buttplug';
import type { DeviceState } from '@/types';

/**
 * Shared hook for sending intensity output to all connected devices.
 * Unifies the threshold-filtered output logic used by WaveformPlayer and AudioPlayer.
 *
 * Uses refs internally to avoid recreating callbacks when device state changes,
 * preventing effect re-runs in player components on every intensity update.
 */
export function useDeviceOutput(
  devices: Map<number, DeviceState>,
  getDevice: (index: number) => ButtplugClientDevice | undefined
) {
  const lastSentRef = useRef<Map<number, number>>(new Map());
  const devicesRef = useRef(devices);
  const getDeviceRef = useRef(getDevice);

  // Sync refs in effect to satisfy React linter rules
  useEffect(() => {
    devicesRef.current = devices;
    getDeviceRef.current = getDevice;
  });

  const sendIntensity = useCallback((intensity: number, threshold = 0.02) => {
    console.log('[useDeviceOutput] sendIntensity:', intensity, 'devices:', devicesRef.current.size);
    for (const [id] of devicesRef.current) {
      const device = getDeviceRef.current(id);
      console.log('[useDeviceOutput] device', id, ':', device?.name);
      if (!device) continue;

      const lastSent = lastSentRef.current.get(id) ?? -1;
      if (Math.abs(intensity - lastSent) <= threshold) continue;

      lastSentRef.current.set(id, intensity);

      if (device.hasOutput(OutputType.Vibrate)) {
        console.log('[useDeviceOutput] Sending Vibrate to', device.name, 'intensity:', intensity);
        device.runOutput(DeviceOutput.Vibrate.percent(intensity)).catch((e: unknown) => {
          console.error('[useDeviceOutput] Vibrate FAILED:', e instanceof Error ? e.message : String(e));
        });
      }
      if (device.hasOutput(OutputType.Rotate)) {
        device.runOutput(DeviceOutput.Rotate.percent(intensity)).catch((e: unknown) => {
          console.error('[useDeviceOutput] Rotate FAILED:', e instanceof Error ? e.message : String(e));
        });
      }
      if (device.hasOutput(OutputType.Oscillate)) {
        device.runOutput(DeviceOutput.Oscillate.percent(intensity)).catch((e: unknown) => {
          console.error('[useDeviceOutput] Oscillate FAILED:', e instanceof Error ? e.message : String(e));
        });
      }
    }
  }, []); // stable callback — refs mirror current props

  const stopAll = useCallback(() => {
    for (const [id] of devicesRef.current) {
      getDeviceRef.current(id)?.stop().catch(() => {});
    }
    lastSentRef.current.clear();
  }, []); // stable callback — refs mirror current props

  return { sendIntensity, stopAll };
}
