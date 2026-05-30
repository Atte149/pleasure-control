import { useState, useCallback } from 'react';

export type GameType = 'roulette' | 'dice' | 'cards' | 'timer' | 'progressive' | null;

interface GameState {
  isPlaying: boolean;
  currentValue: number;
  result: string;
  history: GameResult[];
}

interface GameResult {
  timestamp: number;
  game: GameType;
  value: number;
  intensity: number;
  duration: number;
}

export function useGameMode() {
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    currentValue: 0,
    result: '',
    history: [],
  });

  // Roulette - Random intensity selection
  const spinRoulette = useCallback(() => {
    const intensity = Math.random();
    const duration = 5 + Math.random() * 10; // 5-15 seconds

    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      currentValue: intensity,
      result: `${Math.round(intensity * 100)}% for ${Math.round(duration)}s`,
      history: [
        ...prev.history,
        {
          timestamp: Date.now(),
          game: 'roulette',
          value: intensity,
          intensity,
          duration,
        },
      ],
    }));

    return { intensity, duration };
  }, []);

  // Dice - Roll 1-6, maps to intensity
  const rollDice = useCallback(() => {
    const roll = Math.floor(Math.random() * 6) + 1;
    const intensity = roll / 6;
    const duration = roll * 2; // 2-12 seconds

    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      currentValue: roll,
      result: `Rolled ${roll} - ${Math.round(intensity * 100)}%`,
      history: [
        ...prev.history,
        {
          timestamp: Date.now(),
          game: 'dice',
          value: roll,
          intensity,
          duration,
        },
      ],
    }));

    return { intensity, duration, roll };
  }, []);

  // Cards - Draw card, suit determines pattern type, value determines intensity
  const drawCard = useCallback(() => {
    const suits = ['♠️', '♥️', '♦️', '♣️'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    const suit = suits[Math.floor(Math.random() * suits.length)];
    const value = values[Math.floor(Math.random() * values.length)];

    // Map card value to intensity
    let intensity = 0.5;
    if (value === 'A') intensity = 1.0;
    else if (['K', 'Q', 'J'].includes(value)) intensity = 0.8;
    else if (['10', '9', '8'].includes(value)) intensity = 0.6;
    else intensity = 0.4;

    const duration = 8 + Math.random() * 7; // 8-15 seconds

    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      currentValue: intensity,
      result: `${value}${suit} - ${Math.round(intensity * 100)}%`,
      history: [
        ...prev.history,
        {
          timestamp: Date.now(),
          game: 'cards',
          value: intensity,
          intensity,
          duration,
        },
      ],
    }));

    return { intensity, duration, card: `${value}${suit}`, suit };
  }, []);

  // Timer Challenge - Hold intensity for duration
  const startTimerChallenge = useCallback((targetIntensity: number, duration: number) => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      currentValue: targetIntensity,
      result: `Hold ${Math.round(targetIntensity * 100)}% for ${duration}s`,
      history: [
        ...prev.history,
        {
          timestamp: Date.now(),
          game: 'timer',
          value: targetIntensity,
          intensity: targetIntensity,
          duration,
        },
      ],
    }));

    return { intensity: targetIntensity, duration };
  }, []);

  // Progressive Mode - Increase intensity every N seconds
  const startProgressive = useCallback((startIntensity: number, increment: number, interval: number) => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      currentValue: startIntensity,
      result: `Starting at ${Math.round(startIntensity * 100)}%, +${Math.round(increment * 100)}% every ${interval}s`,
    }));

    return { startIntensity, increment, interval };
  }, []);

  const stopGame = useCallback(() => {
    setActiveGame(null);
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      currentValue: 0,
      result: '',
    }));
  }, []);

  const clearHistory = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      history: [],
    }));
  }, []);

  return {
    activeGame,
    setActiveGame,
    gameState,
    spinRoulette,
    rollDice,
    drawCard,
    startTimerChallenge,
    startProgressive,
    stopGame,
    clearHistory,
  };
}
