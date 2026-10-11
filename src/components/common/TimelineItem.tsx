import React, { useState } from 'react'
import { TelemetryEvent, TechniqueMapping } from '../../types'
import { formatRelativeTime, formatDateTime, getEventTypeStyle } from '../../utils/formatters'
import { TechniqueBadge } from './TechniqueBadge'
import { RiskBadge } from './RiskBadge'
import { ChevronDown, ChevronUp, Terminal, KeyRound, Download, Upload, ShieldCheck, Clock } from 'lucide-react'
import { cn } from '../../utils/cn'

interface TimelineItemProps {
  event: TelemetryEvent;
  mapping?: TechniqueMapping;
  isLast?: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  event,
  mapping,
  isLast = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const style = getEventTypeStyle(event.event_type)

  const getIcon = () => {
    switch (event.event_type) {
      case 'successful_login':
        return <ShieldCheck className="w-4 h-4 text-rose-400" />
      case 'login_attempt':
        return <KeyRound className="w-4 h-4 text-amber-400" />
      case 'command_execution':
        return <Terminal className="w-4 h-4 text-cyan-400" />
      case 'file_download':
        return <Download className="w-4 h-4 text-purple-400" />
      case 'file_upload':
        return <Upload className="w-4 h-4 text-blue-400" />
      default:
        return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  return (
    <div className="relative pl-6 pb-6 group">
      {/* Vertical timeline line */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-soc-border group-hover:bg-soc-borderLight transition-colors" />
      )}

      {/* Node bullet */}
      <div
        className={cn(
          'absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300',
          style.bg,
          style.border,
          'shadow-sm group-hover:scale-110'
        )}
      >
        {getIcon()}
      </div>

      {/* Content box */}
      <div className="rounded-xl border border-soc-border/70 bg-soc-card/70 p-3.5 hover:border-soc-borderLight transition-all">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                style.bg,
                style.text,
                style.border
              )}
            >
              {style.label}
            </span>
            <span className="text-xs text-soc-muted font-mono" title={event.timestamp}>
              {formatDateTime(event.timestamp)} ({formatRelativeTime(event.timestamp)})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <RiskBadge risk={event.risk_level} size="sm" />
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded text-soc-muted hover:text-white hover:bg-soc-border/60 transition-colors"
              title="Toggle raw evidence"
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Monospace Command / Details display */}
        {event.command && (
          <div className="bg-black/50 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-cyan-200 overflow-x-auto my-2 shadow-inner">
            <span className="text-slate-500 select-none mr-2">$</span>
            {event.command}
          </div>
        )}

        {event.username && (
          <div className="bg-black/40 border border-amber-950/40 rounded-lg p-2 text-xs font-mono text-amber-300 my-1.5 flex items-center gap-2">
            <span className="text-soc-muted">AUTH ATTEMPT:</span>
            <span>user: <strong className="text-white">{event.username}</strong></span>
            <span>pass: <strong className="text-white">{event.password_attempt || '***'}</strong></span>
            <span className={event.success ? 'text-rose-400 font-bold ml-auto' : 'text-slate-500 ml-auto'}>
              {event.success ? 'GRANTED [UID=0]' : 'REJECTED'}
            </span>
          </div>
        )}

        {event.file_name && (
          <div className="bg-black/40 border border-purple-950/40 rounded-lg p-2 text-xs font-mono text-purple-300 my-1.5 flex items-center justify-between">
            <span>FILE: <strong>{event.file_name}</strong></span>
            {event.file_hash && (
              <span className="text-[10px] text-soc-muted truncate max-w-[200px]" title={event.file_hash}>
                SHA256: {event.file_hash.slice(0, 12)}...
              </span>
            )}
          </div>
        )}

        {/* Technique mapping row */}
        {(event.technique_id || mapping) && (
          <div className="mt-2.5 pt-2 border-t border-soc-border/40 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-soc-muted">MITRE Mapping:</span>
              <TechniqueBadge
                techniqueId={event.technique_id || mapping?.technique_id || ''}
                techniqueName={event.technique_name || mapping?.technique_name}
                tactic={event.tactic || mapping?.tactic}
                confidence={event.confidence || mapping?.confidence}
              />
            </div>
          </div>
        )}

        {/* Expanded raw evidence */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-soc-border/40 space-y-2 text-xs">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-soc-muted">
              Raw Honeynet Normalized Telemetry
            </div>
            <pre className="p-2.5 rounded bg-black/60 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(event, null, 2)}
            </pre>
            {mapping?.evidence && (
              <div className="text-[11px] text-slate-400 bg-soc-surface p-2 rounded border border-soc-border/50">
                <strong className="text-soc-cyan">Mapping Logic:</strong> {mapping.evidence}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
