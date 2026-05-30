import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen,
  Download,
  Wifi,
  Bluetooth,
  Settings,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Globe,
  Smartphone,
  Plug,
  RefreshCw,
} from 'lucide-react';

export function GuidePanel() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Getting Started Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">1</Badge>
              <h3 className="font-semibold flex items-center gap-2">
                <Download className="w-4 h-4" />
                Install Intiface Central
              </h3>
            </div>
            <div className="pl-8 space-y-2">
              <p className="text-sm text-muted-foreground">
                Intiface Central is the bridge between your browser and Bluetooth devices.
              </p>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Download links:</p>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" />
                    <a
                      href="https://intiface.com/central/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      intiface.com/central
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          {/* Step 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">2</Badge>
              <h3 className="font-semibold flex items-center gap-2">
                <Plug className="w-4 h-4" />
                Start Intiface Central
              </h3>
            </div>
            <div className="pl-8 space-y-2">
              <p className="text-sm text-muted-foreground">
                Launch the application and click &quot;Start Server&quot;. The default WebSocket port is 12345.
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-700">
                  Keep Intiface Central running while using this app. Do not close it.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Step 3 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">3</Badge>
              <h3 className="font-semibold flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Connect This App
              </h3>
            </div>
            <div className="pl-8 space-y-2">
              <p className="text-sm text-muted-foreground">
                Go to the <strong>Devices</strong> tab and click &quot;Connect to Intiface&quot;.
              </p>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-700">
                  Status should change to &quot;Connected&quot; with a green indicator.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Step 4 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">4</Badge>
              <h3 className="font-semibold flex items-center gap-2">
                <Bluetooth className="w-4 h-4" />
                Pair Your Device
              </h3>
            </div>
            <div className="pl-8 space-y-2">
              <p className="text-sm text-muted-foreground">
                Put your device in pairing mode, then click &quot;Scan Devices&quot; in this app.
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Make sure Bluetooth is enabled on your computer</li>
                <li>Most devices enter pairing mode automatically when powered on</li>
                <li>Scanning auto-stops after 30 seconds</li>
              </ul>
            </div>
          </div>

          <Separator />

          {/* Step 5 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">5</Badge>
              <h3 className="font-semibold flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Control Your Device
              </h3>
            </div>
            <div className="pl-8 space-y-2">
              <p className="text-sm text-muted-foreground">
                Switch to the <strong>Manual</strong>, <strong>Waveform</strong>, or <strong>Audio</strong> tab to control your device.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium text-sm flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                &quot;Failed to connect to Intiface&quot;
              </h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Verify Intiface Central is running</li>
                <li>Check that the server is started (green indicator)</li>
                <li>Default port is 12345 - ensure it&apos;s not blocked</li>
                <li>Try restarting Intiface Central</li>
              </ul>
            </div>

            <div className="p-3 border rounded-lg">
              <h4 className="font-medium text-sm flex items-center gap-2 mb-1">
                <Bluetooth className="w-4 h-4 text-blue-500" />
                Device not found during scan
              </h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Ensure device is powered on and in pairing mode</li>
                <li>Move device closer to your computer</li>
                <li>Check if device battery is charged</li>
                <li>Some devices need to be unpaired from other apps first</li>
                <li>Restart Intiface Central and try again</li>
              </ul>
            </div>

            <div className="p-3 border rounded-lg">
              <h4 className="font-medium text-sm flex items-center gap-2 mb-1">
                <RefreshCw className="w-4 h-4 text-green-500" />
                Controls not responding
              </h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Check device connection in Devices tab</li>
                <li>Click &quot;Stop All&quot; and try again</li>
                <li>Reconnect to Intiface server</li>
                <li>Some devices sleep after inactivity - wake them up</li>
              </ul>
            </div>

            <div className="p-3 border rounded-lg">
              <h4 className="font-medium text-sm flex items-center gap-2 mb-1">
                <Smartphone className="w-4 h-4 text-purple-500" />
                Firefox-specific notes
              </h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Firefox requires user interaction before audio playback</li>
                <li>Always click a button to start audio, not auto-play</li>
                <li>Web Bluetooth may need flags enabled in some versions</li>
                <li>If issues persist, try Chrome or Edge</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Tips & Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 flex-shrink-0">1</Badge>
              Start with low intensity and gradually increase
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 flex-shrink-0">2</Badge>
              Use waveform patterns for automated experiences
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 flex-shrink-0">3</Badge>
              Audio-reactive mode works best with bass-heavy music
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 flex-shrink-0">4</Badge>
              Adjust intensity scale in audio mode to match your preference
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 flex-shrink-0">5</Badge>
              Always click &quot;Stop All&quot; before disconnecting
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
