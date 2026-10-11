import React from 'react'
import { cn } from '../../utils/cn'

interface ScoreBarProps {
  label: string;
  value: number; // 0 to 1 or 0 to 100
  maxValue?: number;
  formatAsPercent?: boolean;
  color?: 'cyan' | 'rose' | 'amber' | 'emerald' | 'purple';
  showValue?: boolean;
  className?: string;
  description?: string;
}

export const ScoreBar: React.FC<ScoreBarProps> = ({
  label,
  value,
  maxValue = 1,
  formatAsPercent = true,
  color,
  showValue = true,
  className,
  description,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100))

  // Auto determine color if not supplied
  const resolvedColor =
    color ||
    (percentage >= 80 ? 'rose' : percentage >= 50 ? 'amber' : 'emerald')

  const barStyles = {
    rose: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
    amber: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    emerald: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    cyan: 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]',
    purple: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]',
  }[resolvedColor]

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-soc-muted font-medium">{label}</span>
        {showValue && (
          <span className="font-mono font-bold text-white/90">
            {formatAsPercent ? `${Math.round(percentage)}%` : value.toFixed(2)}
          </span>
        )}
      </div>
      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-soc-border/50 p-0.5">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barStyles)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {description && (
        <p className="text-[11px] text-soc-muted/80">{description}</p>
      )}
    </div>
  )
}
