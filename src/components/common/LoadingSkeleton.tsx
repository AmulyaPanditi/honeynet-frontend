import React from 'react'
import { cn } from '../../utils/cn'

interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'timeline' | 'graph';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'card',
  count = 3,
  className,
}) => {
  if (type === 'card') {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-soc-border bg-soc-card/60 p-5 space-y-3 animate-pulse"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-soc-border rounded" />
              <div className="h-8 w-8 bg-soc-border rounded-lg" />
            </div>
            <div className="h-7 w-20 bg-soc-border/80 rounded" />
            <div className="h-3 w-32 bg-soc-border/50 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'table') {
    return (
      <div className={cn('rounded-xl border border-soc-border bg-soc-card/60 p-4 space-y-3 animate-pulse', className)}>
        <div className="h-8 w-full bg-soc-border/60 rounded" />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-12 w-full bg-soc-border/30 rounded" />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border border-soc-border bg-soc-card/40 p-8 h-80 flex items-center justify-center animate-pulse', className)}>
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-soc-cyan border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-soc-muted">Loading Telemetry & Graph...</span>
      </div>
    </div>
  )
}
