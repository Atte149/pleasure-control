import { useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Play,
  Square,
  Music,
  Volume2,
  AlertCircle,
  Clock,
  Activity,
} from 'lucide-react';

interface AudioPanelProps {
  file: File | null;
  waveformData: number[];
  duration: number;
  isPlaying: boolean;
  playbackTime: number;
  intensityScale: number;
  error: string | null;
  isLoading: boolean;
  onLoadFile: (file: File) => void;
  onPlay: () => void;
  onStop: () => void;
  onSetIntensityScale: (v: number) => void;
}

export function AudioPanel({
  file,
  waveformData,
  duration,
  isPlaying,
  playbackTime,
  intensityScale,
  error,
  isLoading,
  onLoadFile,
  onPlay,
  onStop,
  onSetIntensityScale,
}: AudioPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = 10;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = 'hsl(var(--muted))';
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 6);
    ctx.fill();

    // Draw waveform
    const barCount = waveformData.length;
    const barWidth = (w - 2 * padding) / barCount;
    const maxBarHeight = h - 2 * padding;

    for (let i = 0; i < barCount; i++) {
      const barHeight = waveformData[i] * maxBarHeight * intensityScale;
      const x = padding + i * barWidth;
      const y = (h - barHeight) / 2;

      // Color based on intensity
      const intensity = waveformData[i] * intensityScale;
      const hue = 240 - intensity * 60; // Blue to purple
      ctx.fillStyle = `hsl(${hue} 70% 55%)`;

      ctx.beginPath();
      ctx.roundRect(x + 0.5, y, barWidth - 1, barHeight, 2);
      ctx.fill();
    }

    // Progress indicator
    if (duration > 0) {
      const progress = playbackTime / duration;
      const progressX = padding + progress * (w - 2 * padding);
      ctx.strokeStyle = 'hsl(var(--destructive))';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(progressX, padding);
      ctx.lineTo(progressX, h - padding);
      ctx.stroke();
    }
  }, [waveformData, duration, playbackTime, intensityScale]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      onLoadFile(selected);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Audio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {!file ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 hover:bg-accent/50 transition-all text-center"
            >
              <Music className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium text-muted-foreground">Click to upload audio</p>
              <p className="text-xs text-muted-foreground mt-1">MP3, WAV, OGG supported</p>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Music className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(duration)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-4 text-muted-foreground">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm">Analyzing audio...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {waveformData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Waveform Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Waveform Display */}
            <canvas
              ref={canvasRef}
              className="w-full h-32 rounded-md"
            />

            {/* Controls */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Intensity Scale
                  </Label>
                  <Badge variant="secondary">{Math.round(intensityScale * 100)}%</Badge>
                </div>
                <Slider
                  value={[intensityScale]}
                  onValueChange={([v]) => onSetIntensityScale(v)}
                  min={0.1}
                  max={2}
                  step={0.05}
                />
              </div>

              {/* Playback */}
              <div className="flex items-center gap-3">
                {!isPlaying ? (
                  <Button
                    onClick={onPlay}
                    disabled={!file || isLoading}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </Button>
                ) : (
                  <Button
                    onClick={onStop}
                    variant="destructive"
                    className="flex-1"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                )}
              </div>

              {/* Time display */}
              {isPlaying && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{formatTime(playbackTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              )}

              {/* Live intensity */}
              {isPlaying && (
                <div className="space-y-1">
                  <Label className="text-xs">Current Intensity</Label>
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-75"
                      style={{
                        width: `${Math.min(100, (waveformData[Math.floor((playbackTime / duration) * (waveformData.length - 1))] || 0) * intensityScale * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
