
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: number;
  progress?: number;
  colorScheme?: 'green' | 'red' | 'blue' | 'purple' | 'gold';
  subtitle?: string;
  className?: string;
}

export const StatCard = ({
  title,
  value,
  icon,
  change,
  progress,
  colorScheme = 'blue',
  subtitle,
  className
}: StatCardProps) => {
  // Цветовые схемы для разных типов карточек
  const colorSchemes = {
    green: {
      iconBg: 'bg-green-100 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      progressFrom: 'from-green-500',
      progressTo: 'to-green-300',
    },
    red: {
      iconBg: 'bg-red-100 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      progressFrom: 'from-red-500',
      progressTo: 'to-red-300',
    },
    blue: {
      iconBg: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      progressFrom: 'from-blue-500',
      progressTo: 'to-blue-300',
    },
    purple: {
      iconBg: 'bg-purple-100 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      progressFrom: 'from-purple-500',
      progressTo: 'to-purple-300',
    },
    gold: {
      iconBg: 'bg-amber-100 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      progressFrom: 'from-amber-500',
      progressTo: 'to-amber-300',
    }
  };
  
  const colors = colorSchemes[colorScheme];
  
  // Определяем цвет изменения в зависимости от значения
  const getChangeColor = (value: number | undefined) => {
    if (!value) return '';
    return value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : '';
  };
  
  // Форматируем изменение для отображения
  const formatChange = (value: number | undefined) => {
    if (value === undefined) return null;
    return `${value > 0 ? '+' : ''}${value}%`;
  };

  return (
    <Card gradient className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base text-muted-foreground font-medium">{title}</CardTitle>
          <div className={cn("p-2 rounded-full", colors.iconBg)}>
            <span className={cn("block", colors.iconColor)}>{icon}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-baseline">
          <div className="text-2xl md:text-3xl font-bold">{value}</div>
          {change !== undefined && (
            <div className={cn("text-sm font-medium", getChangeColor(change))}>
              {formatChange(change)}
            </div>
          )}
        </div>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        {progress !== undefined && (
          <Progress
            value={progress}
            className="h-2"
            style={
              {
                "--progress-from": `var(--${colorScheme}-500)`,
                "--progress-to": `var(--${colorScheme}-300)`
              } as React.CSSProperties
            }
          />
        )}
      </CardContent>
    </Card>
  );
};
