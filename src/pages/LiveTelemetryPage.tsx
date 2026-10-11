import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Filter,
  Download,
  Terminal,
  ExternalLink,
  Shield,
  Search,
} from 'lucide-react'
import { useLiveEvents } from '../hooks'
import { useDemo } from '../context/DemoContext'
import { TelemetryEvent } from '../types'
import { EventRow } from '../components/common/EventRow'
import { Drawer } from '../components/common/Drawer'
import { RiskBadge } from '../components/common/RiskBadge'
import { TechniqueBadge } from '../components/common/TechniqueBadge'
import { EmptyState } from '../components/common/EmptyState'
import { formatDateTime, formatRelativeTime } from '../utils/formatters'
import { cn } from '../utils/cn'

export const LiveTelemetryPage: React.FC = () => {
  const navigate = useNavigate()
  const { events } = useLiveEvents(4000)
  const { globalSearch, setGlobalSearch, demoMode, autoPlay } = useDemo()

  // Selected event for detail drawer
  const [selectedEvent, setSelectedEvent] = useState<TelemetryEvent | null>(null)

  // Local filters
  const [selectedEventType, setSelectedEventType] = useState<string>('all')
  const [selectedRisk, setSelectedRisk] = useState<string>('all')
  const [selectedIp, setSelectedIp] = useState<string>('all')
  const [techniqueQuery, setTechniqueQuery] = useState<string>('')

  // Unique IPs for filter dropdown
  const uniqueIps = useMemo(() => {
    return Array.from(new Set(events.map((e) => e.source_ip)))
  }, [events])

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Global search filter
      if (globalSearch) {
        const q = globalSearch.toLowerCase()
        const matchesGlobal =
          e.source_ip.toLowerCase().includes(q) ||
          e.session_id.toLowerCase().includes(q) ||
          (e.command && e.command.toLowerCase().includes(q)) ||
          (e.technique_id && e.technique_id.toLowerCase().includes(q))
        if (!matchesGlobal) return false
      }

      // Event type filter
      if (selectedEventType !== 'all' && e.event_type !== selectedEventType) {
        return false
      }

      // Risk level filter
      if (selectedRisk !== 'all' && e.risk_level !== selectedRisk) {
        return false
      }

      // IP filter
      if (selectedIp !== 'all' && e.source_ip !== selectedIp) {
        return false
      }

      // Technique filter
      if (
        techniqueQuery &&
        (!e.technique_id ||
          !e.technique_id.toLowerCase().includes(techniqueQuery.toLowerCase()))
      ) {
        return false
      }

      return true
    })
  }, [
    events,
    globalSearch,
    selectedEventType,
    selectedRisk,
    selectedIp,
    techniqueQuery,
  ])

  // Export events to JSON file
  const exportTelemetryJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredEvents, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `honeynet-telemetry-${new Date().toISOString().slice(0, 19)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-soc-cyan animate-pulse" />
            <h1 className="text-xl font-bold text-white tracking-wide">
              Live Honeynet Telemetry Stream
            </h1>
          </div>
          <p className="text-xs text-soc-muted mt-1">
            Real-time normalized Cowrie SSH sensor events, credential stuffing probes, and shell commands
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-soc-muted flex items-center gap-2 bg-soc-card px-3 py-1.5 rounded-lg border border-soc-border">
            <span>Buffer:</span>
            <strong className="text-white">{events.length} events</strong>
            {demoMode && (
              <span className="text-[10px] text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded font-mono">
                {autoPlay ? 'AUTO STREAMING' : 'DEMO MODE'}
              </span>
            )}
          </div>
          <button
            onClick={exportTelemetryJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-soc-card border border-soc-border hover:border-soc-borderLight text-xs font-medium text-white transition-all"
          >
            <Download className="w-3.5 h-3.5 text-soc-cyan" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-soc-card border border-soc-border rounded-xl p-4 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-soc-muted shrink-0 font-mono">
          <Filter className="w-4 h-4 text-soc-cyan" />
          <span>Filters:</span>
        </div>

        {/* Event Type Filter */}
        <select
          value={selectedEventType}
          onChange={(e) => setSelectedEventType(e.target.value)}
          aria-label="Filter by Event Type"
          className="bg-soc-surface border border-soc-border rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-soc-cyan font-mono"
        >
          <option value="all">All Event Types</option>
          <option value="command_execution">Command Executions</option>
          <option value="successful_login">Successful Logins</option>
          <option value="login_attempt">Login Attempts</option>
          <option value="file_download">File Downloads</option>
          <option value="port_scan">Port Scans</option>
        </select>

        {/* Risk Level Filter */}
        <select
          value={selectedRisk}
          onChange={(e) => setSelectedRisk(e.target.value)}
          aria-label="Filter by Risk Severity"
          className="bg-soc-surface border border-soc-border rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-soc-cyan font-mono"
        >
          <option value="all">All Risk Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Source IP Filter */}
        <select
          value={selectedIp}
          onChange={(e) => setSelectedIp(e.target.value)}
          aria-label="Filter by Source IP"
          className="bg-soc-surface border border-soc-border rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-soc-cyan font-mono"
        >
          <option value="all">All Source IPs</option>
          {uniqueIps.map((ip) => (
            <option key={ip} value={ip}>
              {ip}
            </option>
          ))}
        </select>

        {/* Technique ID Input */}
        <div className="relative">
          <input
            type="text"
            value={techniqueQuery}
            onChange={(e) => setTechniqueQuery(e.target.value)}
            placeholder="Technique ID (e.g. T1110)"
            className="bg-soc-surface border border-soc-border rounded-lg pl-7 pr-3 py-1.5 text-slate-200 focus:outline-none focus:border-soc-cyan font-mono w-44 placeholder-soc-muted/60"
          />
          <Search className="w-3.5 h-3.5 text-soc-muted absolute left-2 top-1/2 -translate-y-1/2" />
        </div>

        {/* Clear filters button */}
        {(selectedEventType !== 'all' ||
          selectedRisk !== 'all' ||
          selectedIp !== 'all' ||
          techniqueQuery ||
          globalSearch) && (
          <button
            onClick={() => {
              setSelectedEventType('all')
              setSelectedRisk('all')
              setSelectedIp('all')
              setTechniqueQuery('')
              setGlobalSearch('')
            }}
            className="text-xs text-rose-400 hover:underline font-mono ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Events Stream Table */}
      <div className="rounded-xl bg-soc-card border border-soc-border overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-soc-surface/80 text-soc-muted uppercase tracking-wider font-mono text-[11px] border-b border-soc-border">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Source IP</th>
                <th className="py-3 px-4">Session</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Intercepted Command / Payload</th>
                <th className="py-3 px-4">MITRE Mapping</th>
                <th className="py-3 px-4 text-right">Risk</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length > 0 ? (
                filteredEvents.map((evt) => (
                  <EventRow
                    key={evt.event_id}
                    event={evt}
                    onSelect={(event) => setSelectedEvent(event)}
                    isHighlighted={selectedEvent?.event_id === evt.event_id}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8">
                    <EmptyState
                      title="No Telemetry Events Matched"
                      description="Try clearing your filters or global search term to see more honeynet events."
                      actionText="Reset All Filters"
                      onAction={() => {
                        setSelectedEventType('all')
                        setSelectedRisk('all')
                        setSelectedIp('all')
                        setTechniqueQuery('')
                        setGlobalSearch('')
                      }}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details Drawer */}
      <Drawer
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={`Telemetry Event: ${selectedEvent?.event_id || ''}`}
        subtitle={`Captured from ${selectedEvent?.source_ip || ''}`}
        width="lg"
      >
        {selectedEvent && (
          <div className="space-y-6">
            {/* Top Badge summary */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-soc-card rounded-lg border border-soc-border">
              <div className="flex items-center gap-2">
                <RiskBadge risk={selectedEvent.risk_level} />
                <span className="text-xs text-soc-muted font-mono">
                  {formatDateTime(selectedEvent.timestamp)} ({formatRelativeTime(selectedEvent.timestamp)})
                </span>
              </div>
              <button
                onClick={() => {
                  navigate(`/sessions/${selectedEvent.session_id}`)
                  setSelectedEvent(null)
                }}
                className="text-xs text-soc-cyan hover:underline font-mono inline-flex items-center gap-1"
              >
                Go to Session #{selectedEvent.session_id} <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Event Metadata Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-soc-card rounded-lg border border-soc-border">
                <span className="text-soc-muted font-mono text-[11px]">EVENT TYPE</span>
                <p className="font-semibold text-white mt-1 capitalize">
                  {selectedEvent.event_type.replace(/_/g, ' ')}
                </p>
              </div>
              <div className="p-3 bg-soc-card rounded-lg border border-soc-border">
                <span className="text-soc-muted font-mono text-[11px]">SOURCE IP</span>
                <p className="font-semibold text-cyan-300 font-mono mt-1">
                  {selectedEvent.source_ip}
                </p>
              </div>
              <div className="p-3 bg-soc-card rounded-lg border border-soc-border">
                <span className="text-soc-muted font-mono text-[11px]">EXECUTION STATUS</span>
                <p className={cn('font-semibold mt-1', selectedEvent.success ? 'text-emerald-400' : 'text-slate-400')}>
                  {selectedEvent.success ? 'SUCCESSFUL (Exit 0)' : 'FAILED / REJECTED'}
                </p>
              </div>
              <div className="p-3 bg-soc-card rounded-lg border border-soc-border">
                <span className="text-soc-muted font-mono text-[11px]">HONEYPOT SESSION</span>
                <p className="font-semibold text-white font-mono mt-1">
                  {selectedEvent.session_id}
                </p>
              </div>
            </div>

            {/* Intercepted Command Box */}
            {selectedEvent.command && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-soc-muted">
                  <span className="flex items-center gap-1.5 text-soc-cyan">
                    <Terminal className="w-4 h-4" />
                    INTERCEPTED COMMAND
                  </span>
                </div>
                <div className="bg-black/80 border border-slate-800 rounded-lg p-3 font-mono text-xs text-cyan-200 select-all overflow-x-auto shadow-inner">
                  {selectedEvent.command}
                </div>
              </div>
            )}

            {/* Auth Credential Details */}
            {selectedEvent.username && (
              <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg text-xs space-y-1">
                <span className="text-[11px] font-mono text-amber-400 font-semibold uppercase">
                  Authentication Probe Payload
                </span>
                <div className="font-mono text-slate-200">
                  Username: <strong className="text-white">{selectedEvent.username}</strong> | Password Attempt: <strong className="text-white">{selectedEvent.password_attempt || '***'}</strong>
                </div>
              </div>
            )}

            {/* MITRE ATT&CK Mapping Card */}
            {selectedEvent.technique_id && (
              <div className="p-4 bg-soc-card border border-soc-cyan/30 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-soc-cyan font-semibold flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    MITRE ATT&CK MAPPING
                  </span>
                  {selectedEvent.confidence && (
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      {Math.round(selectedEvent.confidence * 100)}% Confidence
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <TechniqueBadge
                    techniqueId={selectedEvent.technique_id}
                    techniqueName={selectedEvent.technique_name}
                    tactic={selectedEvent.tactic}
                    clickable
                    onClick={() => {
                      navigate(`/heatmap?technique=${selectedEvent.technique_id}`)
                      setSelectedEvent(null)
                    }}
                  />
                  {selectedEvent.tactic && (
                    <span className="text-xs text-soc-muted font-mono">
                      Tactic: <strong className="text-white">{selectedEvent.tactic}</strong>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Raw Cowrie Payload */}
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-soc-muted uppercase tracking-wider">
                Raw Cowrie JSON Telemetry Packet
              </span>
              <pre className="p-3 rounded-lg bg-black/90 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap select-all">
                {JSON.stringify(selectedEvent, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
