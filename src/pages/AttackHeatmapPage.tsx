import React, { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Grid,
  ExternalLink,
  Search,
  Terminal,
} from 'lucide-react'
import { useAttackHeatmap, useSessions } from '../hooks'
import { HeatmapItem } from '../types'
import { Drawer } from '../components/common/Drawer'
import { RiskBadge } from '../components/common/RiskBadge'
import { MITRE_TACTICS, getTacticStyle, getRiskColors } from '../utils/formatters'
import { cn } from '../utils/cn'

export const AttackHeatmapPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { heatmap } = useAttackHeatmap()
  const { sessions } = useSessions()

  const preselectedTechnique = searchParams.get('technique')

  const [selectedTechnique, setSelectedTechnique] = useState<HeatmapItem | null>(() => {
    if (preselectedTechnique) {
      return heatmap.find((h) => h.technique_id === preselectedTechnique) || null
    }
    return null
  })

  // Local filter states
  const [selectedRisk, setSelectedRisk] = useState<string>('all')
  const [selectedSession, setSelectedSession] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [colorMode, setColorMode] = useState<'frequency' | 'risk'>('frequency')

  // Group heatmap items by MITRE tactic
  const tacticsMatrix = useMemo(() => {
    const matrix: Record<string, HeatmapItem[]> = {}
    MITRE_TACTICS.forEach((tactic) => {
      matrix[tactic] = []
    })

    heatmap.forEach((item) => {
      // Filter by risk
      if (selectedRisk !== 'all' && item.risk_level !== selectedRisk) return

      // Filter by session
      if (
        selectedSession !== 'all' &&
        item.associated_sessions &&
        !item.associated_sessions.includes(selectedSession)
      ) {
        return
      }

      // Filter by search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const match =
          item.technique_id.toLowerCase().includes(q) ||
          item.technique_name.toLowerCase().includes(q) ||
          item.tactic.toLowerCase().includes(q)
        if (!match) return
      }

      if (matrix[item.tactic]) {
        matrix[item.tactic].push(item)
      } else {
        // Fallback tactic grouping
        if (!matrix['Discovery']) matrix['Discovery'] = []
        matrix['Discovery'].push(item)
      }
    })

    return matrix
  }, [heatmap, selectedRisk, selectedSession, searchQuery])

  // Get color intensity for cell
  const getCellIntensityStyle = (item: HeatmapItem) => {
    if (colorMode === 'risk') {
      const riskCol = getRiskColors(item.risk_level)
      return {
        bg: riskCol.bg,
        border: riskCol.border,
        text: riskCol.text,
      }
    }

    // Frequency-based color intensity
    const maxCount = Math.max(...heatmap.map((h) => h.count), 1)
    const ratio = item.count / maxCount

    if (ratio > 0.6) {
      return {
        bg: 'bg-rose-500/25',
        border: 'border-rose-500/50 shadow-glow-rose',
        text: 'text-rose-300 font-bold',
      }
    }
    if (ratio > 0.3) {
      return {
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/40',
        text: 'text-amber-300 font-semibold',
      }
    }
    return {
      bg: 'bg-cyan-500/15',
      border: 'border-cyan-500/30',
      text: 'text-cyan-300 font-medium',
    }
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Grid className="w-5 h-5 text-soc-cyan" />
            MITRE ATT&CK Matrix & Heat Map
          </h1>
          <p className="text-xs text-soc-muted mt-1">
            Enterprise MITRE ATT&CK tactics matrix populated by honeynet observations and frequency scoring
          </p>
        </div>

        {/* Color mode toggle */}
        <div className="flex items-center gap-2 bg-soc-card p-1 rounded-lg border border-soc-border text-xs font-mono">
          <button
            onClick={() => setColorMode('frequency')}
            className={cn(
              'px-2.5 py-1 rounded transition-all',
              colorMode === 'frequency'
                ? 'bg-soc-cyan text-black font-bold'
                : 'text-soc-muted hover:text-white'
            )}
          >
            Frequency Intensity
          </button>
          <button
            onClick={() => setColorMode('risk')}
            className={cn(
              'px-2.5 py-1 rounded transition-all',
              colorMode === 'risk'
                ? 'bg-rose-500 text-white font-bold'
                : 'text-soc-muted hover:text-white'
            )}
          >
            Risk Severity
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-soc-card border border-soc-border rounded-xl p-4 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative min-w-[200px]">
          <Search className="w-4 h-4 text-soc-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search technique (e.g. Brute Force)..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-soc-surface border border-soc-border text-slate-200 placeholder-soc-muted/60 focus:outline-none focus:border-soc-cyan font-mono"
          />
        </div>

        {/* Risk Filter */}
        <select
          value={selectedRisk}
          onChange={(e) => setSelectedRisk(e.target.value)}
          aria-label="Filter by Risk Severity"
          className="bg-soc-surface border border-soc-border rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-soc-cyan font-mono"
        >
          <option value="all">All Risk Levels</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Session Filter */}
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          aria-label="Filter by Honeynet Session"
          className="bg-soc-surface border border-soc-border rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-soc-cyan font-mono"
        >
          <option value="all">All Sessions</option>
          {sessions.map((s) => (
            <option key={s.session_id} value={s.session_id}>
              Session #{s.session_id} ({s.source_ip})
            </option>
          ))}
        </select>

        {(selectedRisk !== 'all' || selectedSession !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedRisk('all')
              setSelectedSession('all')
              setSearchQuery('')
            }}
            className="text-xs text-rose-400 hover:underline font-mono ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* MITRE ATT&CK Tactics Matrix Grid */}
      <div className="bg-soc-card border border-soc-border rounded-xl p-4 overflow-x-auto shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7 gap-3 min-w-[1100px]">
          {MITRE_TACTICS.map((tactic) => {
            const items = tacticsMatrix[tactic] || []
            const tacticStyle = getTacticStyle(tactic)
            return (
              <div
                key={tactic}
                className="bg-soc-surface/60 rounded-xl border border-soc-border/60 flex flex-col p-2.5 space-y-2"
              >
                {/* Column Tactic Header */}
                <div className="pb-2 border-b border-soc-border/40">
                  <span
                    className={cn(
                      'text-[10px] font-mono font-bold uppercase tracking-wider block truncate',
                      tacticStyle.text
                    )}
                    title={tactic}
                  >
                    {tactic}
                  </span>
                  <span className="text-[10px] font-mono text-soc-muted">
                    {items.length} observed
                  </span>
                </div>

                {/* Column Items */}
                <div className="space-y-1.5 flex-1">
                  {items.length > 0 ? (
                    items.map((item) => {
                      const style = getCellIntensityStyle(item)
                      return (
                        <div
                          key={item.technique_id}
                          onClick={() => setSelectedTechnique(item)}
                          className={cn(
                            'p-2 rounded-lg border text-xs cursor-pointer transition-all hover:scale-[1.02]',
                            style.bg,
                            style.border,
                            selectedTechnique?.technique_id === item.technique_id &&
                              'ring-2 ring-soc-cyan'
                          )}
                        >
                          <div className="flex items-center justify-between font-mono">
                            <span className={cn('font-bold', style.text)}>
                              {item.technique_id}
                            </span>
                            <span className="text-[10px] bg-black/40 px-1.5 py-0.2 rounded text-slate-300">
                              {item.count}×
                            </span>
                          </div>
                          <p className="text-[11px] text-white/90 truncate mt-1">
                            {item.technique_name}
                          </p>
                          <div className="mt-1 flex items-center justify-between text-[10px]">
                            <span className="capitalize text-soc-muted">
                              {item.risk_level}
                            </span>
                            {item.confidence && (
                              <span className="text-soc-cyan font-mono">
                                {Math.round(item.confidence * 100)}%
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="h-20 flex items-center justify-center text-[10px] text-soc-muted/40 font-mono italic">
                      No captures
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Technique Drilldown Drawer */}
      <Drawer
        isOpen={!!selectedTechnique}
        onClose={() => setSelectedTechnique(null)}
        title={`Technique: ${selectedTechnique?.technique_id || ''}`}
        subtitle={selectedTechnique?.technique_name}
        width="lg"
      >
        {selectedTechnique && (
          <div className="space-y-6">
            {/* Header pill */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-soc-card rounded-lg border border-soc-border">
              <div className="flex items-center gap-2">
                <RiskBadge risk={selectedTechnique.risk_level} />
                <span className="text-xs text-soc-cyan font-mono">
                  {selectedTechnique.count} Total Honeynet Detections
                </span>
              </div>
              {selectedTechnique.confidence && (
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  {Math.round(selectedTechnique.confidence * 100)}% Mapping Confidence
                </span>
              )}
            </div>

            {/* Technique Description */}
            <div className="p-4 bg-soc-card rounded-lg border border-soc-border space-y-1.5">
              <span className="text-[10px] font-mono text-soc-muted uppercase tracking-wider">
                MITRE ATT&CK Description
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedTechnique.description ||
                  'No extended MITRE description provided for this technique.'}
              </p>
            </div>

            {/* Observed Commands and Payloads */}
            {selectedTechnique.sample_commands && selectedTechnique.sample_commands.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-mono text-soc-cyan uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-4 h-4" />
                  Observed Honeynet Execution Commands
                </span>
                <div className="space-y-1.5">
                  {selectedTechnique.sample_commands.map((cmd, i) => (
                    <div
                      key={i}
                      className="bg-black/70 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-cyan-200 select-all"
                    >
                      <span className="text-slate-500 mr-2">$</span>
                      {cmd}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Associated Honeypot Sessions */}
            {selectedTechnique.associated_sessions && selectedTechnique.associated_sessions.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-mono text-soc-muted uppercase tracking-wider">
                  Associated Intruder Sessions ({selectedTechnique.associated_sessions.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedTechnique.associated_sessions.map((sid) => (
                    <button
                      key={sid}
                      onClick={() => {
                        navigate(`/sessions/${sid}`)
                        setSelectedTechnique(null)
                      }}
                      className="px-2.5 py-1 rounded bg-soc-card hover:bg-soc-border border border-soc-border text-xs font-mono text-white inline-flex items-center gap-1 transition-all"
                    >
                      <span>Session #{sid}</span>
                      <ExternalLink className="w-3 h-3 text-soc-cyan" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-soc-border flex items-center justify-between">
              <a
                href={`https://attack.mitre.org/techniques/${selectedTechnique.technique_id.replace(/\./g, '/')}/`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-soc-cyan hover:underline font-mono inline-flex items-center gap-1"
              >
                View on Official MITRE ATT&CK Framework <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
