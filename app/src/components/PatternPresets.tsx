import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PATTERN_PRESETS, createPatternFromPreset, type PatternPreset } from '@/lib/patternPresets';
import { Sparkles, Zap, Activity, Shuffle } from 'lucide-react';

interface PatternPresetsProps {
  onSelectPreset: (preset: PatternPreset) => void;
}

const categoryIcons = {
  gentle: Sparkles,
  intense: Zap,
  rhythmic: Activity,
  random: Shuffle,
};

const categoryColors = {
  gentle: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  intense: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  rhythmic: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  random: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
};

export function PatternPresets({ onSelectPreset }: PatternPresetsProps) {
  const categories = ['all', 'gentle', 'intense', 'rhythmic', 'random'] as const;

  const getPatternsByCategory = (category: typeof categories[number]) => {
    if (category === 'all') return PATTERN_PRESETS;
    return PATTERN_PRESETS.filter(p => p.category === category);
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Pattern Library
        </CardTitle>
        <CardDescription>
          Choose from pre-made patterns or create your own
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="gentle" className="text-xs">Gentle</TabsTrigger>
            <TabsTrigger value="intense" className="text-xs">Intense</TabsTrigger>
            <TabsTrigger value="rhythmic" className="text-xs">Rhythmic</TabsTrigger>
            <TabsTrigger value="random" className="text-xs">Random</TabsTrigger>
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category} value={category} className="mt-0">
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getPatternsByCategory(category).map((preset, index) => {
                    const Icon = categoryIcons[preset.category];
                    return (
                      <div
                        key={preset.id}
                        className="group relative p-4 border rounded-lg hover:bg-accent/50 transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-pointer animate-in fade-in slide-in-from-bottom-2"
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => onSelectPreset(preset)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{preset.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm">{preset.name}</h4>
                              <Badge
                                variant="outline"
                                className={`text-xs ${categoryColors[preset.category]}`}
                              >
                                <Icon className="w-3 h-3 mr-1" />
                                {preset.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {preset.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <span>{preset.pattern.duration}s</span>
                              <span>•</span>
                              <span>{preset.pattern.points.length} points</span>
                              <span>•</span>
                              <span>{preset.pattern.loop ? 'Loop' : 'Once'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="absolute inset-0 border-2 border-primary rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
