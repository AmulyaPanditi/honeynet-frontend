import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'cyan' | 'rose' | 'amber' | 'emerald' | 'purple' | 'blue';
  trend?: {
    value: string;
    isUp?: boolean;
    isNeutral?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'cyan',
  trend,
  onClick,
  className,
}) => {
  const variantStyles = {
    cyan: {
      border: 'border-cyan-500/30 hover:border-cyan-500/60',
      glow: 'hover:shadow-glow-cyan',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
      value: 'text-cyan-400',
    },
    rose: {
      border: 'border-rose-500/30 hover:border-rose-500/60',
      glow: 'hover:shadow-glow-rose',
      iconBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
      value: 'text-rose-400',
    },
    amber: {
      border: 'border-amber-500/30 hover:border-amber-500/60',
      glow: 'hover:shadow-[0_0_18px_-3px_rgba(245,158,11,0.35)]',
      iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      value: 'text-amber-400',
    },
    emerald: {
      border: 'border-emerald-500/30 hover:border-emerald-500/60',
      glow: 'hover:shadow-glow-emerald',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      value: 'text-emerald-400',
    },
    purple: {
      border: 'border-purple-500/30 hover:border-purple-500/60',
      glow: 'hover:shadow-glow-purple',
      iconBg: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
      value: 'text-purple-400',
    },
    blue: {
      border: 'border-blue-500/30 hover:border-blue-500/60',
      glow: 'hover:shadow-[0_0_18px_-3px_rgba(59,130,246,0.35)]',
      iconBg: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
      value: 'text-blue-400',
    },
  }[variant]

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl bg-soc-card/90 backdrop-blur-md p-5 border transition-all duration-300',
        variantStyles.border,
        variantStyles.glow,
        onClick && 'cursor-pointer hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-soc-muted">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={cn('text-3xl font-bold tracking-tight font-mono', variantStyles.value)}>
              {value}
            </span>
            {trend && (
              <span
                className={cn(
                  'text-xs font-mono font-medium',
                  trend.isNeutral
                    ? 'text-soc-muted'
                    : trend.isUp
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                )}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1.5 text-xs text-soc-muted/90 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn('p-2.5 rounded-lg shrink-0 shadow-sm', variantStyles.iconBg)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {/* Decorative cyber corner */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white" />
      </div>
    </div>
  )
}
