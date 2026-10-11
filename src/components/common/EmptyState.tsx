import React from 'react'
import { ShieldAlert, LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = ShieldAlert,
  title,
  description,
  actionText,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-dashed border-soc-border/70 p-12 text-center flex flex-col items-center justify-center bg-soc-card/30',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-soc-border/40 text-soc-cyan flex items-center justify-center mb-4 border border-soc-cyan/20">
        <Icon className="w-6 h-6 opacity-80" />
      </div>
      <h3 className="text-sm font-semibold text-white tracking-wide">{title}</h3>
      <p className="text-xs text-soc-muted max-w-sm mt-1.5 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-1.5 rounded-lg text-xs font-medium bg-soc-cyan/15 text-soc-cyan border border-soc-cyan/40 hover:bg-soc-cyan/25 transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  )
}
