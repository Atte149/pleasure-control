import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BatteryIndicator } from '@/components/BatteryIndicator';
import { getServerUrl, setServerUrl, normalizeServerUrl, isAndroid } from '@/lib/serverConfig';
import {
  Bluetooth,
  Wifi,
  Power,
  PowerOff,
  Scan,
  ScanLine,
  AlertCircle,
  CheckCircle2,
  Smartphone,
  Loader2,
  Signal,
  Server,
  ExternalLink,
} from 'lucide-react';
import type { DeviceState } from '@/types';

interface DevicePanelProps {
  isConnected: boolean;
  isConnecting: boolean;
  isScanning: boolean;
  error: string | null;
  devices: Map<number, DeviceState>;
  onConnect: () => void;
  onDisconnect: () => void;
  onStartScan: () => void;
  onStopScan: () => void;
  onStopAll: () => void;
  onClearError: () => void;
}

export function DevicePanel({
  isConnected,
  isConnecting,
  isScanning,
  error,
  devices,
  onConnect,
  onDisconnect,
  onStartScan,
  onStopScan,
  onStopAll,
  onClearError,
}: DevicePanelProps) {
  const [serverUrl, setServerUrlState] = useState(() => getServerUrl());

  const handleServerUrlBlur = () => {
    const normalized = normalizeServerUrl(serverUrl);
    setServerUrlState(normalized);
    setServerUrl(normalized);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-green-600">Connected</span>
                </>
              ) : (
                <>
                  <PowerOff className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Disconnected</span>
                </>
              )}
            </div>
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'Active' : 'Idle'}
            </Badge>
          </div>

          {!isConnected && (
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Server className="w-3.5 h-3.5" />
                Intiface Server Address
              </Label>
              <Input
                value={serverUrl}
                onChange={(e) => setServerUrlState(e.target.value)}
                onBlur={handleServerUrlBlur}
                placeholder="ws://192.168.1.100:12345"
                disabled={isConnecting}
                className="font-mono text-sm"
              />
              {isAndroid() ? (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-md space-y-2">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>On Android:</strong> Install <strong>Intiface Central</strong> from the Play Store,
                    start the server, and use <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">ws://localhost:12345</code> (default).
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open('https://play.google.com/store/apps/details?id=org.metafetish.intiface_central', '_blank')}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                    Install Intiface Central
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  On desktop the default usually works. On a phone connecting to a PC, enter your PC's IP
                  running Intiface (e.g. ws://192.168.1.100:12345).
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                <button
                  onClick={onClearError}
                  className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 mt-1 underline transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {!isConnected ? (
              <Button
                onClick={onConnect}
                disabled={isConnecting}
                className="flex-1"
              >
                {isConnecting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Power className="w-4 h-4 mr-2" />
                )}
                {isConnecting ? 'Connecting...' : 'Connect to Intiface'}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={isScanning ? onStopScan : onStartScan}
                  className="flex-1"
                >
                  {isScanning ? (
                    <ScanLine className="w-4 h-4 mr-2" />
                  ) : (
                    <Scan className="w-4 h-4 mr-2" />
                  )}
                  {isScanning ? 'Stop Scan' : 'Scan Devices'}
                </Button>
                <Button
                  variant="outline"
                  onClick={onStopAll}
                >
                  Stop All
                </Button>
                <Button
                  variant="destructive"
                  onClick={onDisconnect}
                >
                  <PowerOff className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </>
            )}
          </div>

          {isScanning && (
            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Scanning for devices... (auto-stops in 30s)</span>
              </div>
              {devices.size > 0 ? (
                <div className="text-green-600 font-medium ml-6">
                  Found: {Array.from(devices.values()).map(d => d.deviceName).join(', ')}
                </div>
              ) : (
                <div className="text-amber-500 text-xs ml-6">
                  Ensure your device is powered on and in pairing mode (LED blinking). BLE connection may take 10-15 seconds.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bluetooth className="w-5 h-5" />
            Connected Devices ({devices.size})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {devices.size === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No devices connected</p>
              <p className="text-sm mt-1">
                {isConnected
                  ? 'Click "Scan Devices" to find your toys'
                  : 'Connect to Intiface first'}
              </p>
              {isConnected && !isScanning && (
                <p className="text-xs mt-2 text-amber-600">
                  Tip: device "Libo Miao" needs ~12s BLE negotiation. Keep the toy LED blinking (pairing mode) during scan.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {Array.from(devices.values()).map((d, index) => (
                <div
                  key={d.deviceIndex}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-all duration-300 hover:shadow-md hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ring-2 ring-primary/10 animate-pulse-slow">
                      <Smartphone className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {d.deviceName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-muted-foreground">
                          ID: {d.deviceIndex}
                        </p>
                        {d.rssi !== undefined && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Signal className="w-3 h-3" />
                            <span>{d.rssi} dBm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
                      Connected
                    </Badge>
                    <BatteryIndicator level={d.batteryLevel} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
