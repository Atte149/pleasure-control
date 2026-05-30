import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { PatternPresets } from '@/components/PatternPresets';
import { createPatternFromPreset, type PatternPreset } from '@/lib/patternPresets';
import {
  Play,
  Pause,
  Square,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Waves,
  Clock,
} from 'lucide-react';
import type { WaveformPattern, WaveformPoint } from '@/types';

interface WaveformPanelProps {
  patterns: WaveformPattern[];
  activePattern: WaveformPattern | null;
  isPlaying: boolean;
  currentTime: number;
  isConnected: boolean;
  hasDevices: boolean;
  onStartPlayback: (pattern: WaveformPattern) => void;
  onStopPlayback: () => void;
  onPausePlayback: () => void;
  onCreatePattern: (name: string, duration: number, loop: boolean) => WaveformPattern;
  onUpdatePattern: (id: string, updates: Partial<WaveformPattern>) => void;
  onDeletePattern: (id: string) => void;
  onUpdatePoints: (id: string, points: WaveformPoint[]) => void;
}

export function WaveformPanel({
  patterns,
  activePattern,
  isPlaying,
  currentTime,
  isConnected,
  hasDevices,
  onStartPlayback,
  onStopPlayback,
  onPausePlayback,
  onCreatePattern,
  onUpdatePattern,
  onDeletePattern,
  onUpdatePoints,
}: WaveformPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDuration, setEditDuration] = useState(3);
  const [editLoop, setEditLoop] = useState(true);
  const [newName, setNewName] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const editCanvasRef = useRef<HTMLCanvasElement>(null);
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);

  // Draw waveform preview
  const drawWaveform = useCallback((canvas: HTMLCanvasElement, pattern: WaveformPattern, progress?: number) => {
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

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = 'hsl(var(--muted))';
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 6);
    ctx.fill();

    // Grid lines
    ctx.strokeStyle = 'hsl(var(--muted-foreground) / 0.2)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      const y = padding + (h - 2 * padding) * (i / 5);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(w - padding, y);
      ctx.stroke();
    }

    // Draw waveform
    if (pattern.points.length > 0) {
      ctx.strokeStyle = 'hsl(var(--primary))';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const points = pattern.points;
      for (let i = 0; i < points.length; i++) {
        const x = padding + points[i].time * (w - 2 * padding);
        const y = padding + (1 - points[i].intensity) * (h - 2 * padding);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Fill area
      ctx.fillStyle = 'hsl(var(--primary) / 0.15)';
      ctx.lineTo(padding + points[points.length - 1].time * (w - 2 * padding), h - padding);
      ctx.lineTo(padding, h - padding);
      ctx.closePath();
      ctx.fill();

      // Progress indicator
      if (progress !== undefined) {
        const progressX = padding + (progress / pattern.duration) * (w - 2 * padding);
        ctx.strokeStyle = 'hsl(var(--destructive))';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(progressX, padding);
        ctx.lineTo(progressX, h - padding);
        ctx.stroke();
      }

      // Draw points
      ctx.fillStyle = 'hsl(var(--primary))';
      for (const point of points) {
        const x = padding + point.time * (w - 2 * padding);
        const y = padding + (1 - point.intensity) * (h - 2 * padding);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, []);

  // Redraw on canvas resize or pattern change
  useEffect(() => {
    patterns.forEach(pattern => {
      const canvas = document.getElementById(`waveform-canvas-${pattern.id}`) as HTMLCanvasElement;
      if (canvas) {
        const isActive = activePattern?.id === pattern.id;
        drawWaveform(
          canvas,
          pattern,
          isActive && isPlaying ? currentTime % pattern.duration : undefined
        );
      }
    });
  }, [patterns, activePattern, isPlaying, currentTime, drawWaveform]);

  // Draw editing canvas
  useEffect(() => {
    if (!editingId || !editCanvasRef.current) return;
    const pattern = patterns.find(p => p.id === editingId);
    if (!pattern) return;

    const canvas = editCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = 20;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = 'hsl(var(--card))';
    ctx.strokeStyle = 'hsl(var(--border))';
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 8);
    ctx.fill();
    ctx.stroke();

    // Grid
    ctx.strokeStyle = 'hsl(var(--muted-foreground) / 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (h - 2 * padding) * (i / 5);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(w - padding, y);
      ctx.stroke();
    }
    for (let i = 0; i <= 10; i++) {
      const x = padding + (w - 2 * padding) * (i / 10);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, h - padding);
      ctx.stroke();
    }

    // Draw curve
    const points = pattern.points;
    if (points.length > 0) {
      ctx.strokeStyle = 'hsl(var(--primary))';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const x = padding + points[i].time * (w - 2 * padding);
        const y = padding + (1 - points[i].intensity) * (h - 2 * padding);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Fill
      ctx.fillStyle = 'hsl(var(--primary) / 0.1)';
      ctx.lineTo(padding + points[points.length - 1].time * (w - 2 * padding), h - padding);
      ctx.lineTo(padding, h - padding);
      ctx.closePath();
      ctx.fill();

      // Draw draggable points
      points.forEach((point, i) => {
        const x = padding + point.time * (w - 2 * padding);
        const y = padding + (1 - point.intensity) * (h - 2 * padding);

        ctx.fillStyle = draggingPoint === i ? 'hsl(var(--destructive))' : 'hsl(var(--primary))';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'hsl(var(--background))';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
  }, [editingId, patterns, draggingPoint, drawWaveform]);

  // Handle canvas interaction for editing
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editingId) return;
    const canvas = editCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const padding = 20;
    const w = rect.width - 2 * padding;
    const h = rect.height - 2 * padding;

    const pattern = patterns.find(p => p.id === editingId);
    if (!pattern) return;

    // Check if clicking near a point
    let nearestIdx = -1;
    let nearestDist = Infinity;
    pattern.points.forEach((point, i) => {
      const px = padding + point.time * w;
      const py = padding + (1 - point.intensity) * h;
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      if (dist < 15 && dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    });

    if (nearestIdx >= 0) {
      setDraggingPoint(nearestIdx);
    }
  }, [editingId, patterns]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingPoint === null || !editingId) return;

    const canvas = editCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const padding = 20;
    const w = rect.width - 2 * padding;
    const h = rect.height - 2 * padding;

    const newTime = Math.max(0, Math.min(1, (x - padding) / w));
    const newIntensity = Math.max(0, Math.min(1, 1 - (y - padding) / h));

    const pattern = patterns.find(p => p.id === editingId);
    if (!pattern) return;

    const newPoints = [...pattern.points];
    newPoints[draggingPoint] = {
      ...newPoints[draggingPoint],
      time: newTime,
      intensity: newIntensity,
    };

    // Sort by time
    newPoints.sort((a, b) => a.time - b.time);

    onUpdatePoints(editingId, newPoints);
  }, [draggingPoint, editingId, patterns, onUpdatePoints]);

  const handleCanvasMouseUp = useCallback(() => {
    setDraggingPoint(null);
  }, []);

  const startEdit = (pattern: WaveformPattern) => {
    setEditingId(pattern.id);
    setEditName(pattern.name);
    setEditDuration(pattern.duration);
    setEditLoop(pattern.loop);
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdatePattern(editingId, {
        name: editName,
        duration: editDuration,
        loop: editLoop,
      });
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleCreate = () => {
    if (newName.trim()) {
      onCreatePattern(newName.trim(), 3, true);
      setNewName('');
      setShowNewForm(false);
    }
  };

  const addPoint = () => {
    if (!editingId) return;
    const pattern = patterns.find(p => p.id === editingId);
    if (!pattern) return;

    const newPoint: WaveformPoint = {
      time: 0.5,
      intensity: 0.5,
    };
    onUpdatePoints(editingId, [...pattern.points, newPoint]);
  };

  const removePoint = (idx: number) => {
    if (!editingId) return;
    const pattern = patterns.find(p => p.id === editingId);
    if (!pattern || pattern.points.length <= 2) return;

    const newPoints = pattern.points.filter((_, i) => i !== idx);
    onUpdatePoints(editingId, newPoints);
    setDraggingPoint(null);
  };

  const handleSelectPreset = useCallback((preset: PatternPreset) => {
    const pattern = createPatternFromPreset(preset);
    onCreatePattern(pattern.name, pattern.duration, pattern.loop);
    // Update the newly created pattern with preset points
    setTimeout(() => {
      const newPattern = patterns.find(p => p.name === pattern.name);
      if (newPattern) {
        onUpdatePoints(newPattern.id, pattern.points);
      }
    }, 100);
  }, [onCreatePattern, onUpdatePoints, patterns]);

  const isDisabled = !isConnected || !hasDevices;

  return (
    <div className="space-y-4">
      {/* Pattern Presets Library */}
      <PatternPresets onSelectPreset={handleSelectPreset} />

      {/* Create New */}
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Create Custom Pattern
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showNewForm ? (
            <Button onClick={() => setShowNewForm(true)} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              New Waveform Pattern
            </Button>
          ) : (
            <div className="space-y-3">
              <Input
                placeholder="Pattern name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreate} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Create
                </Button>
                <Button variant="outline" onClick={() => setShowNewForm(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pattern List */}
      <div className="space-y-3">
        {patterns.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Waves className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No patterns yet</p>
              <p className="text-sm mt-1">Select a preset above or create a custom pattern</p>
            </CardContent>
          </Card>
        )}
        {patterns.map((pattern, index) => (
          <Card
            key={pattern.id}
            className={`transition-all duration-300 hover:shadow-lg animate-in fade-in slide-in-from-bottom-2 ${
              activePattern?.id === pattern.id ? 'border-primary ring-2 ring-primary/20' : ''
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Waves className="w-4 h-4" />
                  {pattern.name}
                </CardTitle>
                <div className="flex items-center gap-1">
                  {pattern.loop && (
                    <Badge variant="secondary" className="text-xs">LOOP</Badge>
                  )}
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {pattern.duration}s
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Waveform Preview */}
              <canvas
                id={`waveform-canvas-${pattern.id}`}
                className="w-full h-24 rounded-md"
              />

              {editingId === pattern.id ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (seconds)</Label>
                    <Input
                      type="number"
                      min={0.5}
                      max={60}
                      step={0.5}
                      value={editDuration}
                      onChange={(e) => setEditDuration(parseFloat(e.target.value) || 3)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editLoop}
                      onCheckedChange={setEditLoop}
                    />
                    <Label>Loop</Label>
                  </div>

                  {/* Editor Canvas */}
                  <div className="space-y-2">
                    <Label>Edit Points (drag to adjust)</Label>
                    <canvas
                      ref={editCanvasRef}
                      className="w-full h-48 rounded-md cursor-crosshair touch-none"
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp}
                    />
                    <div className="flex gap-2">
                      <Button onClick={addPoint} variant="outline" size="sm">
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Point
                      </Button>
                      <Button
                        onClick={() => pattern.points.length > 2 && removePoint(draggingPoint ?? pattern.points.length - 1)}
                        variant="outline"
                        size="sm"
                        disabled={pattern.points.length <= 2}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={saveEdit} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => onStartPlayback(pattern)}
                    disabled={isDisabled || (isPlaying && activePattern?.id === pattern.id)}
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    {isPlaying && activePattern?.id === pattern.id ? 'Playing...' : 'Play'}
                  </Button>
                  {isPlaying && activePattern?.id === pattern.id && (
                    <>
                      <Button onClick={onPausePlayback} variant="outline" size="sm">
                        <Pause className="w-4 h-4" />
                      </Button>
                      <Button onClick={onStopPlayback} variant="outline" size="sm">
                        <Square className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => startEdit(pattern)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => onDeletePattern(pattern.id)}
                    variant="outline"
                    size="sm"
                    className="hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
