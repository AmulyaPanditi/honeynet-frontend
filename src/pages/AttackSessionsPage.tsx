import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield,
  ArrowUpDown,
  Search,
  Network,
  ExternalLink,
  Lock,
  Unlock,
  Terminal,
} from 'lucide-react'
import { useSessions } from '../hooks'
import { useDemo } from '../context/DemoContext'
import { RiskBadge } from '../components/common/RiskBadge'
import { EmptyState } from '../components/common/EmptyState'
import {
  formatRelativeTime,
  formatDateTime,
  formatDuration,
  getActorTypeBadge,
  getActorTypeLabel,
  getRiskLevelFromScore,
} from '../utils/formatters'
import { cn } from '../utils/cn'

type SortField =
  | 'start_time'
  | 'risk_score'
  | 'duration_seconds'
  | 'login_attempts'
  | 'commands_executed'

export const AttackSessionsPage: React.FC = () => {
  const navigate = useNavigate()
  const { sessions } = useSessions()
  const { globalSearch, setGlobalSearch } = useDemo()

  // Local search and filters
  const [localSearch, setLocalSearch] = useState<string>('')
  const [filterActorType, setFilterActorType] = useState<string>('all')
  const [filterRisk, setFilterRisk] = useState<string>('all')
  const [filterLoginSuccess, setFilterLoginSuccess] = useState<string>('all')
  const [techniqueFilter, setTechniqueFilter] = useState<string>('')

  // Sorting
  const [sortField, setSortField] = useState<SortField>('risk_score')
  const [sortAsc, setSortAsc] = useState<boolean>(false)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  // Filter & sort sessions
  const filteredSessions = useMemo(() => {
    const q = (localSearch || globalSearch).toLowerCase().trim()

    const filtered = sessions.filter((s) => {
      // Search by IP or Session ID
      if (q) {
        const matches =
          s.source_ip.toLowerCase().includes(q) ||
          s.session_id.toLowerCase().includes(q) ||
          (s.country && s.country.toLowerCase().includes(q))
        if (!matches) return false
      }

      // Filter by Actor Type
      if (filterActorType !== 'all' && s.actor_type !== filterActorType) {
        return false
      }

      // Filter by Risk Level
      if (filterRisk !== 'all') {
        const sRisk = getRiskLevelFromScore(s.risk_score)
        if (sRisk !== filterRisk) return false
      }

      // Filter by Successful Login
      if (filterLoginSuccess === 'yes' && !s.successful_login) return false
      if (filterLoginSuccess === 'no' && s.successful_login) return false

      // Filter by Technique
      if (
        techniqueFilter &&
        !s.techniques.some((t) =>
          t.toLowerCase().includes(techniqueFilter.toLowerCase())
        )
      ) {
        return false
      }

      return true
    })

    // Sort
    return filtered.sort((a, b) => {
      let comparison = 0
      if (sortField === 'start_time') {
        comparison = new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      } else if (sortField === 'risk_score') {
        comparison = a.risk_score - b.risk_score
      } else if (sortField === 'duration_seconds') {
        comparison = a.duration_seconds - b.duration_seconds
      } else if (sortField === 'login_attempts') {
        comparison = a.login_attempts - b.login_attempts
      } else if (sortField === 'commands_executed') {
        comparison = a.commands_executed - b.commands_executed
      }
      return sortAsc ? comparison : -comparison
    })
  }, [
    sessions,
    localSearch,
    globalSearch,
    filterActorType,
    filterRisk,
    filterLoginSuccess,
    techniqueFilter,
    sortField,
    sortAsc,
  ])

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Shield className="w-5 h-5 text-soc-cyan" />
            Attack Sessions Registry
          </h1>
          <p className="text-xs text-soc-muted mt-1">
            Aggregated SSH honeypot intruder sessions with autonomous risk scoring and actor behavioral classification
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-soc-muted bg-soc-card px-3 py-1.5 rounded-lg border border-soc-border">
          <span>Total Captured:</span>
          <strong className="text-white">{sessions.length}</strong>
          <span className="text-soc-muted">|</span>
          <span>Filtered:</span>
          <strong className="text-soc-cyan">{filteredSessions.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-soc-card border border-soc-border rounded-xl p-4 flex flex-wrap items-center gap-3 text-xs">
        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-soc-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search IP (10.20.30.40) or Session..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-soc-surface border border-soc-border text-slate-200 placeholder-soc-muted/60 focus:outline-none focus:border-soc-cyan font-mono"
          />
        </div>

        {/* Actor Type Filter */}
        <select
          value={filterActorType}
          onChange={(e) => setFilterActorType(e.target.value)}
          aria-label="Filter by Candidate Actor Type"
          className="bg-soc-surface border border-soc-border rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-soc-cyan font-mono"
        >
          <option value="all">All Actor Profiles</option>
          <option value="interactive_attacker">Interactive Attacker</option>
          <option value="botnet_dropper">Botnet Payload Dropper</option>
          <option value="credential_stuffer">Credential Stuffer</option>
          <option value="discovery_heavy">Discovery Scout</option>
          <option value="persistence_attempt">Persistence Operator</option>
          <option value="automated_scanner">Automated Scanner</option>
        </select>

        {/* Risk Level Filter */}
        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          aria-label="Filter by Risk Score"
          className="bg-soc-surface border border-soc-border rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-soc-cyan font-mono"
        >
          <option value="all">All Risk Tiers</option>
          <option value="critical">Critical (80+)</option>
          <option value="high">High (60-79)</option>
          <option value="medium">Medium (35-59)</option>
          <option value="low">Low (0-34)</option>
        </select>

        {/* Successful Login Filter */}
        <select
          value={filterLoginSuccess}
          onChange={(e) => setFilterLoginSuccess(e.target.value)}
          aria-label="Filter by Login Success"
          className="bg-soc-surface border border-soc-border rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-soc-cyan font-mono"
        >
          <option value="all">All Auth Outcomes</option>
          <option value="yes">Breach Succeeded (Root/User)</option>
          <option value="no">Failed / Brute Rejected</option>
        </select>

        {/* Technique query */}
        <input
          type="text"
          value={techniqueFilter}
          onChange={(e) => setTechniqueFilter(e.target.value)}
          placeholder="Filter by Technique (e.g. T1105)"
          className="bg-soc-surface border border-soc-border rounded-lg px-3 py-1.5 text-slate-200 placeholder-soc-muted/60 focus:outline-none focus:border-soc-cyan font-mono w-44"
        />

        {/* Reset Filter Button */}
        {(localSearch ||
          globalSearch ||
          filterActorType !== 'all' ||
          filterRisk !== 'all' ||
          filterLoginSuccess !== 'all' ||
          techniqueFilter) && (
          <button
            onClick={() => {
              setLocalSearch('')
              setGlobalSearch('')
              setFilterActorType('all')
              setFilterRisk('all')
              setFilterLoginSuccess('all')
              setTechniqueFilter('')
            }}
            className="text-xs text-rose-400 hover:underline font-mono ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Sessions Table */}
      <div className="rounded-xl bg-soc-card border border-soc-border overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-soc-surface/80 text-soc-muted uppercase tracking-wider font-mono text-[11px] border-b border-soc-border select-none">
              <tr>
                <th className="py-3 px-4">Session ID</th>
                <th className="py-3 px-4">Source IP & Origin</th>
                <th
                  onClick={() => handleSort('start_time')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Start Time</span>
                    <ArrowUpDown className="w-3 h-3 text-soc-cyan" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('duration_seconds')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Duration</span>
                    <ArrowUpDown className="w-3 h-3 text-soc-cyan" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('login_attempts')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Logins</span>
                    <ArrowUpDown className="w-3 h-3 text-soc-cyan" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('commands_executed')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Commands</span>
                    <ArrowUpDown className="w-3 h-3 text-soc-cyan" />
                  </div>
                </th>
                <th className="py-3 px-4">Behavioral Profile</th>
                <th className="py-3 px-4">ATT&CK Techniques</th>
                <th
                  onClick={() => handleSort('risk_score')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Risk Gauge</span>
                    <ArrowUpDown className="w-3 h-3 text-soc-cyan" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border/40">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => {
                  const actorBadge = getActorTypeBadge(session.actor_type)
                  return (
                    <tr
                      key={session.session_id}
                      onClick={() => navigate(`/sessions/${session.session_id}`)}
                      className="hover:bg-soc-cardHover/70 transition-colors cursor-pointer group"
                    >
                      {/* Session ID */}
                      <td className="py-3.5 px-4 font-mono font-medium text-white flex items-center gap-2 whitespace-nowrap">
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full',
                            session.status === 'active'
                              ? 'bg-emerald-400 animate-pulse'
                              : 'bg-slate-600'
                          )}
                          title={session.status === 'active' ? 'Active Session' : 'Closed Session'}
                        />
                        <span className="group-hover:text-soc-cyan transition-colors">
                          {session.session_id}
                        </span>
                      </td>

                      {/* Source IP & Geo */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
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

                      {/* Start Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-soc-muted">
                        <span title={session.start_time}>
                          {formatDateTime(session.start_time)}
                        </span>
                        <div className="text-[10px] text-slate-500">
                          {formatRelativeTime(session.start_time)}
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-300">
                        {formatDuration(session.duration_seconds)}
                      </td>

                      {/* Login attempts & success */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                        <div className="flex items-center gap-1.5">
                          {session.successful_login ? (
                            <Unlock className="w-3.5 h-3.5 text-rose-400" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                          )}
                          <span className={session.successful_login ? 'text-rose-300 font-bold' : 'text-slate-300'}>
                            {session.login_attempts}
                          </span>
                        </div>
                      </td>

                      {/* Commands executed */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-300">
                        <div className="flex items-center gap-1">
                          <Terminal className="w-3 h-3 text-soc-muted" />
                          <span>{session.commands_executed}</span>
                        </div>
                      </td>

                      {/* Actor profile badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] border font-medium font-sans',
                            actorBadge.bg
                          )}
                        >
                          <span className={cn('w-1.5 h-1.5 rounded-full', actorBadge.indicator)} />
                          {getActorTypeLabel(session.actor_type)}
                        </span>
                      </td>

                      {/* Techniques list */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {session.techniques.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="bg-soc-border/60 text-soc-cyan px-1.5 py-0.5 rounded text-[10px] font-mono"
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

                      {/* Risk score badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <RiskBadge risk={session.risk_score} showScore score={session.risk_score} />
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/graph?session=${session.session_id}`)
                            }}
                            className="px-2 py-1 rounded bg-soc-cyan/15 text-soc-cyan border border-soc-cyan/30 hover:bg-soc-cyan/25 transition-all font-mono text-[11px] inline-flex items-center gap-1"
                            title="Open in Causal Attack Graph"
                          >
                            <Network className="w-3 h-3" />
                            Graph
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/sessions/${session.session_id}`)
                            }}
                            className="p-1 rounded text-soc-muted hover:text-white hover:bg-soc-border/60 transition-colors"
                            title="Open Session Details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={10} className="p-8">
                    <EmptyState
                      title="No Attack Sessions Matched"
                      description="No sessions match the selected risk levels, actor types, or search query."
                      actionText="Reset Filters"
                      onAction={() => {
                        setLocalSearch('')
                        setGlobalSearch('')
                        setFilterActorType('all')
                        setFilterRisk('all')
                        setFilterLoginSuccess('all')
                        setTechniqueFilter('')
                      }}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
