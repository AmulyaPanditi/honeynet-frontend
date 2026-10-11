import React from 'react'
import { TelemetryEvent } from '../../types'
import { formatRelativeTime, getEventTypeStyle } from '../../utils/formatters'
import { RiskBadge } from './RiskBadge'
import { TechniqueBadge } from './TechniqueBadge'
import { Terminal, KeyRound, Download, Upload, ShieldAlert, Radio } from 'lucide-react'
import { cn } from '../../utils/cn'

interface EventRowProps {
  event: TelemetryEvent;
  onSelect: (event: TelemetryEvent) => void;
  isHighlighted?: boolean;
}

export const EventRow: React.FC<EventRowProps> = ({
  event,
  onSelect,
  isHighlighted = false,
}) => {
  const eventStyle = getEventTypeStyle(event.event_type)

  const getEventIcon = () => {
    switch (event.event_type) {
      case 'command_execution':
        return <Terminal className="w-3.5 h-3.5 text-soc-cyan" />
      case 'login_attempt':
      case 'successful_login':
        return <KeyRound className="w-3.5 h-3.5 text-amber-400" />
      case 'file_download':
        return <Download className="w-3.5 h-3.5 text-purple-400" />
      case 'file_upload':
        return <Upload className="w-3.5 h-3.5 text-blue-400" />
      case 'port_scan':
        return <Radio className="w-3.5 h-3.5 text-emerald-400" />
      default:
        return <ShieldAlert className="w-3.5 h-3.5 text-soc-muted" />
    }
  }

  // Display payload or command text
  const payloadDisplay =
    event.command ||
    (event.username ? `auth: ${event.username}:${event.password_attempt || '***'}` : null) ||
    event.file_name ||
    event.raw_payload ||
    '—'

  return (
    <tr
      onClick={() => onSelect(event)}
      className={cn(
        'group border-b border-soc-border/50 hover:bg-soc-cardHover/70 transition-colors cursor-pointer text-xs',
        isHighlighted && 'bg-soc-cyan/5 border-l-2 border-l-soc-cyan'
      )}
    >
      {/* Timestamp */}
      <td className="py-3 px-4 whitespace-nowrap text-soc-muted font-mono">
        <span title={event.timestamp}>{formatRelativeTime(event.timestamp)}</span>
      </td>

      {/* Source IP */}
      <td className="py-3 px-4 whitespace-nowrap">
        <span className="font-mono text-cyan-300 font-medium hover:underline">
          {event.source_ip}
        </span>
      </td>

      {/* Session ID */}
      <td className="py-3 px-4 whitespace-nowrap">
        <span className="font-mono text-soc-muted bg-soc-border/30 px-2 py-0.5 rounded text-[11px]">
          {event.session_id}
        </span>
      </td>

      {/* Event Type Badge */}
      <td className="py-3 px-4 whitespace-nowrap">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border',
            eventStyle.bg,
            eventStyle.text,
            eventStyle.border
          )}
        >
          {getEventIcon()}
          <span>{eventStyle.label}</span>
        </span>
      </td>

      {/* Monospace Command / Payload preview */}
      <td className="py-3 px-4 max-w-xs md:max-w-md truncate">
        <span className="font-mono text-slate-200 bg-black/40 px-2 py-1 rounded border border-white/5 inline-block max-w-full truncate">
          {payloadDisplay}
        </span>
      </td>

      {/* MITRE ATT&CK mapping */}
      <td className="py-3 px-4 whitespace-nowrap">
        {event.technique_id ? (
          <TechniqueBadge
            techniqueId={event.technique_id}
            techniqueName={event.technique_name}
            tactic={event.tactic}
            confidence={event.confidence}
          />
        ) : (
          <span className="text-soc-muted/60 text-[11px] italic">unmapped</span>
        )}
      </td>

      {/* Risk Badge */}
      <td className="py-3 px-4 whitespace-nowrap text-right">
        <RiskBadge risk={event.risk_level} size="sm" />
      </td>
    </tr>
  )
}
