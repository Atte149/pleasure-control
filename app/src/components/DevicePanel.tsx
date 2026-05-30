import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
                    <div>
                      <p className="font-medium text-sm">
                        {d.deviceName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ID: {d.deviceIndex}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
                    Connected
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
