import { useState } from 'react';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Smartphone,
  Waves,
  Music,
  BookOpen,
  Zap,
  Menu,
  Bluetooth,
  Wifi,
  Sparkles,
} from 'lucide-react';
import type { TabType } from '@/types';

interface LayoutProps {
  children: ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isConnected: boolean;
  deviceCount: number;
}

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'devices', label: 'Devices', icon: Smartphone },
  { id: 'manual', label: 'Manual', icon: Zap },
  { id: 'patterns', label: 'Patterns', icon: Waves },
  { id: 'modes', label: 'Modes', icon: Sparkles },
  { id: 'audio', label: 'Audio', icon: Music },
  { id: 'guide', label: 'Guide', icon: BookOpen },
];

export function Layout({
  children,
  activeTab,
  onTabChange,
  isConnected,
  deviceCount,
}: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Bluetooth className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="font-semibold text-lg hidden sm:block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Pleasure Control
            </h1>
            <h1 className="font-semibold text-lg sm:hidden bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PC
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hidden sm:inline-flex">
                    {deviceCount} device{deviceCount !== 1 ? 's' : ''}
                  </Badge>
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4 text-muted-foreground" />
                  <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                    Disconnected
                  </Badge>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-accent rounded-md transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t bg-background">
            <div className="container mx-auto px-4 py-2">
              <div className="flex flex-col gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-4 flex gap-4">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <Card className="p-2 sticky top-20">
            <nav className="flex flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent text-muted-foreground'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'devices' && deviceCount > 0 && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {deviceCount}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
          </Card>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 max-w-3xl mx-auto lg:mx-0">
          {children}
        </main>
      </div>
    </div>
  );
}
