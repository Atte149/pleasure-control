import { useState, useEffect, useCallback, useRef } from 'react';
import type { WaveformPattern } from '@/types';

export type AdvancedMode = 'surprise' | 'edge' | 'sync' | null;

interface AdvancedModeConfig {
  surprise?: {
    changeInterval: number; // seconds between pattern changes
    minIntensity: number;
    maxIntensity: number;
  };
  edge?: {
    buildDuration: number; // seconds to build up
    holdDuration: number; // seconds to hold at peak
    dropDuration: number; // seconds to drop down
    peakIntensity: number;
    baseIntensity: number;
  };
  sync?: {
    offset: number; // milliseconds offset between devices
  };
}

export function useAdvancedModes(patterns: WaveformPattern[]) {
  const [activeMode, setActiveMode] = useState<AdvancedMode>(null);
  const [config, setConfig] = useState<AdvancedModeConfig>({
    surprise: {
      changeInterval: 15,
      minIntensity: 0.3,
      maxIntensity: 0.9,
    },
    edge: {
      buildDuration: 30,
      holdDuration: 5,
      dropDuration: 10,
      peakIntensity: 0.95,
      baseIntensity: 0.2,
    },
    sync: {
      offset: 0,
    },
  });

  const [currentPattern, setCurrentPattern] = useState<WaveformPattern | null>(null);
  const [edgePhase, setEdgePhase] = useState<'build' | 'hold' | 'drop'>('build');
  const [edgeProgress, setEdgeProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Surprise Me Mode - Random pattern switching
  const startSurpriseMode = useCallback(() => {
    if (patterns.length === 0) return;

    setActiveMode('surprise');

    const selectRandomPattern = () => {
      const randomIndex = Math.floor(Math.random() * patterns.length);
      setCurrentPattern(patterns[randomIndex]);
    };

    selectRandomPattern();

    intervalRef.current = setInterval(() => {
      selectRandomPattern();
    }, (config.surprise?.changeInterval || 15) * 1000);
  }, [patterns, config.surprise]);

  // Edge Mode - Build, hold, drop cycle
  const startEdgeMode = useCallback(() => {
    setActiveMode('edge');
    setEdgePhase('build');
    setEdgeProgress(0);

    const edgeConfig = config.edge!;
    let elapsed = 0;
    let currentPhase: 'build' | 'hold' | 'drop' = 'build';

    intervalRef.current = setInterval(() => {
      elapsed += 0.1;

      if (currentPhase === 'build') {
        const progress = Math.min(elapsed / edgeConfig.buildDuration, 1);
        setEdgeProgress(progress);

        if (progress >= 1) {
          currentPhase = 'hold';
          elapsed = 0;
          setEdgePhase('hold');
        }
      } else if (currentPhase === 'hold') {
        if (elapsed >= edgeConfig.holdDuration) {
          currentPhase = 'drop';
          elapsed = 0;
          setEdgePhase('drop');
        }
      } else if (currentPhase === 'drop') {
        const progress = Math.min(elapsed / edgeConfig.dropDuration, 1);
        setEdgeProgress(1 - progress);

        if (progress >= 1) {
          currentPhase = 'build';
          elapsed = 0;
          setEdgePhase('build');
          setEdgeProgress(0);
        }
      }
    }, 100);
  }, [config.edge]);

  // Sync Mode - Synchronized playback
  const startSyncMode = useCallback(() => {
    setActiveMode('sync');
  }, []);

  const stopMode = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setActiveMode(null);
    setCurrentPattern(null);
    setEdgeProgress(0);
  }, []);

  const getEdgeIntensity = useCallback(() => {
    if (!config.edge) return 0;

    const { peakIntensity, baseIntensity } = config.edge;
    const range = peakIntensity - baseIntensity;

    return baseIntensity + (range * edgeProgress);
  }, [config.edge, edgeProgress]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
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
  };
}
