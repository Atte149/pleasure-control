import { useState, useEffect, useCallback } from 'react';

export interface UserSettings {
  maxIntensity: number; // Safety limit 0-1
  defaultIntensity: number; // Default starting intensity
  hapticFeedback: boolean; // Vibrate on interactions (mobile)
  soundEffects: boolean; // Play sounds on actions
  accentColor: string; // Theme accent color
  autoStopTimeout: number; // Auto-stop after N minutes of inactivity
  confirmDestructive: boolean; // Confirm before destructive actions
}

export interface SessionStats {
  totalSessions: number;
  totalDuration: number; // seconds
  averageIntensity: number;
  favoritePattern: string | null;
  lastUsed: number; // timestamp
  sessionsThisWeek: number;
  patternsUsed: Record<string, number>; // pattern name -> count
  modesUsed: Record<string, number>; // mode name -> count
  gamesPlayed: Record<string, number>; // game name -> count
}

const DEFAULT_SETTINGS: UserSettings = {
  maxIntensity: 1.0,
  defaultIntensity: 0.5,
  hapticFeedback: true,
  soundEffects: false,
  accentColor: '280', // Purple hue
  autoStopTimeout: 30,
  confirmDestructive: true,
};

const DEFAULT_STATS: SessionStats = {
  totalSessions: 0,
  totalDuration: 0,
  averageIntensity: 0,
  favoritePattern: null,
  lastUsed: 0,
  sessionsThisWeek: 0,
  patternsUsed: {},
  modesUsed: {},
  gamesPlayed: {},
};

const SETTINGS_KEY = 'pleasure-control-settings';
const STATS_KEY = 'pleasure-control-stats';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  });

  const [stats, setStats] = useState<SessionStats>(() => {
    const stored = localStorage.getItem(STATS_KEY);
    return stored ? { ...DEFAULT_STATS, ...JSON.parse(stored) } : DEFAULT_STATS;
  });

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Save stats to localStorage
  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  // Track session start
  const startSession = useCallback(() => {
    setStats(prev => ({
      ...prev,
      totalSessions: prev.totalSessions + 1,
      sessionsThisWeek: prev.sessionsThisWeek + 1,
      lastUsed: Date.now(),
    }));
  }, []);

  // Track session duration
  const addSessionDuration = useCallback((seconds: number) => {
    setStats(prev => ({
      ...prev,
      totalDuration: prev.totalDuration + seconds,
    }));
  }, []);

  // Track pattern usage
  const trackPatternUsage = useCallback((patternName: string) => {
    setStats(prev => ({
      ...prev,
      patternsUsed: {
        ...prev.patternsUsed,
        [patternName]: (prev.patternsUsed[patternName] || 0) + 1,
      },
    }));
  }, []);

  // Track mode usage
  const trackModeUsage = useCallback((modeName: string) => {
    setStats(prev => ({
      ...prev,
      modesUsed: {
        ...prev.modesUsed,
        [modeName]: (prev.modesUsed[modeName] || 0) + 1,
      },
    }));
  }, []);

  // Track game usage
  const trackGameUsage = useCallback((gameName: string) => {
    setStats(prev => ({
      ...prev,
      gamesPlayed: {
        ...prev.gamesPlayed,
        [gameName]: (prev.gamesPlayed[gameName] || 0) + 1,
      },
    }));
  }, []);

  // Update average intensity
  const updateAverageIntensity = useCallback((intensity: number) => {
    setStats(prev => {
      const total = prev.averageIntensity * prev.totalSessions;
      const newAverage = (total + intensity) / (prev.totalSessions + 1);
      return {
        ...prev,
        averageIntensity: newAverage,
      };
    });
  }, []);

  // Get favorite pattern
  const getFavoritePattern = useCallback(() => {
    const patterns = Object.entries(stats.patternsUsed);
    if (patterns.length === 0) return null;

    const [name] = patterns.reduce((max, curr) =>
      curr[1] > max[1] ? curr : max
    );

    return name;
  }, [stats.patternsUsed]);

  // Reset stats
  const resetStats = useCallback(() => {
    setStats(DEFAULT_STATS);
  }, []);

  // Reset weekly stats (call this weekly)
  const resetWeeklyStats = useCallback(() => {
    setStats(prev => ({
      ...prev,
      sessionsThisWeek: 0,
    }));
  }, []);

  // Export data
  const exportData = useCallback(() => {
    return {
      settings,
      stats,
      exportedAt: new Date().toISOString(),
    };
  }, [settings, stats]);

  // Import data
  const importData = useCallback((data: { settings?: UserSettings; stats?: SessionStats }) => {
    if (data.settings) {
      setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
    }
    if (data.stats) {
      setStats({ ...DEFAULT_STATS, ...data.stats });
    }
  }, []);

  return {
    settings,
    stats,
    updateSettings,
    resetSettings,
    startSession,
    addSessionDuration,
    trackPatternUsage,
    trackModeUsage,
    trackGameUsage,
    updateAverageIntensity,
    getFavoritePattern,
    resetStats,
    resetWeeklyStats,
    exportData,
    importData,
  };
}
