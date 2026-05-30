import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Shuffle, TrendingUp, Users, AlertCircle, Play, Square } from 'lucide-react';
import { useAdvancedModes } from '@/hooks/useAdvancedModes';
import type { WaveformPattern } from '@/types';

interface AdvancedModesProps {
  patterns: WaveformPattern[];
  isConnected: boolean;
  hasDevices: boolean;
  onIntensityChange: (intensity: number) => void;
}

export function AdvancedModes({
  patterns,
  isConnected,
  hasDevices,
  onIntensityChange,
}: AdvancedModesProps) {
  const {
    activeMode,
    config,
    setConfig,
    currentPattern,
    edgePhase,
    edgeProgress,
    startSurpriseMode,
    startEdgeMode,
    startSyncMode,
    stopMode,
    getEdgeIntensity,
  } = useAdvancedModes(patterns);

  const isDisabled = !isConnected || !hasDevices;

  // Update intensity when edge mode is active
  if (activeMode === 'edge') {
    onIntensityChange(getEdgeIntensity());
  }

  return (
    <div className="space-y-4">
      {/* Surprise Me Mode */}
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Shuffle className="w-5 h-5 text-primary" />
                Surprise Me
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Random pattern switching
              </CardDescription>
            </div>
            {activeMode === 'surprise' && (
              <Badge className="bg-gradient-to-r from-primary to-accent">Active</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Change Interval: {config.surprise?.changeInterval}s</Label>
            <Slider
              value={[config.surprise?.changeInterval || 15]}
              onValueChange={([v]) => setConfig({
                ...config,
                surprise: { ...config.surprise!, changeInterval: v }
              })}
              min={5}
              max={60}
              step={5}
              disabled={activeMode === 'surprise'}
            />
          </div>

          {activeMode === 'surprise' && currentPattern && (
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-medium">Current: {currentPattern.name}</p>
            </div>
          )}

          <Button
            onClick={activeMode === 'surprise' ? stopMode : startSurpriseMode}
            disabled={isDisabled || (activeMode !== null && activeMode !== 'surprise') || patterns.length === 0}
            className="w-full"
            variant={activeMode === 'surprise' ? 'destructive' : 'default'}
          >
            {activeMode === 'surprise' ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Surprise Mode
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Edge Mode */}
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Edge Mode
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Build, hold, and release cycle
              </CardDescription>
            </div>
            {activeMode === 'edge' && (
              <Badge className="bg-gradient-to-r from-accent to-primary">Active</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Build Duration: {config.edge?.buildDuration}s</Label>
            <Slider
              value={[config.edge?.buildDuration || 30]}
              onValueChange={([v]) => setConfig({
                ...config,
                edge: { ...config.edge!, buildDuration: v }
              })}
              min={10}
              max={60}
              step={5}
              disabled={activeMode === 'edge'}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Hold Duration: {config.edge?.holdDuration}s</Label>
            <Slider
              value={[config.edge?.holdDuration || 5]}
              onValueChange={([v]) => setConfig({
                ...config,
                edge: { ...config.edge!, holdDuration: v }
              })}
              min={2}
              max={20}
              step={1}
              disabled={activeMode === 'edge'}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Peak Intensity: {Math.round((config.edge?.peakIntensity || 0.95) * 100)}%</Label>
            <Slider
              value={[config.edge?.peakIntensity || 0.95]}
              onValueChange={([v]) => setConfig({
                ...config,
                edge: { ...config.edge!, peakIntensity: v }
              })}
              min={0.5}
              max={1}
              step={0.05}
              disabled={activeMode === 'edge'}
            />
          </div>

          {activeMode === 'edge' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Phase: {edgePhase.toUpperCase()}</span>
                <span className="text-muted-foreground">{Math.round(edgeProgress * 100)}%</span>
              </div>
              <Progress value={edgeProgress * 100} className="h-2" />
              <div className="text-xs text-center text-muted-foreground">
                Intensity: {Math.round(getEdgeIntensity() * 100)}%
              </div>
            </div>
          )}

          <Button
            onClick={activeMode === 'edge' ? stopMode : startEdgeMode}
            disabled={isDisabled || (activeMode !== null && activeMode !== 'edge')}
            className="w-full"
            variant={activeMode === 'edge' ? 'destructive' : 'default'}
          >
            {activeMode === 'edge' ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Edge Mode
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Sync Mode */}
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary-foreground" />
                Sync Mode
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Synchronized device control
              </CardDescription>
            </div>
            {activeMode === 'sync' && (
              <Badge variant="secondary">Active</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-muted rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Sync mode ensures all devices respond simultaneously to patterns and manual controls.
            </p>
          </div>

          <Button
            onClick={activeMode === 'sync' ? stopMode : startSyncMode}
            disabled={isDisabled || (activeMode !== null && activeMode !== 'sync')}
            className="w-full"
            variant={activeMode === 'sync' ? 'destructive' : 'default'}
          >
            {activeMode === 'sync' ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Enable Sync Mode
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
