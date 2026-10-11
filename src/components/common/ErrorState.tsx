import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '../../utils/cn'

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'An unexpected error occurred while loading telemetry data.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-rose-500/30 bg-rose-950/20 p-8 text-center flex flex-col items-center justify-center',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3 border border-rose-500/40">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-rose-300">Telemetry Feed Error</h3>
      <p className="text-xs text-soc-muted max-w-sm mt-1.5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Connection
        </button>
      )}
    </div>
  )
}
