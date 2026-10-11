import React from 'react'
import { RiskLevel } from '../../types'
import { getRiskColors } from '../../utils/formatters'
import { cn } from '../../utils/cn'

interface RiskBadgeProps {
  risk: RiskLevel | number;
  showScore?: boolean;
  score?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  risk,
  showScore = false,
  score,
  className,
  size = 'md',
}) => {
  const colors = getRiskColors(risk)
  const label = typeof risk === 'number' ? (risk >= 80 ? 'CRITICAL' : risk >= 60 ? 'HIGH' : risk >= 35 ? 'MEDIUM' : 'LOW') : risk.toUpperCase()

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size]

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-medium rounded-full uppercase tracking-wider',
        colors.badge,
        sizeClasses,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', colors.dot)} />
      <span>{label}</span>
      {showScore && score !== undefined && (
        <span className="opacity-80 font-normal">({score})</span>
      )}
    </span>
  )
}
