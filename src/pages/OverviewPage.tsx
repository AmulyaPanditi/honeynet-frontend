import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldAlert,
  Users,
  Terminal,
  KeyRound,
  AlertTriangle,
  Grid,
  Activity,
  ArrowRight,
  Network,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useSessions, useLiveEvents, useAttackHeatmap } from '../hooks'
import { useDemo } from '../context/DemoContext'
import { KpiCard } from '../components/common/KpiCard'
import { RiskBadge } from '../components/common/RiskBadge'
import { TechniqueBadge } from '../components/common/TechniqueBadge'
import { formatRelativeTime, getActorTypeBadge, getActorTypeLabel } from '../utils/formatters'
import { cn } from '../utils/cn'

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate()
  const { sessions } = useSessions()
  const { events } = useLiveEvents()
  const { heatmap } = useAttackHeatmap()
  const { globalSearch, currentStep, demoMode } = useDemo()

  // Calculate high-level KPIs
  const kpis = useMemo(() => {
    const active = sessions.filter((s) => s.status === 'active').length
    const uniqueIps = new Set(sessions.map((s) => s.source_ip)).size
    const totalCommands = sessions.reduce((acc, s) => acc + s.commands_executed, 0)
    const totalLogins = sessions.reduce((acc, s) => acc + s.login_attempts, 0)
    const highRisk = sessions.filter((s) => s.risk_score >= 70).length
    const uniqueTechniques = new Set(
      sessions.flatMap((s) => s.techniques)
    ).size

    return {
      activeSessions: active,
      uniqueIps,
      totalCommands,
      totalLogins,
      highRisk,
      uniqueTechniques,
    }
  }, [sessions])

  // Filter sessions by global search if typed
  const filteredSessions = useMemo(() => {
    if (!globalSearch) return sessions
    const q = globalSearch.toLowerCase()
    return sessions.filter(
      (s) =>
        s.source_ip.toLowerCase().includes(q) ||
        s.session_id.toLowerCase().includes(q) ||
        s.actor_type.toLowerCase().includes(q)
    )
  }, [sessions, globalSearch])

  // Chart data: 24h attack timeline simulation
  const activityData = [
    { time: '00:00', attacks: 12, logins: 45, commands: 8 },
    { time: '04:00', attacks: 19, logins: 78, commands: 14 },
    { time: '08:00', attacks: 34, logins: 130, commands: 26 },
    { time: '12:00', attacks: 58, logins: 240, commands: 49 },
    { time: '16:00', attacks: 42, logins: 190, commands: 38 },
    { time: '20:00', attacks: 67, logins: 290, commands: 52 },
    { time: 'Now', attacks: 78, logins: 340, commands: 61 },
  ]

  // Top 5 techniques for bar chart
  const topTechniquesData = useMemo(() => {
    return [...heatmap]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((t) => ({
        name: t.technique_id,
        fullName: t.technique_name,
        count: t.count,
      }))
  }, [heatmap])

  // Risk distribution for donut chart
  const riskDistributionData = useMemo(() => {
    const critical = sessions.filter((s) => s.risk_score >= 80).length
    const high = sessions.filter((s) => s.risk_score >= 60 && s.risk_score < 80).length
    const medium = sessions.filter((s) => s.risk_score >= 35 && s.risk_score < 60).length
    const low = sessions.filter((s) => s.risk_score < 35).length

    return [
      { name: 'Critical (80+)', value: critical || 2, color: '#f43f5e' },
      { name: 'High (60-79)', value: high || 2, color: '#ef4444' },
      { name: 'Medium (35-59)', value: medium || 1, color: '#f59e0b' },
      { name: 'Low (0-34)', value: low || 1, color: '#10b981' },
    ]
  }, [sessions])

  return (
    <div className="space-y-6">
      {/* Demo announcement header if demo active */}
      {demoMode && (
        <div className="bg-gradient-to-r from-purple-950/40 via-soc-card to-cyan-950/40 border border-purple-500/30 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-soc-cyan animate-ping" />
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Live Attack Simulation: <span className="text-soc-cyan">{currentStep.title}</span>
              </h2>
              <p className="text-xs text-soc-muted mt-0.5">{currentStep.narrative}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/graph?session=${currentStep.sessionId}`)}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-soc-cyan/15 text-soc-cyan border border-soc-cyan/40 hover:bg-soc-cyan/25 flex items-center gap-1.5 transition-all"
          >
            <Network className="w-3.5 h-3.5" />
            View Causal Graph
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Active Sessions"
          value={kpis.activeSessions}
          subtitle="Real-time honeynet captures"
          icon={Activity}
          variant="cyan"
          trend={{ value: '+2 active', isUp: true }}
          onClick={() => navigate('/sessions')}
        />
        <KpiCard
          title="Attacker IPs"
          value={kpis.uniqueIps}
          subtitle="Distinct perimeter hosts"
          icon={Users}
          variant="blue"
          onClick={() => navigate('/actors')}
        />
        <KpiCard
          title="Commands Executed"
          value={kpis.totalCommands}
          subtitle="Shell actions intercepted"
          icon={Terminal}
          variant="amber"
          trend={{ value: '+8 new', isUp: true }}
          onClick={() => navigate('/telemetry')}
        />
        <KpiCard
          title="Login Attempts"
          value={kpis.totalLogins}
          subtitle="SSH dictionary & spray"
          icon={KeyRound}
          variant="rose"
        />
        <KpiCard
          title="High-Risk Sessions"
          value={kpis.highRisk}
          subtitle="Risk score >= 70"
          icon={AlertTriangle}
          variant="rose"
          onClick={() => navigate('/sessions')}
        />
        <KpiCard
          title="ATT&CK Techniques"
          value={kpis.uniqueTechniques}
          subtitle="MITRE matrix mappings"
          icon={Grid}
          variant="purple"
          onClick={() => navigate('/heatmap')}
        />
      </div>

      {/* Charts Row: Activity Timeline + Top ATT&CK + Risk Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Area Chart */}
        <div className="lg:col-span-2 rounded-xl bg-soc-card border border-soc-border p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Honeynet Ingress Velocity & Attack Waves
              </h2>
              <p className="text-xs text-soc-muted">
                Telemetry events, dictionary authentication, and shell commands over 24h
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Ingress
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                Auth Attempts
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d131f',
                    borderColor: '#1f293d',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="attacks"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#cyanGrad)"
                  name="Attack Events"
                />
                <Area
                  type="monotone"
                  dataKey="logins"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#roseGrad)"
                  name="Auth Probes"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Donut */}
        <div className="rounded-xl bg-soc-card border border-soc-border p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">
              Session Risk Profiling
            </h2>
            <p className="text-xs text-soc-muted">
              AI behavioral severity distribution
            </p>
          </div>
          <div className="h-48 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d131f',
                    borderColor: '#1f293d',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {riskDistributionData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-soc-muted text-[11px] truncate">{d.name}:</span>
                <span className="font-bold text-white ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Row: Top ATT&CK Techniques Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-xl bg-soc-card border border-soc-border p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Top Observed Techniques
              </h2>
              <button
                onClick={() => navigate('/heatmap')}
                className="text-xs text-soc-cyan hover:underline font-mono"
              >
                Heat Map →
              </button>
            </div>
            <p className="text-xs text-soc-muted mt-0.5">
              Highest frequency MITRE techniques
            </p>
          </div>
          <div className="h-56 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topTechniquesData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <XAxis type="number" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#06b6d4"
                  fontSize={11}
                  tickLine={false}
                  fontFamily="monospace"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d131f',
                    borderColor: '#1f293d',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                  formatter={(value: any, _: any, item: any) => [
                    `${value} hits`,
                    item.payload.fullName,
                  ]}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Live Feed Preview */}
        <div className="lg:col-span-2 rounded-xl bg-soc-card border border-soc-border p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-soc-cyan animate-pulse" />
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Live Telemetry Ingress Feed
              </h2>
            </div>
            <button
              onClick={() => navigate('/telemetry')}
              className="text-xs text-soc-cyan hover:underline font-mono flex items-center gap-1"
            >
              Full Stream <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-soc-border/40 overflow-hidden">
            {events.slice(0, 5).map((evt) => (
              <div
                key={evt.event_id}
                onClick={() => navigate(`/sessions/${evt.session_id}`)}
                className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-soc-cardHover/50 px-2 rounded cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-soc-muted text-[11px] whitespace-nowrap">
                    {formatRelativeTime(evt.timestamp)}
                  </span>
                  <span className="font-mono text-cyan-300 font-semibold whitespace-nowrap">
                    {evt.source_ip}
                  </span>
                  <span className="font-mono text-slate-300 bg-black/40 px-2 py-0.5 rounded truncate max-w-xs md:max-w-md border border-white/5">
                    {evt.command || evt.username || evt.file_name || evt.raw_payload}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {evt.technique_id && (
                    <TechniqueBadge techniqueId={evt.technique_id} />
                  )}
                  <RiskBadge risk={evt.risk_level} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Attack Sessions Table */}
      <div className="rounded-xl bg-soc-card border border-soc-border overflow-hidden">
        <div className="p-5 border-b border-soc-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-soc-cyan" />
              Active Honeynet Attack Sessions
            </h2>
            <p className="text-xs text-soc-muted mt-0.5">
              Captured Cowrie interactive SSH and automated payload drop sessions
            </p>
          </div>
          <button
            onClick={() => navigate('/sessions')}
            className="text-xs text-soc-cyan hover:underline font-mono"
          >
            All Sessions ({sessions.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-soc-surface/70 text-soc-muted uppercase tracking-wider font-mono text-[11px] border-b border-soc-border">
              <tr>
                <th className="py-3 px-4">Session ID</th>
                <th className="py-3 px-4">Source IP & Location</th>
                <th className="py-3 px-4">Candidate Actor Type</th>
                <th className="py-3 px-4">Logins</th>
                <th className="py-3 px-4">Commands</th>
                <th className="py-3 px-4">Observed ATT&CK</th>
                <th className="py-3 px-4">Risk Gauge</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border/40">
              {filteredSessions.slice(0, 5).map((session) => {
                const actorBadge = getActorTypeBadge(session.actor_type)
                return (
                  <tr
                    key={session.session_id}
                    onClick={() => navigate(`/sessions/${session.session_id}`)}
                    className="hover:bg-soc-cardHover/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-white flex items-center gap-2">
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full',
                          session.status === 'active'
                            ? 'bg-emerald-400 animate-pulse'
                            : 'bg-slate-600'
                        )}
                      />
                      {session.session_id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-cyan-300 font-semibold">
                        {session.source_ip}
                      </div>
                      {session.country && (
                        <div className="text-[11px] text-soc-muted">
                          {session.city ? `${session.city}, ` : ''}
                          {session.country}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] border font-medium',
                          actorBadge.bg
                        )}
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full', actorBadge.indicator)} />
                        {getActorTypeLabel(session.actor_type)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {session.login_attempts}
                      {session.successful_login && (
                        <span className="text-[10px] ml-1 text-rose-400 font-bold">[BREACH]</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {session.commands_executed}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {session.techniques.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="bg-soc-border/50 text-soc-cyan px-1.5 py-0.5 rounded text-[10px] font-mono"
                          >
                            {t}
                          </span>
                        ))}
                        {session.techniques.length > 3 && (
                          <span className="text-[10px] text-soc-muted">
                            +{session.techniques.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge risk={session.risk_score} showScore score={session.risk_score} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/graph?session=${session.session_id}`)
                        }}
                        className="px-2.5 py-1 rounded bg-soc-cyan/15 text-soc-cyan border border-soc-cyan/30 hover:bg-soc-cyan/25 transition-all font-mono text-[11px] inline-flex items-center gap-1"
                      >
                        <Network className="w-3 h-3" />
                        Graph
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
