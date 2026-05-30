import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dices,
  Sparkles,
  Timer,
  TrendingUp,
  Play,
  Square,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { useGameMode } from '@/hooks/useGameMode';

interface GameModeProps {
  isConnected: boolean;
  hasDevices: boolean;
  onIntensityChange: (intensity: number) => void;
}

export function GameMode({ isConnected, hasDevices, onIntensityChange }: GameModeProps) {
  const {
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
  } = useGameMode();

  const [timerDuration, setTimerDuration] = useState(30);
  const [timerIntensity, setTimerIntensity] = useState(0.7);
  const [progressiveStart, setProgressiveStart] = useState(0.2);
  const [progressiveIncrement, setProgressiveIncrement] = useState(0.1);
  const [progressiveInterval, setProgressiveInterval] = useState(10);
  const [progressiveIntensity, setProgressiveIntensity] = useState(0.2);

  const isDisabled = !isConnected || !hasDevices;

  // Handle roulette
  const handleRoulette = () => {
    setActiveGame('roulette');
    const { intensity, duration } = spinRoulette();
    onIntensityChange(intensity);

    setTimeout(() => {
      onIntensityChange(0);
      stopGame();
    }, duration * 1000);
  };

  // Handle dice
  const handleDice = () => {
    setActiveGame('dice');
    const { intensity, duration } = rollDice();
    onIntensityChange(intensity);

    setTimeout(() => {
      onIntensityChange(0);
      stopGame();
    }, duration * 1000);
  };

  // Handle cards
  const handleCards = () => {
    setActiveGame('cards');
    const { intensity, duration } = drawCard();
    onIntensityChange(intensity);

    setTimeout(() => {
      onIntensityChange(0);
      stopGame();
    }, duration * 1000);
  };

  // Handle timer challenge
  const handleTimer = () => {
    setActiveGame('timer');
    const { intensity, duration } = startTimerChallenge(timerIntensity, timerDuration);
    onIntensityChange(intensity);

    setTimeout(() => {
      onIntensityChange(0);
      stopGame();
    }, duration * 1000);
  };

  // Handle progressive mode
  const handleProgressive = () => {
    setActiveGame('progressive');
    startProgressive(progressiveStart, progressiveIncrement, progressiveInterval);
    setProgressiveIntensity(progressiveStart);
    onIntensityChange(progressiveStart);
  };

  // Progressive mode interval
  useEffect(() => {
    if (activeGame === 'progressive') {
      const interval = setInterval(() => {
        setProgressiveIntensity(prev => {
          const next = Math.min(prev + progressiveIncrement, 1.0);
          onIntensityChange(next);
          if (next >= 1.0) {
            stopGame();
          }
          return next;
        });
      }, progressiveInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [activeGame, progressiveIncrement, progressiveInterval, onIntensityChange, stopGame]);

  const handleStop = () => {
    onIntensityChange(0);
    stopGame();
  };

  return (
    <div className="space-y-4">
      {/* Roulette */}
      <Card className="">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Pleasure Roulette
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Spin for random intensity and duration
              </CardDescription>
            </div>
            {activeGame === 'roulette' && (
              <Badge className="bg-gradient-to-r from-primary to-accent animate-pulse">
                Active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {gameState.isPlaying && activeGame === 'roulette' && (
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-center">
              <p className="text-2xl font-bold text-primary mb-1">
                {Math.round(gameState.currentValue * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">{gameState.result}</p>
            </div>
          )}
          <Button
            onClick={activeGame === 'roulette' ? handleStop : handleRoulette}
            disabled={isDisabled || (activeGame !== null && activeGame !== 'roulette')}
            className="w-full"
            variant={activeGame === 'roulette' ? 'destructive' : 'default'}
          >
            {activeGame === 'roulette' ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Spin Roulette
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Dice Game */}
      <Card className="">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Dices className="w-5 h-5 text-accent" />
                Dice Roll
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Roll 1-6, higher = more intense
              </CardDescription>
            </div>
            {activeGame === 'dice' && (
              <Badge className="bg-gradient-to-r from-accent to-primary animate-pulse">
                Active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {gameState.isPlaying && activeGame === 'dice' && (
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20 text-center">
              <p className="text-4xl font-bold text-accent mb-1">
                🎲 {gameState.currentValue}
              </p>
              <p className="text-sm text-muted-foreground">{gameState.result}</p>
            </div>
          )}
          <Button
            onClick={activeGame === 'dice' ? handleStop : handleDice}
            disabled={isDisabled || (activeGame !== null && activeGame !== 'dice')}
            className="w-full"
            variant={activeGame === 'dice' ? 'destructive' : 'default'}
          >
            {activeGame === 'dice' ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Roll Dice
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Card Draw */}
      <Card className="">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-xl">🃏</span>
                Card Draw
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Draw a card - face cards = high intensity
              </CardDescription>
            </div>
            {activeGame === 'cards' && (
              <Badge className="bg-gradient-to-r from-primary to-accent animate-pulse">
                Active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {gameState.isPlaying && activeGame === 'cards' && (
            <div className="p-4 bg-secondary/50 rounded-lg border text-center">
              <p className="text-3xl font-bold mb-1">{gameState.result.split(' - ')[0]}</p>
              <p className="text-sm text-muted-foreground">{gameState.result.split(' - ')[1]}</p>
            </div>
          )}
          <Button
            onClick={activeGame === 'cards' ? handleStop : handleCards}
            disabled={isDisabled || (activeGame !== null && activeGame !== 'cards')}
            className="w-full"
            variant={activeGame === 'cards' ? 'destructive' : 'default'}
          >
            {activeGame === 'cards' ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Draw Card
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Timer Challenge */}
      <Card className="">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Timer className="w-5 h-5 text-orange-500" />
                Timer Challenge
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Hold intensity for set duration
              </CardDescription>
            </div>
            {activeGame === 'timer' && (
              <Badge className="bg-orange-500 animate-pulse">Active</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Intensity: {Math.round(timerIntensity * 100)}%</Label>
            <Slider
              value={[timerIntensity]}
              onValueChange={([v]) => setTimerIntensity(v)}
              min={0.1}
              max={1}
              step={0.05}
              disabled={activeGame === 'timer'}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Duration: {timerDuration}s</Label>
            <Slider
              value={[timerDuration]}
              onValueChange={([v]) => setTimerDuration(v)}
              min={10}
              max={120}
              step={5}
              disabled={activeGame === 'timer'}
            />
          </div>
          <Button
            onClick={activeGame === 'timer' ? handleStop : handleTimer}
            disabled={isDisabled || (activeGame !== null && activeGame !== 'timer')}
            className="w-full"
            variant={activeGame === 'timer' ? 'destructive' : 'default'}
          >
            {activeGame === 'timer' ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Challenge
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Progressive Mode */}
      <Card className="">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Progressive Mode
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Gradually increase intensity over time
              </CardDescription>
            </div>
            {activeGame === 'progressive' && (
              <Badge className="bg-green-500 animate-pulse">Active</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Start: {Math.round(progressiveStart * 100)}%</Label>
            <Slider
              value={[progressiveStart]}
              onValueChange={([v]) => setProgressiveStart(v)}
              min={0.1}
              max={0.5}
              step={0.05}
              disabled={activeGame === 'progressive'}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Increment: +{Math.round(progressiveIncrement * 100)}%</Label>
            <Slider
              value={[progressiveIncrement]}
              onValueChange={([v]) => setProgressiveIncrement(v)}
              min={0.05}
              max={0.2}
              step={0.05}
              disabled={activeGame === 'progressive'}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Interval: {progressiveInterval}s</Label>
            <Slider
              value={[progressiveInterval]}
              onValueChange={([v]) => setProgressiveInterval(v)}
              min={5}
              max={30}
              step={5}
              disabled={activeGame === 'progressive'}
            />
          </div>
          {activeGame === 'progressive' && (
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round(progressiveIntensity * 100)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Current Intensity</p>
            </div>
          )}
          <Button
            onClick={activeGame === 'progressive' ? handleStop : handleProgressive}
            disabled={isDisabled || (activeGame !== null && activeGame !== 'progressive')}
            className="w-full"
            variant={activeGame === 'progressive' ? 'destructive' : 'default'}
          >
            {activeGame === 'progressive' ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Progressive
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      {gameState.history.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Game History</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearHistory}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {gameState.history.slice().reverse().map((result, idx) => (
                  <div
                    key={idx}
                    className="p-2 border rounded text-xs flex items-center justify-between"
                  >
                    <span className="font-medium capitalize">{result.game}</span>
                    <span className="text-muted-foreground">
                      {Math.round(result.intensity * 100)}% • {Math.round(result.duration)}s
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {!isConnected && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Not Connected</p>
            <p className="text-sm mt-1">Connect to devices to play games</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
