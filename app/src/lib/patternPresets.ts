import type { WaveformPattern } from '@/types';

export interface PatternPreset {
  id: string;
  name: string;
  description: string;
  category: 'gentle' | 'intense' | 'rhythmic' | 'random';
  icon: string;
  pattern: Omit<WaveformPattern, 'id' | 'name'>;
}

export const PATTERN_PRESETS: PatternPreset[] = [
  {
    id: 'wave',
    name: 'Wave',
    description: 'Smooth wave pattern that builds and releases',
    category: 'gentle',
    icon: '🌊',
    pattern: {
      points: [
        { time: 0, intensity: 0 },
        { time: 2, intensity: 0.3 },
        { time: 4, intensity: 0.6 },
        { time: 6, intensity: 0.9 },
        { time: 8, intensity: 0.6 },
        { time: 10, intensity: 0.3 },
        { time: 12, intensity: 0 },
      ],
      duration: 12,
      loop: true,
    },
  },
  {
    id: 'pulse',
    name: 'Pulse',
    description: 'Quick pulses with pauses',
    category: 'rhythmic',
    icon: '💓',
    pattern: {
      points: [
        { time: 0, intensity: 0 },
        { time: 0.3, intensity: 0.8 },
        { time: 0.6, intensity: 0 },
        { time: 1.5, intensity: 0 },
        { time: 1.8, intensity: 0.8 },
        { time: 2.1, intensity: 0 },
        { time: 3, intensity: 0 },
      ],
      duration: 3,
      loop: true,
    },
  },
  {
    id: 'earthquake',
    name: 'Earthquake',
    description: 'Intense random vibrations',
    category: 'intense',
    icon: '⚡',
    pattern: {
      points: [
        { time: 0, intensity: 0.4 },
        { time: 0.2, intensity: 0.9 },
        { time: 0.4, intensity: 0.5 },
        { time: 0.6, intensity: 1.0 },
        { time: 0.8, intensity: 0.6 },
        { time: 1.0, intensity: 0.95 },
        { time: 1.2, intensity: 0.7 },
        { time: 1.4, intensity: 0.85 },
        { time: 1.6, intensity: 0.5 },
        { time: 2, intensity: 0.4 },
      ],
      duration: 2,
      loop: true,
    },
  },
  {
    id: 'fireworks',
    name: 'Fireworks',
    description: 'Explosive bursts with calm periods',
    category: 'intense',
    icon: '🎆',
    pattern: {
      points: [
        { time: 0, intensity: 0 },
        { time: 0.5, intensity: 0.1 },
        { time: 1, intensity: 0 },
        { time: 1.2, intensity: 1.0 },
        { time: 1.4, intensity: 0.3 },
        { time: 2, intensity: 0 },
        { time: 3, intensity: 0 },
        { time: 3.2, intensity: 0.9 },
        { time: 3.4, intensity: 0.2 },
        { time: 4, intensity: 0 },
      ],
      duration: 5,
      loop: true,
    },
  },
  {
    id: 'escalate',
    name: 'Escalate',
    description: 'Gradually builds to maximum intensity',
    category: 'intense',
    icon: '📈',
    pattern: {
      points: [
        { time: 0, intensity: 0.1 },
        { time: 3, intensity: 0.3 },
        { time: 6, intensity: 0.5 },
        { time: 9, intensity: 0.7 },
        { time: 12, intensity: 0.9 },
        { time: 15, intensity: 1.0 },
      ],
      duration: 15,
      loop: false,
    },
  },
  {
    id: 'heartbeat',
    name: 'Heartbeat',
    description: 'Mimics a heartbeat rhythm',
    category: 'rhythmic',
    icon: '❤️',
    pattern: {
      points: [
        { time: 0, intensity: 0 },
        { time: 0.1, intensity: 0.6 },
        { time: 0.2, intensity: 0.1 },
        { time: 0.3, intensity: 0.8 },
        { time: 0.5, intensity: 0 },
        { time: 1.5, intensity: 0 },
      ],
      duration: 1.5,
      loop: true,
    },
  },
  {
    id: 'random',
    name: 'Random',
    description: 'Unpredictable intensity changes',
    category: 'random',
    icon: '🎲',
    pattern: {
      points: [
        { time: 0, intensity: 0.3 },
        { time: 0.5, intensity: 0.7 },
        { time: 1, intensity: 0.2 },
        { time: 1.5, intensity: 0.9 },
        { time: 2, intensity: 0.4 },
        { time: 2.5, intensity: 0.6 },
        { time: 3, intensity: 0.1 },
        { time: 3.5, intensity: 0.8 },
        { time: 4, intensity: 0.5 },
      ],
      duration: 4,
      loop: true,
    },
  },
  {
    id: 'gentle-wave',
    name: 'Gentle Wave',
    description: 'Soft, relaxing wave motion',
    category: 'gentle',
    icon: '🌸',
    pattern: {
      points: [
        { time: 0, intensity: 0.2 },
        { time: 3, intensity: 0.4 },
        { time: 6, intensity: 0.5 },
        { time: 9, intensity: 0.4 },
        { time: 12, intensity: 0.2 },
      ],
      duration: 12,
      loop: true,
    },
  },
  {
    id: 'stairway',
    name: 'Stairway',
    description: 'Step-by-step intensity increase',
    category: 'rhythmic',
    icon: '🪜',
    pattern: {
      points: [
        { time: 0, intensity: 0.2 },
        { time: 2, intensity: 0.2 },
        { time: 2.1, intensity: 0.4 },
        { time: 4, intensity: 0.4 },
        { time: 4.1, intensity: 0.6 },
        { time: 6, intensity: 0.6 },
        { time: 6.1, intensity: 0.8 },
        { time: 8, intensity: 0.8 },
        { time: 8.1, intensity: 0.2 },
      ],
      duration: 10,
      loop: true,
    },
  },
  {
    id: 'tsunami',
    name: 'Tsunami',
    description: 'Massive build-up to overwhelming intensity',
    category: 'intense',
    icon: '🌊',
    pattern: {
      points: [
        { time: 0, intensity: 0.1 },
        { time: 5, intensity: 0.2 },
        { time: 10, intensity: 0.4 },
        { time: 12, intensity: 0.7 },
        { time: 13, intensity: 1.0 },
        { time: 14, intensity: 0.9 },
        { time: 15, intensity: 0.3 },
        { time: 16, intensity: 0 },
      ],
      duration: 16,
      loop: false,
    },
  },
];

export function getPresetsByCategory(category: PatternPreset['category']): PatternPreset[] {
  return PATTERN_PRESETS.filter(p => p.category === category);
}

export function getPresetById(id: string): PatternPreset | undefined {
  return PATTERN_PRESETS.find(p => p.id === id);
}

export function createPatternFromPreset(preset: PatternPreset, customName?: string): WaveformPattern {
  return {
    id: `preset-${preset.id}-${Date.now()}`,
    name: customName || preset.name,
    ...preset.pattern,
  };
}
