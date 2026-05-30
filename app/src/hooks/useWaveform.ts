import { useState, useCallback, useRef, useEffect } from 'react';
import type { WaveformPattern, WaveformPoint } from '@/types';

const DEFAULT_PATTERNS: WaveformPattern[] = [
  {
    id: 'sine',
    name: 'Sine Wave',
    duration: 3,
    loop: true,
    points: Array.from({ length: 50 }, (_, i) => ({
      time: i / 49,
      intensity: 0.5 + 0.5 * Math.sin((i / 49) * Math.PI * 2),
    })),
  },
  {
    id: 'ramp-up',
    name: 'Ramp Up',
    duration: 4,
    loop: false,
    points: Array.from({ length: 50 }, (_, i) => ({
      time: i / 49,
      intensity: i / 49,
    })),
  },
  {
    id: 'ramp-down',
    name: 'Ramp Down',
    duration: 4,
    loop: false,
    points: Array.from({ length: 50 }, (_, i) => ({
      time: i / 49,
      intensity: 1 - i / 49,
    })),
  },
  {
    id: 'pulse',
    name: 'Pulse',
    duration: 2,
    loop: true,
    points: Array.from({ length: 50 }, (_, i) => {
      const t = i / 49;
      const pulse = t < 0.3 ? t / 0.3 : t < 0.5 ? 1 : t < 0.8 ? (0.8 - t) / 0.3 : 0;
      return { time: t, intensity: pulse };
    }),
  },
  {
    id: 'wave',
    name: 'Quick Wave',
    duration: 1.5,
    loop: true,
    points: Array.from({ length: 50 }, (_, i) => ({
      time: i / 49,
      intensity: Math.abs(Math.sin((i / 49) * Math.PI * 3)),
    })),
  },
];

export function useWaveform() {
  const [patterns, setPatterns] = useState<WaveformPattern[]>(DEFAULT_PATTERNS);
  const [activePattern, setActivePattern] = useState<WaveformPattern | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [editingPattern, setEditingPattern] = useState<WaveformPattern | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const getIntensityAtTime = useCallback((pattern: WaveformPattern, time: number): number => {
    const effectiveTime = pattern.loop ? time % pattern.duration : Math.min(time, pattern.duration);
    const normalizedTime = effectiveTime / pattern.duration;

    // Find surrounding points
    const points = pattern.points;
    if (points.length === 0) return 0;
    if (points.length === 1) return points[0].intensity;

    // Find the two points to interpolate between
    for (let i = 0; i < points.length - 1; i++) {
      if (normalizedTime >= points[i].time && normalizedTime <= points[i + 1].time) {
        const t = (normalizedTime - points[i].time) / (points[i + 1].time - points[i].time);
        return points[i].intensity + t * (points[i + 1].intensity - points[i].intensity);
      }
    }

    return points[points.length - 1].intensity;
  }, []);

  const startPlayback = useCallback((pattern: WaveformPattern) => {
    setActivePattern(pattern);
    setCurrentTime(0);
    startTimeRef.current = performance.now();
    setIsPlaying(true);
  }, []);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const pausePlayback = useCallback(() => {
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const createPattern = useCallback((name: string, duration: number = 3, loop: boolean = true) => {
    const newPattern: WaveformPattern = {
      id: `custom-${Date.now()}`,
      name,
      duration,
      loop,
      points: [
        { time: 0, intensity: 0 },
        { time: 0.25, intensity: 0.5 },
        { time: 0.5, intensity: 1 },
        { time: 0.75, intensity: 0.5 },
        { time: 1, intensity: 0 },
      ],
    };
    setPatterns(prev => [...prev, newPattern]);
    return newPattern;
  }, []);

  const updatePattern = useCallback((id: string, updates: Partial<WaveformPattern>) => {
    setPatterns(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const deletePattern = useCallback((id: string) => {
    setPatterns(prev => prev.filter(p => p.id !== id));
    if (activePattern?.id === id) {
      stopPlayback();
      setActivePattern(null);
    }
  }, [activePattern, stopPlayback]);

  const updatePatternPoints = useCallback((id: string, points: WaveformPoint[]) => {
    setPatterns(prev => prev.map(p => (p.id === id ? { ...p, points } : p)));
  }, []);

  // Animation loop — only depends on isPlaying and activePattern
  // currentTime is updated via setCurrentTime but NOT in deps to avoid restart loops
  useEffect(() => {
    if (!isPlaying || !activePattern) return;

    const animate = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      setCurrentTime(elapsed);

      if (!activePattern.loop && elapsed >= activePattern.duration) {
        setIsPlaying(false);
        setCurrentTime(activePattern.duration);
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, activePattern]);

  return {
    patterns,
    activePattern,
    isPlaying,
    currentTime,
    editingPattern,
    setEditingPattern,
    getIntensityAtTime,
    startPlayback,
    stopPlayback,
    pausePlayback,
    createPattern,
    updatePattern,
    deletePattern,
    updatePatternPoints,
    setActivePattern,
  };
}
