import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Zap,
  RotateCw,
  Activity,
  CircleDot,
  Smartphone,
  AlertCircle,
} from 'lucide-react';
import { DeviceOutput, ButtplugClientDevice, OutputType } from 'buttplug';
import type { DeviceState } from '@/types';

interface ManualControlPanelProps {
  devices: Map<number, DeviceState>;
  isConnected: boolean;
  onUpdateDeviceState: (deviceId: number, updates: Partial<DeviceState>) => void;
  getDevice: (index: number) => ButtplugClientDevice | undefined;
}

const CMD_TIMEOUT_MS = 3000;

async function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${CMD_TIMEOUT_MS}ms`)), CMD_TIMEOUT_MS)
    ),
  ]);
}

export function ManualControlPanel({
  devices,
  isConnected,
  onUpdateDeviceState,
  getDevice,
}: ManualControlPanelProps) {
  const [masterIntensity, setMasterIntensity] = useState(0);
  const [activeTab, setActiveTab] = useState<'individual' | 'master'>('individual');

  const sendOutput = useCallback(async (
    device: ButtplugClientDevice,
    outputType: OutputType,
    intensity: number
  ) => {
    try {
      if (!device.hasOutput(outputType)) return;
      const factoryMap: Record<string, typeof DeviceOutput.Vibrate> = {
        [OutputType.Vibrate]: DeviceOutput.Vibrate,
        [OutputType.Rotate]: DeviceOutput.Rotate,
        [OutputType.Oscillate]: DeviceOutput.Oscillate,
      };
      const factory = factoryMap[outputType];
      if (!factory) return;
      await withTimeout(device.runOutput(factory.percent(intensity)), `${outputType} command`);
    } catch (e: unknown) {
      console.error(`[Ctrl] ${outputType} failed:`, e instanceof Error ? e.message : String(e));
    }
  }, []);

  const handleVibrateChange = useCallback(async (deviceIndex: number, value: number) => {
    onUpdateDeviceState(deviceIndex, { vibrateIntensity: value });
    const device = getDevice(deviceIndex);
    if (!device) return;
    await sendOutput(device, OutputType.Vibrate, value);
  }, [getDevice, onUpdateDeviceState, sendOutput]);

  const handleRotateChange = useCallback(async (deviceIndex: number, value: number) => {
    onUpdateDeviceState(deviceIndex, { rotateIntensity: value });
    const device = getDevice(deviceIndex);
    if (!device) return;
    await sendOutput(device, OutputType.Rotate, value);
  }, [getDevice, onUpdateDeviceState, sendOutput]);

  const handleOscillateChange = useCallback(async (deviceIndex: number, value: number) => {
    onUpdateDeviceState(deviceIndex, { oscillateIntensity: value });
    const device = getDevice(deviceIndex);
    if (!device) return;
    await sendOutput(device, OutputType.Oscillate, value);
  }, [getDevice, onUpdateDeviceState, sendOutput]);

  const handleMasterVibrate = useCallback(async (value: number) => {
    setMasterIntensity(value);
    for (const [id] of devices) {
      const device = getDevice(id);
      if (!device?.hasOutput(OutputType.Vibrate)) continue;
      onUpdateDeviceState(id, { vibrateIntensity: value });
      await sendOutput(device, OutputType.Vibrate, value);
    }
  }, [devices, getDevice, onUpdateDeviceState, sendOutput]);

  const stopAll = useCallback(async () => {
    setMasterIntensity(0);
    for (const [id] of devices) {
      onUpdateDeviceState(id, {
        vibrateIntensity: 0,
        rotateIntensity: 0,
        oscillateIntensity: 0,
        constrictIntensity: 0,
      });
      const device = getDevice(id);
      if (device) {
        try {
          await withTimeout(device.stop(), 'stop command');
        } catch {
          // ignore
        }
      }
    }
  }, [devices, getDevice, onUpdateDeviceState]);

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Not Connected</p>
            <p className="text-sm mt-1">Connect to Intiface first to control devices</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (devices.size === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No Devices</p>
            <p className="text-sm mt-1">Scan for devices to start controlling them</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          onClick={() => setActiveTab('individual')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'individual'
              ? 'bg-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Individual
        </button>
        <button
          onClick={() => setActiveTab('master')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'master'
              ? 'bg-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Master Control
        </button>
      </div>

      {activeTab === 'master' ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Master Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  All Devices Vibration
                </Label>
                <Badge variant="secondary">{Math.round(masterIntensity * 100)}%</Badge>
              </div>
              <Slider
                value={[masterIntensity]}
                onValueChange={([v]) => handleMasterVibrate(v)}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>
            <Button onClick={stopAll} variant="destructive" className="w-full">
              Stop All Devices
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {Array.from(devices.values()).map(({ deviceIndex, deviceName, vibrateIntensity, rotateIntensity, oscillateIntensity }) => {
            const device = getDevice(deviceIndex);
            const hasVibrate = device?.hasOutput(OutputType.Vibrate) ?? false;
            const hasRotate = device?.hasOutput(OutputType.Rotate) ?? false;
            const hasOscillate = device?.hasOutput(OutputType.Oscillate) ?? false;

            return (
              <Card key={deviceIndex}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      {device?.displayName || deviceName}
                    </CardTitle>
                    <div className="flex gap-1">
                      {hasVibrate && <Badge variant="outline" className="text-xs">VIB</Badge>}
                      {hasRotate && <Badge variant="outline" className="text-xs">ROT</Badge>}
                      {hasOscillate && <Badge variant="outline" className="text-xs">OSC</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {hasVibrate && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5" />
                          Vibration
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(vibrateIntensity * 100)}%
                        </span>
                      </div>
                      <Slider
                        value={[vibrateIntensity]}
                        onValueChange={([v]) => handleVibrateChange(deviceIndex, v)}
                        min={0}
                        max={1}
                        step={0.01}
                      />
                    </div>
                  )}

                  {hasRotate && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm flex items-center gap-2">
                          <RotateCw className="w-3.5 h-3.5" />
                          Rotation
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(rotateIntensity * 100)}%
                        </span>
                      </div>
                      <Slider
                        value={[rotateIntensity]}
                        onValueChange={([v]) => handleRotateChange(deviceIndex, v)}
                        min={0}
                        max={1}
                        step={0.01}
                      />
                    </div>
                  )}

                  {hasOscillate && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5" />
                          Oscillation
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(oscillateIntensity * 100)}%
                        </span>
                      </div>
                      <Slider
                        value={[oscillateIntensity]}
                        onValueChange={([v]) => handleOscillateChange(deviceIndex, v)}
                        min={0}
                        max={1}
                        step={0.01}
                      />
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleVibrateChange(deviceIndex, 0);
                      handleRotateChange(deviceIndex, 0);
                      handleOscillateChange(deviceIndex, 0);
                      device?.stop().catch(() => {});
                    }}
                    className="w-full"
                  >
                    <CircleDot className="w-3.5 h-3.5 mr-1" />
                    Stop Device
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
