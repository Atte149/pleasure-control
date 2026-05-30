import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ButtplugClient,
  ButtplugBrowserWebsocketClientConnector,
  ButtplugClientDevice,
} from 'buttplug';
import type { DeviceState } from '@/types';
import { getServerUrl } from '@/lib/serverConfig';

const SCAN_TIMEOUT_MS = 30000;
const DEVICE_POLL_MS = 2000;

export function useButtplug() {
  const [client, setClient] = useState<ButtplugClient | null>(null);
  const clientRef = useRef<ButtplugClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<Map<number, DeviceState>>(new Map());
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync ref immediately when state changes
  useEffect(() => {
    clientRef.current = client;
  }, [client]);

  const addDevice = useCallback((device: ButtplugClientDevice) => {
    setDevices(prev => {
      if (prev.has(device.index)) return prev;
      const next = new Map(prev);
      next.set(device.index, {
        deviceIndex: device.index,
        deviceName: device.name,
        vibrateIntensity: 0,
        rotateIntensity: 0,
        rotateClockwise: true,
        oscillateIntensity: 0,
        constrictIntensity: 0,
        isActive: true,
      });
      return next;
    });
  }, []);

  const removeDevice = useCallback((deviceId: number) => {
    setDevices(prev => {
      if (!prev.has(deviceId)) return prev;
      const next = new Map(prev);
      next.delete(deviceId);
      return next;
    });
  }, []);

  const updateDeviceState = useCallback((deviceId: number, updates: Partial<DeviceState>) => {
    setDevices(prev => {
      const current = prev.get(deviceId);
      if (!current) return prev;
      const next = new Map(prev);
      next.set(deviceId, { ...current, ...updates });
      return next;
    });
  }, []);

  const getDevice = useCallback((index: number): ButtplugClientDevice | undefined => {
    return clientRef.current?.devices.get(index);
  }, []);

  const clearTimers = useCallback(() => {
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const disconnect = useCallback(async () => {
    clearTimers();
    try {
      await client?.disconnect();
    } catch {
      // ignore
    } finally {
      setClient(null);
      setIsConnected(false);
      setIsScanning(false);
      setDevices(new Map());
    }
  }, [client, clearTimers]);

  const stopScanning = useCallback(async () => {
    clearTimers();
    if (!client || !isConnected) return;
    try {
      await client.stopScanning();
    } catch {
      // ignore
    } finally {
      setIsScanning(false);
    }
  }, [client, isConnected, clearTimers]);

  const startScanning = useCallback(async () => {
    if (!client || !isConnected) return;
    try {
      setIsScanning(true);
      setError(null);
      await client.startScanning();

      // Poll device list — intiface-engine doesn't send unsolicited updates
      pollTimerRef.current = setInterval(() => {
        (client as unknown as { requestDeviceList?: () => Promise<void> }).requestDeviceList?.().catch(() => {});
      }, DEVICE_POLL_MS);

      scanTimerRef.current = setTimeout(() => {
        stopScanning().catch(() => {});
      }, SCAN_TIMEOUT_MS);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[Buttplug] Scan error:', message);
      setError(message || 'Failed to start scanning');
      setIsScanning(false);
    }
  }, [client, isConnected, stopScanning]);

  const stopAllDevices = useCallback(async () => {
    if (!client || !isConnected) return;
    try {
      await client.stopAllDevices();
      setDevices(prev => {
        const next = new Map(prev);
        for (const [id, state] of next) {
          next.set(id, {
            ...state,
            vibrateIntensity: 0,
            rotateIntensity: 0,
            oscillateIntensity: 0,
            constrictIntensity: 0,
          });
        }
        return next;
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[Buttplug] Stop all error:', message);
      setError(message || 'Failed to stop devices');
    }
  }, [client, isConnected]);

  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;
    setIsConnecting(true);
    setError(null);

    try {
      const buttplugClient = new ButtplugClient('Buttplug Controller');
      const connector = new ButtplugBrowserWebsocketClientConnector(getServerUrl());

      buttplugClient.addListener('deviceadded', (device: ButtplugClientDevice) => {
        addDevice(device);
      });

      buttplugClient.addListener('deviceremoved', (device: ButtplugClientDevice) => {
        removeDevice(device.index);
      });

      buttplugClient.addListener('disconnect', () => {
        setIsConnected(false);
        setDevices(new Map());
      });

      await buttplugClient.connect(connector);
      setClient(buttplugClient);
      setIsConnected(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[Buttplug] Connection error:', message);
      setError(message || 'Failed to connect to Intiface server');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnected, isConnecting, addDevice, removeDevice]);

  useEffect(() => {
    return () => {
      clearTimers();
      client?.disconnect().catch(() => {});
    };
  }, [client, clearTimers]);

  return {
    client,
    isConnected,
    isConnecting,
    isScanning,
    error,
    devices,
    connect,
    disconnect,
    startScanning,
    stopScanning,
    stopAllDevices,
    updateDeviceState,
    getDevice,
    setError,
  };
}
