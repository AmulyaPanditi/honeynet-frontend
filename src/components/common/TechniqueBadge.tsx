import React from 'react'
import { getTacticStyle } from '../../utils/formatters'
import { cn } from '../../utils/cn'

interface TechniqueBadgeProps {
  techniqueId: string;
  techniqueName?: string;
  tactic?: string;
  confidence?: number;
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
}

export const TechniqueBadge: React.FC<TechniqueBadgeProps> = ({
  techniqueId,
  techniqueName,
  tactic,
  confidence,
  className,
  onClick,
  clickable = false,
}) => {
  const style = tactic ? getTacticStyle(tactic) : {
    bg: 'bg-soc-border/40',
    text: 'text-soc-cyan',
    border: 'border-soc-cyan/30',
    badge: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable && !onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all text-left',
        style.badge,
        (clickable || onClick) && 'hover:brightness-125 hover:border-cyan-400 cursor-pointer',
        className
      )}
    >
      <span className="font-semibold text-white/90">{techniqueId}</span>
      {techniqueName && (
        <span className="text-soc-muted truncate max-w-[140px] border-l border-white/10 pl-1.5">
          {techniqueName}
        </span>
      )}
      {confidence !== undefined && (
        <span className="text-[10px] text-soc-cyan bg-cyan-950/60 px-1 py-0.2 rounded font-sans">
          {Math.round(confidence * 100)}%
        </span>
      )}
    </button>
  )
}
