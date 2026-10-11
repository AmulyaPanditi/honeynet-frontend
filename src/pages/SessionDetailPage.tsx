import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Network,
  Terminal,
  Activity,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { useSessionDetail } from '../hooks'
import { RiskBadge } from '../components/common/RiskBadge'
import { TechniqueBadge } from '../components/common/TechniqueBadge'
import { TimelineItem } from '../components/common/TimelineItem'
import { ScoreBar } from '../components/common/ScoreBar'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { EmptyState } from '../components/common/EmptyState'
import {
  formatDateTime,
  formatDuration,
  getActorTypeBadge,
  getActorTypeLabel,
  getRiskColors,
} from '../utils/formatters'
import { cn } from '../utils/cn'

export const SessionDetailPage: React.FC = () => {
  const { sessionId = 'abc123' } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { session, loading, error } = useSessionDetail(sessionId)

  const riskColors = useMemo(() => {
    return session ? getRiskColors(session.risk_score) : getRiskColors(50)
  }, [session])

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={3} />
        <LoadingSkeleton type="table" count={5} />
      </div>
    )
  }

  if (error || !session) {
    return (
      <EmptyState
        title="Session Not Found"
        description={`Could not locate telemetry for session "${sessionId}".`}
        actionText="Back to Sessions"
        onAction={() => navigate('/sessions')}
      />
    )
  }

  const actorBadge = getActorTypeBadge(session.actor_type)

  return (
    <div className="space-y-6">
      {/* Top Navigation & Session Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-soc-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/sessions')}
            className="p-2 rounded-lg bg-soc-card border border-soc-border hover:border-soc-borderLight text-soc-muted hover:text-white transition-all"
            title="Back to Sessions"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-xl font-bold text-white tracking-wide font-mono">
                Session #{session.session_id}
              </h1>
              <RiskBadge risk={session.risk_score} showScore score={session.risk_score} />
            </div>
            <p className="text-xs text-soc-muted mt-0.5">
              Source Attacker: <strong className="text-cyan-300 font-mono">{session.source_ip}</strong>
              {session.country && ` (${session.city ? `${session.city}, ` : ''}${session.country})`}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/graph?session=${session.session_id}`)}
            className="px-3.5 py-1.5 rounded-lg bg-soc-cyan/15 text-soc-cyan border border-soc-cyan/40 hover:bg-soc-cyan/25 font-mono text-xs font-semibold flex items-center gap-1.5 transition-all shadow-glow-cyan"
          >
            <Network className="w-4 h-4" />
            Explore Causal Attack Graph
          </button>
        </div>
      </div>

      {/* 3-Column Core SOC Jury Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================================================
            COLUMN 1: Left Column (Session Summary & Risk Gauge) - 3.5 cols
            ========================================================================= */}
        <div className="lg:col-span-3 xl:col-span-3 space-y-5">
          {/* Risk Gauge Card */}
          <div className="bg-soc-card border border-soc-border rounded-xl p-5 relative overflow-hidden">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-soc-muted font-mono mb-3">
              Autonomous Risk Assessment
            </h3>
            <div className="flex flex-col items-center justify-center my-2">
              <div
                className={cn(
                  'w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center relative shadow-lg',
                  riskColors.border,
                  riskColors.bg
                )}
              >
                <span className={cn('text-3xl font-extrabold font-mono', riskColors.text)}>
                  {session.risk_score}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-soc-muted">
                  / 100
                </span>
              </div>
              <span className="mt-3 text-xs font-mono font-bold uppercase tracking-wider text-white">
                {session.risk_score >= 80 ? 'CRITICAL THREAT' : session.risk_score >= 60 ? 'HIGH RISK' : 'MEDIUM RISK'}
              </span>
            </div>

            {/* Candidate Actor Type badge */}
            <div className="mt-4 pt-4 border-t border-soc-border/60">
              <span className="text-[10px] font-mono uppercase tracking-wider text-soc-muted">
                Candidate Actor Profile
              </span>
              <div
                className={cn(
                  'mt-1.5 flex items-center gap-2 p-2 rounded-lg border text-xs font-medium',
                  actorBadge.bg
                )}
              >
                <span className={cn('w-2 h-2 rounded-full', actorBadge.indicator)} />
                <span className="font-semibold">{getActorTypeLabel(session.actor_type)}</span>
              </div>
            </div>
          </div>

          {/* Session Metadata Card */}
          <div className="bg-soc-card border border-soc-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-soc-muted font-mono">
              Session Telemetry Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-soc-border/40">
                <span className="text-soc-muted">Source IP</span>
                <span className="font-mono text-cyan-300 font-bold">{session.source_ip}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-soc-border/40">
                <span className="text-soc-muted">Session ID</span>
                <span className="font-mono text-white bg-soc-surface px-1.5 py-0.5 rounded border border-soc-border/40 text-[11px]">
                  {session.session_id}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-soc-border/40">
                <span className="text-soc-muted">Start Time</span>
                <span className="font-mono text-white text-[11px]">{formatDateTime(session.start_time)}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-soc-border/40">
                <span className="text-soc-muted">Session Duration</span>
                <span className="font-mono text-white">{formatDuration(session.duration_seconds)}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-soc-border/40">
                <span className="text-soc-muted">Login Attempts</span>
                <span className="font-mono text-white font-bold">{session.login_attempts}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-soc-border/40">
                <span className="text-soc-muted">Authentication</span>
                <span
                  className={cn(
                    'font-mono font-bold text-[11px] px-1.5 py-0.5 rounded',
                    session.successful_login
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                  )}
                >
                  {session.successful_login ? 'BREACH (Root Auth)' : 'REJECTED'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-soc-border/40">
                <span className="text-soc-muted">Commands Executed</span>
                <span className="font-mono text-white font-bold">{session.commands_executed}</span>
              </div>

              {session.asn && (
                <div className="pt-1">
                  <span className="text-[10px] text-soc-muted font-mono uppercase">Network ASN</span>
                  <p className="text-[11px] font-mono text-slate-300 truncate mt-0.5" title={session.asn}>
                    {session.asn}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            COLUMN 2: Middle Column (Chronological Attack Timeline) - 5 cols
            ========================================================================= */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-4">
          <div className="bg-soc-card border border-soc-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-soc-border">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-soc-cyan" />
                <h3 className="text-sm font-semibold text-white tracking-wide">
                  Chronological Attack Timeline
                </h3>
              </div>
              <span className="text-xs font-mono text-soc-muted">
                {session.events.length} captured events
              </span>
            </div>

            {/* Event Timeline Stream */}
            <div className="mt-4">
              {session.events.length > 0 ? (
                session.events.map((evt, idx) => {
                  const mapping = session.technique_mappings.find(
                    (m) => m.event_id === evt.event_id
                  )
                  return (
                    <TimelineItem
                      key={evt.event_id}
                      event={evt}
                      mapping={mapping}
                      isLast={idx === session.events.length - 1}
                    />
                  )
                })
              ) : (
                <EmptyState
                  title="No Events Captured"
                  description="No events are logged yet for this honeypot session."
                />
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            COLUMN 3: Right Column (Behavioral Profile, Predictions, Actions) - 4 cols
            ========================================================================= */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-5">
          {/* Behavioral Profile Card */}
          <div className="bg-soc-card border border-soc-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-soc-muted font-mono flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-soc-cyan" />
                Behavioral Profile Metrics
              </h3>
              <span className="text-[10px] font-mono text-soc-cyan bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/30">
                AI PROFILED
              </span>
            </div>

            <div className="space-y-3">
              <ScoreBar
                label="Automation Score"
                value={session.behavioral_profile.automation_score}
                color={session.behavioral_profile.automation_score > 0.6 ? 'purple' : 'cyan'}
                description={
                  session.behavioral_profile.automation_score > 0.6
                    ? 'Automated high-velocity scripting detected'
                    : 'Human/interactive keyboard latency observed'
                }
              />
              <ScoreBar
                label="Discovery Depth"
                value={session.behavioral_profile.discovery_score}
                color="cyan"
                description="Aggressive OS, host identity, and file-system reconnaissance"
              />
              <ScoreBar
                label="Persistence Score"
                value={session.behavioral_profile.persistence_score}
                color="rose"
                description="Crontab manipulation or run-key persistence established"
              />
              <ScoreBar
                label="Credential Activity"
                value={session.behavioral_profile.credential_activity_score}
                color="amber"
                description="Wordlist dictionary spraying and /etc/passwd harvesting"
              />
            </div>

            {/* Diversity & Depth stats */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-soc-border/50 text-center">
              <div className="p-2 rounded bg-soc-surface border border-soc-border/40">
                <span className="text-[10px] text-soc-muted font-mono uppercase">Command Diversity</span>
                <div className="text-base font-bold font-mono text-white mt-0.5">
                  {session.behavioral_profile.command_diversity} unique
                </div>
              </div>
              <div className="p-2 rounded bg-soc-surface border border-soc-border/40">
                <span className="text-[10px] text-soc-muted font-mono uppercase">Session Depth</span>
                <div className="text-base font-bold font-mono text-white mt-0.5">
                  Level {session.behavioral_profile.session_depth}
                </div>
              </div>
            </div>
          </div>

          {/* ATT&CK Techniques Mapped */}
          <div className="bg-soc-card border border-soc-border rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-soc-muted font-mono">
              Observed MITRE Techniques ({session.techniques.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {session.technique_mappings.map((m) => (
                <TechniqueBadge
                  key={m.technique_id}
                  techniqueId={m.technique_id}
                  techniqueName={m.technique_name}
                  tactic={m.tactic}
                  confidence={m.confidence}
                  clickable
                  onClick={() => navigate(`/heatmap?technique=${m.technique_id}`)}
                />
              ))}
            </div>
          </div>

          {/* Predicted Next Actions Card */}
          <div className="bg-soc-card border border-purple-500/40 rounded-xl p-5 space-y-3 shadow-glow-purple">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-300 font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Probabilistic Next Actions
              </h3>
              <span className="text-[10px] text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded font-mono border border-purple-500/30">
                CAUSAL AI
              </span>
            </div>

            <div className="space-y-3">
              {session.predictions.map((pred) => (
                <div
                  key={pred.next_technique_id}
                  className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-lg space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white">
                      {pred.next_technique_id}
                    </span>
                    <span className="font-mono text-purple-300 font-semibold bg-purple-900/40 px-1.5 py-0.5 rounded text-[11px]">
                      {Math.round(pred.confidence * 100)}% Likelihood
                    </span>
                  </div>
                  <p className="font-medium text-purple-200">
                    {pred.next_technique_name}
                  </p>
                  <p className="text-[11px] text-soc-muted leading-relaxed">
                    {pred.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Analyst Actions */}
          {session.recommended_actions && session.recommended_actions.length > 0 && (
            <div className="bg-soc-card border border-soc-border rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Recommended Analyst Playbook
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {session.recommended_actions.map((act, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 select-none">▸</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
