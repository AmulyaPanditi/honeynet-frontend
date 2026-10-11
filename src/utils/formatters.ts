import { RiskLevel, ActorType, EventType } from '../types'

export function formatRelativeTime(dateInput?: string | null): string {
  if (!dateInput) return 'N/A'
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return 'N/A'

  const now = new Date()
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000))

  if (diffInSeconds < 5) return 'just now'
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`
  const minutes = Math.floor(diffInSeconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function formatDateTime(dateInput?: string | null): string {
  if (!dateInput) return '—'
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return '—'

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '< 1s'
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m < 60) return `${m}m ${s}s`
  const h = Math.floor(m / 60)
  const remM = m % 60
  return `${h}h ${remM}m`
}

export function getRiskLevelFromScore(score: number): RiskLevel {
  if (score >= 80) return 'critical'
  if (score >= 60) return 'high'
  if (score >= 35) return 'medium'
  return 'low'
}

export function getRiskColors(risk: RiskLevel | number) {
  const level: RiskLevel = typeof risk === 'number' ? getRiskLevelFromScore(risk) : risk

  switch (level) {
    case 'critical':
      return {
        text: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-glow-rose',
        dot: 'bg-rose-500',
        glow: 'shadow-glow-rose',
        hex: '#f43f5e',
      }
    case 'high':
      return {
        text: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        badge: 'bg-red-500/20 text-red-300 border border-red-500/40',
        dot: 'bg-red-500',
        glow: 'shadow-glow-rose',
        hex: '#ef4444',
      }
    case 'medium':
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
        dot: 'bg-amber-500',
        glow: '',
        hex: '#f59e0b',
      }
    case 'low':
    default:
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
        dot: 'bg-emerald-500',
        glow: '',
        hex: '#10b981',
      }
  }
}

export function getActorTypeLabel(type: ActorType | string): string {
  switch (type) {
    case 'interactive_attacker':
      return 'Interactive Attacker'
    case 'automated_scanner':
      return 'Automated Scanner'
    case 'credential_stuffer':
      return 'Credential Stuffer'
    case 'discovery_heavy':
      return 'Discovery Scout'
    case 'persistence_attempt':
      return 'Persistence Operator'
    case 'botnet_dropper':
      return 'Botnet Payload Dropper'
    default:
      return type ? type.replace(/_/g, ' ') : 'Unknown Actor'
  }
}

export function getActorTypeBadge(type: ActorType | string) {
  switch (type) {
    case 'interactive_attacker':
      return {
        bg: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
        indicator: 'bg-rose-500',
      }
    case 'persistence_attempt':
      return {
        bg: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
        indicator: 'bg-purple-500',
      }
    case 'credential_stuffer':
      return {
        bg: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
        indicator: 'bg-amber-500',
      }
    case 'discovery_heavy':
      return {
        bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
        indicator: 'bg-cyan-500',
      }
    case 'botnet_dropper':
      return {
        bg: 'bg-red-500/15 text-red-300 border-red-500/40',
        indicator: 'bg-red-500',
      }
    case 'automated_scanner':
    default:
      return {
        bg: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
        indicator: 'bg-blue-500',
      }
  }
}

export function getEventTypeStyle(type: EventType | string) {
  switch (type) {
    case 'successful_login':
      return {
        label: 'Auth Success',
        text: 'text-rose-400',
        bg: 'bg-rose-950/40',
        border: 'border-rose-500/40',
        iconBg: 'bg-rose-500/20',
      }
    case 'login_attempt':
      return {
        label: 'Login Attempt',
        text: 'text-amber-400',
        bg: 'bg-amber-950/30',
        border: 'border-amber-500/40',
        iconBg: 'bg-amber-500/20',
      }
    case 'command_execution':
      return {
        label: 'Command Exec',
        text: 'text-cyan-400',
        bg: 'bg-cyan-950/30',
        border: 'border-cyan-500/40',
        iconBg: 'bg-cyan-500/20',
      }
    case 'file_download':
      return {
        label: 'Payload Fetch',
        text: 'text-purple-400',
        bg: 'bg-purple-950/30',
        border: 'border-purple-500/40',
        iconBg: 'bg-purple-500/20',
      }
    case 'file_upload':
      return {
        label: 'File Exfil',
        text: 'text-blue-400',
        bg: 'bg-blue-950/30',
        border: 'border-blue-500/40',
        iconBg: 'bg-blue-500/20',
      }
    case 'session_closed':
      return {
        label: 'Session Terminated',
        text: 'text-slate-400',
        bg: 'bg-slate-900/40',
        border: 'border-slate-700/40',
        iconBg: 'bg-slate-800/40',
      }
    default:
      return {
        label: type,
        text: 'text-slate-300',
        bg: 'bg-slate-900/30',
        border: 'border-slate-700/30',
        iconBg: 'bg-slate-800/20',
      }
  }
}

export const MITRE_TACTICS = [
  'Reconnaissance',
  'Resource Development',
  'Initial Access',
  'Execution',
  'Persistence',
  'Privilege Escalation',
  'Defense Evasion',
  'Credential Access',
  'Discovery',
  'Lateral Movement',
  'Collection',
  'Command and Control',
  'Exfiltration',
  'Impact',
] as const

export function getTacticStyle(tactic: string) {
  switch (tactic) {
    case 'Initial Access':
    case 'Credential Access':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      }
    case 'Execution':
    case 'Privilege Escalation':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      }
    case 'Persistence':
    case 'Defense Evasion':
      return {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      }
    case 'Discovery':
    case 'Reconnaissance':
      return {
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        border: 'border-cyan-500/30',
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      }
    case 'Command and Control':
    case 'Lateral Movement':
      return {
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-400',
        border: 'border-indigo-500/30',
        badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      }
    case 'Exfiltration':
    case 'Impact':
      return {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/30',
        badge: 'bg-red-500/20 text-red-300 border-red-500/40',
      }
    default:
      return {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      }
  }
}
