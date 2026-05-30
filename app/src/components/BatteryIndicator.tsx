import { Battery, BatteryCharging, BatteryLow, BatteryMedium, BatteryFull } from 'lucide-react';

interface BatteryIndicatorProps {
  level?: number; // 0-100 or undefined
  className?: string;
}

export function BatteryIndicator({ level, className = '' }: BatteryIndicatorProps) {
  if (level === undefined) {
    return null;
  }

  const getBatteryIcon = () => {
    if (level >= 80) return BatteryFull;
    if (level >= 50) return BatteryMedium;
    if (level >= 20) return BatteryLow;
    return BatteryLow;
  };

  const getBatteryColor = () => {
    if (level >= 50) return 'text-green-500 dark:text-green-400';
    if (level >= 20) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  const Icon = getBatteryIcon();

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Icon className={`w-4 h-4 ${getBatteryColor()}`} />
      <span className={`text-xs font-medium ${getBatteryColor()}`}>
        {level}%
      </span>
    </div>
  );
}
