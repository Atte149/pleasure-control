import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, TrendingUp, Download, Upload, Trash2, BarChart3, Clock, Zap } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

export function SettingsPanel() {
  const {
    settings,
    stats,
    updateSettings,
    resetSettings,
    resetStats,
    exportData,
    importData,
  } = useSettings();

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pleasure-control-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            importData(data);
            alert('Settings imported successfully!');
          } catch (err) {
            alert('Failed to import settings. Invalid file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const accentColors = [
    { name: 'Purple', hue: '280', color: 'hsl(280, 80%, 60%)' },
    { name: 'Pink', hue: '330', color: 'hsl(330, 80%, 60%)' },
    { name: 'Blue', hue: '220', color: 'hsl(220, 80%, 60%)' },
    { name: 'Green', hue: '150', color: 'hsl(150, 70%, 50%)' },
    { name: 'Orange', hue: '30', color: 'hsl(30, 90%, 60%)' },
    { name: 'Red', hue: '0', color: 'hsl(0, 80%, 60%)' },
  ];

  const topPatterns = Object.entries(stats.patternsUsed)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topModes = Object.entries(stats.modesUsed)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const topGames = Object.entries(stats.gamesPlayed)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <Card className="">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Statistics
          </CardTitle>
          <CardDescription>Your usage overview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Total Sessions</span>
              </div>
              <p className="text-2xl font-bold text-primary">{stats.totalSessions}</p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">This Week</span>
              </div>
              <p className="text-2xl font-bold text-accent">{stats.sessionsThisWeek}</p>
            </div>
          </div>

          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Total Duration</span>
              <Badge variant="secondary">{formatDuration(stats.totalDuration)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Intensity</span>
              <Badge variant="secondary">{Math.round(stats.averageIntensity * 100)}%</Badge>
            </div>
          </div>

          {topPatterns.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-3">Top Patterns</h4>
                <div className="space-y-2">
                  {topPatterns.map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{name}</span>
                      <Badge variant="outline">{count}x</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {topModes.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-3">Top Modes</h4>
                <div className="space-y-2">
                  {topModes.map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{name}</span>
                      <Badge variant="outline">{count}x</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {topGames.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-3">Top Games</h4>
                <div className="space-y-2">
                  {topGames.map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{name}</span>
                      <Badge variant="outline">{count}x</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Button variant="destructive" size="sm" onClick={resetStats} className="w-full">
            <Trash2 className="w-4 h-4 mr-2" />
            Reset Statistics
          </Button>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Settings
          </CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Safety Limits */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Safety & Defaults
              </h4>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Maximum Intensity</Label>
                <Badge variant="secondary">{Math.round(settings.maxIntensity * 100)}%</Badge>
              </div>
              <Slider
                value={[settings.maxIntensity]}
                onValueChange={([v]) => updateSettings({ maxIntensity: v })}
                min={0.3}
                max={1}
                step={0.05}
              />
              <p className="text-xs text-muted-foreground">
                Safety limit - intensity will never exceed this value
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Default Intensity</Label>
                <Badge variant="secondary">{Math.round(settings.defaultIntensity * 100)}%</Badge>
              </div>
              <Slider
                value={[settings.defaultIntensity]}
                onValueChange={([v]) => updateSettings({ defaultIntensity: v })}
                min={0.1}
                max={settings.maxIntensity}
                step={0.05}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Auto-Stop Timeout</Label>
                <Badge variant="secondary">{settings.autoStopTimeout}m</Badge>
              </div>
              <Slider
                value={[settings.autoStopTimeout]}
                onValueChange={([v]) => updateSettings({ autoStopTimeout: v })}
                min={5}
                max={60}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Automatically stop after this many minutes of inactivity
              </p>
            </div>
          </div>

          <Separator />

          {/* Accent Color */}
          <div className="space-y-3">
            <Label className="text-sm">Accent Color</Label>
            <div className="grid grid-cols-3 gap-2">
              {accentColors.map((color) => (
                <button
                  key={color.hue}
                  onClick={() => updateSettings({ accentColor: color.hue })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    settings.accentColor === color.hue
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div
                    className="w-full h-8 rounded mb-2"
                    style={{ backgroundColor: color.color }}
                  />
                  <p className="text-xs font-medium text-center">{color.name}</p>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Preferences */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Haptic Feedback</Label>
                <p className="text-xs text-muted-foreground">Vibrate on interactions (mobile)</p>
              </div>
              <Switch
                checked={settings.hapticFeedback}
                onCheckedChange={(checked) => updateSettings({ hapticFeedback: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Sound Effects</Label>
                <p className="text-xs text-muted-foreground">Play sounds on actions</p>
              </div>
              <Switch
                checked={settings.soundEffects}
                onCheckedChange={(checked) => updateSettings({ soundEffects: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Confirm Destructive Actions</Label>
                <p className="text-xs text-muted-foreground">Ask before deleting or resetting</p>
              </div>
              <Switch
                checked={settings.confirmDestructive}
                onCheckedChange={(checked) => updateSettings({ confirmDestructive: checked })}
              />
            </div>
          </div>

          <Separator />

          {/* Data Management */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Data Management</h4>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={handleImport} className="flex-1">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
            <Button variant="outline" onClick={resetSettings} className="w-full">
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
