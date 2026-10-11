import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  AlertCircle,
  ExternalLink,
  Terminal,
  Network,
} from 'lucide-react'
import { usePredictions } from '../hooks'
import { ScoreBar } from '../components/common/ScoreBar'
import { TechniqueBadge } from '../components/common/TechniqueBadge'
import { RiskBadge } from '../components/common/RiskBadge'
import { getActorTypeLabel } from '../utils/formatters'

export const PredictionsPage: React.FC = () => {
  const navigate = useNavigate()
  const { predictions: sessionPredictions } = usePredictions()

  // Local filter states
  const [minConfidence, setMinConfidence] = useState<number>(0.4)
  const [filterActorType, setFilterActorType] = useState<string>('all')
  const [techniqueQuery, setTechniqueQuery] = useState<string>('')

  // Filtered prediction groups
  const filteredSessions = useMemo(() => {
    return sessionPredictions
      .filter((s) => {
        if (filterActorType !== 'all' && s.actorType !== filterActorType) {
          return false
        }
        return true
      })
      .map((s) => {
        const filteredPreds = s.predictions.filter((p) => {
          if (p.confidence < minConfidence) return false
          if (
            techniqueQuery &&
            !p.next_technique_id.toLowerCase().includes(techniqueQuery.toLowerCase()) &&
            !p.next_technique_name.toLowerCase().includes(techniqueQuery.toLowerCase())
          ) {
            return false
          }
          return true
        })

        return {
          ...s,
          predictions: filteredPreds,
        }
      })
      .filter((s) => s.predictions.length > 0)
  }, [sessionPredictions, minConfidence, filterActorType, techniqueQuery])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h1 className="text-xl font-bold text-white tracking-wide">
            Predictive MITRE ATT&CK Causal Analysis
          </h1>
        </div>
        <p className="text-xs text-soc-muted mt-1">
          Probabilistic trajectory forecasting projecting next likely adversary actions based on observed attack sequences
        </p>
      </div>

      {/* Mandatory Regulatory / Forensics Disclaimer */}
      <div className="bg-purple-950/20 border border-purple-500/40 rounded-xl p-4 flex items-start gap-3 shadow-glow-purple text-xs">
        <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-purple-300">
            Probabilistic Causal Intelligence Disclaimer:
          </span>
          <p className="text-slate-300 leading-relaxed">
            “Predictions are probabilistic and based on observed behavioral sequences. They are decision-support signals, not certainty.”
            Security analysts should validate projections against host telemetry and volatile artifacts before executing defensive containment.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-soc-card border border-soc-border rounded-xl p-4 flex flex-wrap items-center gap-4 text-xs">
        {/* Min Confidence Slider */}
        <div className="flex items-center gap-2 font-mono">
          <span className="text-soc-muted">Min Confidence:</span>
          <input
            type="range"
            min="0.2"
            max="0.9"
            step="0.05"
            value={minConfidence}
            onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
            className="accent-soc-cyan cursor-pointer w-28"
          />
          <span className="text-soc-cyan font-bold w-10">
            {Math.round(minConfidence * 100)}%
          </span>
        </div>

        {/* Actor Type Filter */}
        <select
          value={filterActorType}
          onChange={(e) => setFilterActorType(e.target.value)}
          aria-label="Filter Predictions by Actor Type"
          className="bg-soc-surface border border-soc-border rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-soc-cyan font-mono"
        >
          <option value="all">All Actor Types</option>
          <option value="interactive_attacker">Interactive Attacker</option>
          <option value="botnet_dropper">Botnet Dropper</option>
          <option value="persistence_attempt">Persistence Operator</option>
        </select>

        {/* Predicted Technique Search */}
        <input
          type="text"
          value={techniqueQuery}
          onChange={(e) => setTechniqueQuery(e.target.value)}
          placeholder="Search predicted technique (e.g. T1071)..."
          className="bg-soc-surface border border-soc-border rounded-lg px-3 py-1.5 text-slate-200 placeholder-soc-muted/60 focus:outline-none focus:border-soc-cyan font-mono w-64"
        />

        {(minConfidence > 0.4 || filterActorType !== 'all' || techniqueQuery) && (
          <button
            onClick={() => {
              setMinConfidence(0.4)
              setFilterActorType('all')
              setTechniqueQuery('')
            }}
            className="text-xs text-rose-400 hover:underline font-mono ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Predictive Sessions List */}
      <div className="space-y-4">
        {filteredSessions.map((session) => (
          <div
            key={session.sessionId}
            className="bg-soc-card border border-soc-border rounded-xl p-5 space-y-4"
          >
            {/* Session Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-soc-border/60">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-soc-cyan animate-pulse" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-white">
                      Session #{session.sessionId}
                    </span>
                    <span className="font-mono text-cyan-300 font-medium">
                      ({session.sourceIp})
                    </span>
                    <RiskBadge risk={session.riskScore} />
                  </div>
                  <span className="text-[11px] text-soc-muted">
                    Actor Profile: {getActorTypeLabel(session.actorType)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/graph?session=${session.sessionId}`)}
                  className="px-2.5 py-1 rounded bg-soc-cyan/15 text-soc-cyan border border-soc-cyan/30 hover:bg-soc-cyan/25 transition-all font-mono text-xs inline-flex items-center gap-1"
                >
                  <Network className="w-3.5 h-3.5" />
                  Graph View
                </button>
                <button
                  onClick={() => navigate(`/sessions/${session.sessionId}`)}
                  className="px-2.5 py-1 rounded bg-soc-card hover:bg-soc-border border border-soc-border text-white transition-all font-mono text-xs inline-flex items-center gap-1"
                >
                  <span>Details</span>
                  <ExternalLink className="w-3.5 h-3.5 text-soc-muted" />
                </button>
              </div>
            </div>

            {/* Current Sequence Footprint */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-soc-muted font-mono uppercase text-[11px]">
                Observed Sequence Footprint:
              </span>
              {session.currentTechniques.map((t) => (
                <TechniqueBadge key={t} techniqueId={t} />
              ))}
            </div>

            {/* Predicted Techniques Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {session.predictions.map((pred) => (
                <div
                  key={pred.next_technique_id}
                  className="bg-soc-surface p-4 rounded-xl border border-purple-500/30 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white text-sm">
                        {pred.next_technique_id}
                      </span>
                      {pred.tactic && (
                        <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                          {pred.tactic}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-xs text-purple-200">
                      {pred.next_technique_name}
                    </p>
                    <p className="text-xs text-soc-muted leading-relaxed">
                      {pred.reason}
                    </p>
                  </div>

                  <ScoreBar
                    label="Probability Score"
                    value={pred.confidence}
                    color="purple"
                  />

                  {pred.evidence_commands && pred.evidence_commands.length > 0 && (
                    <div className="pt-2 border-t border-soc-border/40 space-y-1">
                      <span className="text-[10px] font-mono text-soc-cyan flex items-center gap-1">
                        <Terminal className="w-3 h-3" />
                        Triggering Sequence Evidence:
                      </span>
                      <div className="font-mono text-[11px] text-slate-300 bg-black/60 p-1.5 rounded truncate">
                        {pred.evidence_commands[0]}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
