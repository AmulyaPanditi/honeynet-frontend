import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Shield,
  Terminal,
  Activity,
  ExternalLink,
  Info,
  Sparkles,
} from 'lucide-react'
import { useActors } from '../hooks'
import { ThreatActor } from '../types'
import { RiskBadge } from '../components/common/RiskBadge'
import { ScoreBar } from '../components/common/ScoreBar'
import { Modal } from '../components/common/Modal'
import {
  formatRelativeTime,
  getActorTypeBadge,
  getActorTypeLabel,
} from '../utils/formatters'
import { cn } from '../utils/cn'

export const ThreatActorsPage: React.FC = () => {
  const navigate = useNavigate()
  const { actors } = useActors()
  const [selectedActor, setSelectedActor] = useState<ThreatActor | null>(null)

  return (
    <div className="space-y-6">
      {/* Page Header with Attribution Disclaimer Alert */}
      <div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-soc-cyan" />
          <h1 className="text-xl font-bold text-white tracking-wide">
            Threat Actor Behavioral Profiles
          </h1>
        </div>
        <p className="text-xs text-soc-muted mt-1">
          Candidate threat actor classifications clustered by honeynet origin IP, session sequences, and TTP footprints
        </p>
      </div>

      {/* Attribution Disclaimer Banner */}
      <div className="bg-soc-card/70 border border-soc-borderLight rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-soc-cyan shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-white">Attribution Notice & Forensic Standards:</span>
          <p className="text-soc-muted leading-relaxed">
            Actor classifications reflect <strong className="text-slate-200">Behavioral Profiles</strong>,{' '}
            <strong className="text-slate-200">Candidate Actor Types</strong>, and{' '}
            <strong className="text-slate-200">Likely Next Actions</strong> derived from honeypot telemetry. They do not constitute definitive real-world legal or intelligence attribution.
          </p>
        </div>
      </div>

      {/* Actor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {actors.map((actor) => {
          const badge = getActorTypeBadge(actor.actor_type)
          return (
            <div
              key={actor.source_ip}
              onClick={() => setSelectedActor(actor)}
              className="bg-soc-card border border-soc-border hover:border-soc-cyan/50 rounded-xl p-5 space-y-4 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-glow-cyan group"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-cyan-300 group-hover:text-soc-cyan transition-colors">
                      {actor.source_ip}
                    </span>
                    {actor.country && (
                      <span className="text-[11px] font-mono text-soc-muted bg-soc-surface px-1.5 py-0.2 rounded border border-soc-border">
                        {actor.country}
                      </span>
                    )}
                  </div>
                  <div
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border mt-2',
                      badge.bg
                    )}
                  >
                    <span className={cn('w-1.5 h-1.5 rounded-full', badge.indicator)} />
                    <span>Candidate: {getActorTypeLabel(actor.actor_type)}</span>
                  </div>
                </div>
                <RiskBadge risk={actor.risk_score} showScore score={actor.risk_score} />
              </div>

              {/* Behavioral Tags */}
              <div className="flex flex-wrap gap-1.5">
                {actor.behavioral_tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono bg-soc-surface border border-soc-border px-2 py-0.5 rounded text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-soc-border/50">
                <div className="flex items-center gap-2 text-soc-muted">
                  <Shield className="w-3.5 h-3.5 text-soc-cyan" />
                  <span>
                    Sessions: <strong className="text-white">{actor.sessions_count}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-soc-muted">
                  <Terminal className="w-3.5 h-3.5 text-soc-cyan" />
                  <span>
                    Commands: <strong className="text-white">{actor.total_commands}</strong>
                  </span>
                </div>
              </div>

              {/* Top Techniques */}
              <div className="space-y-1.5 pt-2 border-t border-soc-border/50">
                <span className="text-[10px] font-mono uppercase tracking-wider text-soc-muted">
                  Top Observed ATT&CK Techniques:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {actor.top_techniques.map((t) => (
                    <span
                      key={t}
                      className="bg-soc-border/50 text-soc-cyan font-mono text-[10px] px-2 py-0.5 rounded"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Activity Window */}
              <div className="text-[11px] text-soc-muted/80 font-mono flex items-center justify-between pt-1">
                <span>First seen: {formatRelativeTime(actor.first_seen)}</span>
                <span>Last seen: {formatRelativeTime(actor.last_seen)}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Actor Detail Modal */}
      <Modal
        isOpen={!!selectedActor}
        onClose={() => setSelectedActor(null)}
        title={`Threat Actor Behavioral Profile: ${selectedActor?.source_ip || ''}`}
        subtitle="Forensic behavioral clustering and candidate pattern analysis"
        maxWidth="2xl"
      >
        {selectedActor && (
          <div className="space-y-6">
            {/* Top Stat Ribbon */}
            <div className="p-4 bg-soc-card rounded-xl border border-soc-border flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-soc-muted font-mono uppercase">Candidate Classification</span>
                <div className="text-sm font-bold text-white mt-0.5">
                  {getActorTypeLabel(selectedActor.actor_type)}
                </div>
                <div className="text-xs font-mono text-cyan-300 mt-1">
                  IP: {selectedActor.source_ip} ({selectedActor.country || 'Unknown'})
                </div>
              </div>
              <RiskBadge risk={selectedActor.risk_score} showScore score={selectedActor.risk_score} size="lg" />
            </div>

            {/* Behavioral Scores Breakdown */}
            {selectedActor.behavioral_scores && (
              <div className="bg-soc-card p-4 rounded-xl border border-soc-border space-y-3">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-soc-muted flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-soc-cyan" />
                  Cluster Behavioral Dimensions
                </h4>
                <div className="space-y-2.5">
                  <ScoreBar
                    label="Automation Tendency"
                    value={selectedActor.behavioral_scores.automation}
                    color="purple"
                  />
                  <ScoreBar
                    label="Reconnaissance & Discovery Intensity"
                    value={selectedActor.behavioral_scores.discovery}
                    color="cyan"
                  />
                  <ScoreBar
                    label="Persistence Drive"
                    value={selectedActor.behavioral_scores.persistence}
                    color="rose"
                  />
                  <ScoreBar
                    label="Defense Evasion"
                    value={selectedActor.behavioral_scores.evasion}
                    color="amber"
                  />
                </div>
              </div>
            )}

            {/* Predictions for this actor */}
            {selectedActor.predictions && selectedActor.predictions.length > 0 && (
              <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono text-purple-300 font-bold uppercase">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Projected Next Actions For Candidate Profile
                </div>
                {selectedActor.predictions.map((p) => (
                  <div key={p.next_technique_id} className="text-xs text-slate-200">
                    <span className="font-mono text-white font-semibold">{p.next_technique_id} ({p.next_technique_name}):</span>{' '}
                    <span className="text-soc-muted">{p.reason}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Linked Honeynet Sessions */}
            {selectedActor.recent_session_ids && (
              <div className="space-y-2">
                <span className="text-xs font-mono text-soc-muted uppercase">Linked Honeynet Sessions:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedActor.recent_session_ids.map((sid) => (
                    <button
                      key={sid}
                      onClick={() => {
                        navigate(`/sessions/${sid}`)
                        setSelectedActor(null)
                      }}
                      className="px-3 py-1.5 rounded-lg bg-soc-card hover:bg-soc-border border border-soc-border text-xs font-mono text-white inline-flex items-center gap-1.5 transition-all"
                    >
                      <span>Session #{sid}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-soc-cyan" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
