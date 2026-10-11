import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import {
  Globe,
  Server,
  KeyRound,
  Terminal,
  FileCode,
  Shield,
  Sparkles,
} from 'lucide-react'
import { GraphNodeType, RiskLevel } from '../../types'
import { cn } from '../../utils/cn'

interface CustomNodeData {
  id: string;
  type: GraphNodeType;
  label: string;
  sublabel?: string;
  risk_level?: RiskLevel;
  confidence?: number;
  evidence?: string;
  technique_id?: string;
  tactic?: string;
  details?: Record<string, any>;
}

export const CustomGraphNode = memo(({ data, selected }: { data: CustomNodeData; selected?: boolean }) => {
  const getNodeStyling = () => {
    switch (data.type) {
      case 'attacker':
        return {
          icon: Globe,
          bg: 'bg-rose-950/80',
          border: 'border-rose-500/60 shadow-glow-rose',
          text: 'text-rose-300',
          tagBg: 'bg-rose-500/20 text-rose-300',
          badgeText: 'ATTACKER IP',
        }
      case 'session':
        return {
          icon: Server,
          bg: 'bg-blue-950/80',
          border: 'border-blue-500/60 shadow-[0_0_14px_rgba(59,130,246,0.25)]',
          text: 'text-blue-300',
          tagBg: 'bg-blue-500/20 text-blue-300',
          badgeText: 'HONEYNET SESSION',
        }
      case 'login':
        return {
          icon: KeyRound,
          bg: 'bg-amber-950/80',
          border: 'border-amber-500/60 shadow-[0_0_14px_rgba(245,158,11,0.25)]',
          text: 'text-amber-300',
          tagBg: 'bg-amber-500/20 text-amber-300',
          badgeText: 'AUTH EVENT',
        }
      case 'command':
        return {
          icon: Terminal,
          bg: 'bg-slate-900/90',
          border: 'border-cyan-500/60 shadow-glow-cyan',
          text: 'text-cyan-300',
          tagBg: 'bg-cyan-500/20 text-cyan-300',
          badgeText: 'COMMAND EXEC',
        }
      case 'file':
        return {
          icon: FileCode,
          bg: 'bg-purple-950/80',
          border: 'border-purple-500/60 shadow-glow-purple',
          text: 'text-purple-300',
          tagBg: 'bg-purple-500/20 text-purple-300',
          badgeText: 'FILE PAYLOAD',
        }
      case 'technique':
        return {
          icon: Shield,
          bg: 'bg-slate-900/90',
          border: 'border-emerald-500/60 shadow-glow-emerald',
          text: 'text-emerald-300',
          tagBg: 'bg-emerald-500/20 text-emerald-300',
          badgeText: 'MITRE ATT&CK',
        }
      case 'prediction':
      default:
        return {
          icon: Sparkles,
          bg: 'bg-purple-950/90',
          border: 'border-purple-400 border-dashed shadow-[0_0_20px_rgba(168,85,247,0.4)]',
          text: 'text-purple-200',
          tagBg: 'bg-purple-500/30 text-purple-300',
          badgeText: 'CAUSAL FORECAST',
        }
    }
  }

  const style = getNodeStyling()
  const Icon = style.icon

  return (
    <div
      className={cn(
        'px-3.5 py-2.5 rounded-xl border backdrop-blur-md min-w-[190px] max-w-[260px] transition-all duration-200 cursor-pointer select-none',
        style.bg,
        style.border,
        selected && 'ring-2 ring-white scale-105'
      )}
    >
      {/* React Flow Handles for top/bottom or left/right connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2.5 h-2.5 bg-soc-cyan border-2 border-soc-bg"
      />

      <div className="flex items-center gap-2 mb-1.5">
        <div className={cn('p-1 rounded-md shrink-0', style.tagBg)}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className={cn('text-[9px] font-mono font-bold tracking-wider uppercase', style.text)}>
          {style.badgeText}
        </span>
        {data.confidence && (
          <span className="ml-auto text-[9px] font-mono text-purple-300 bg-purple-900/50 px-1 py-0.2 rounded border border-purple-500/30">
            {Math.round(data.confidence * 100)}%
          </span>
        )}
      </div>

      <div className="font-mono text-xs font-semibold text-white truncate" title={data.label}>
        {data.label}
      </div>

      {data.sublabel && (
        <div className="text-[10px] text-soc-muted truncate mt-0.5" title={data.sublabel}>
          {data.sublabel}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2.5 h-2.5 bg-soc-cyan border-2 border-soc-bg"
      />
    </div>
  )
})
CustomGraphNode.displayName = 'CustomGraphNode'
