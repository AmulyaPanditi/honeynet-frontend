import { useState, useEffect, useCallback } from 'react'
import {
  AttackSession,
  SessionDetail,
  TelemetryEvent,
  HeatmapItem,
  ThreatActor,
  AttackGraphData,
  AttackPrediction,
} from '../types'
import { api } from '../services/api'
import { useDemo } from '../context/DemoContext'

export function usePolling(callback: () => void, intervalMs: number, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const id = setInterval(callback, intervalMs)
    return () => clearInterval(id)
  }, [callback, intervalMs, enabled])
}

export function useSessions() {
  const { demoMode, sessions: demoSessions, isRefreshing } = useDemo()
  const [data, setData] = useState<AttackSession[]>(demoSessions)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    if (demoMode) {
      setData(demoSessions)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await api.getSessions()
      setData(res)
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch attack sessions')
    } finally {
      setLoading(false)
    }
  }, [demoMode, demoSessions])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions, isRefreshing])

  return { sessions: data, loading, error, refetch: fetchSessions }
}

export function useSessionDetail(sessionId: string) {
  const { demoMode, activeSessionDetail, isRefreshing } = useDemo()
  const [data, setData] = useState<SessionDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetail = useCallback(async () => {
    if (demoMode && sessionId === activeSessionDetail.session_id) {
      setData(activeSessionDetail)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await api.getSessionDetail(sessionId)
      setData(res)
    } catch (err: any) {
      setError(err?.message || `Failed to fetch session detail for ${sessionId}`)
    } finally {
      setLoading(false)
    }
  }, [sessionId, demoMode, activeSessionDetail])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail, isRefreshing])

  return { session: data, loading, error, refetch: fetchDetail }
}

export function useLiveEvents(pollingIntervalMs = 4000) {
  const { demoMode, liveEvents: demoEvents, isRefreshing } = useDemo()
  const [events, setEvents] = useState<TelemetryEvent[]>(demoEvents)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    if (demoMode) {
      setEvents(demoEvents)
      return
    }
    setLoading(true)
    try {
      const res = await api.getLiveEvents()
      setEvents(res)
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch live events')
    } finally {
      setLoading(false)
    }
  }, [demoMode, demoEvents])

  useEffect(() => {
    if (demoMode) {
      setEvents(demoEvents)
    } else {
      fetchEvents()
    }
  }, [demoMode, demoEvents, fetchEvents, isRefreshing])

  usePolling(fetchEvents, pollingIntervalMs, !demoMode)

  return { events, loading, error, refetch: fetchEvents }
}

export function useAttackHeatmap() {
  const { demoMode, heatmapData: demoHeatmap, isRefreshing } = useDemo()
  const [data, setData] = useState<HeatmapItem[]>(demoHeatmap)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHeatmap = useCallback(async () => {
    if (demoMode) {
      setData(demoHeatmap)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await api.getAttackHeatmap()
      setData(res)
    } catch (err: any) {
      setError(err?.message || 'Failed to load ATT&CK heatmap data')
    } finally {
      setLoading(false)
    }
  }, [demoMode, demoHeatmap])

  useEffect(() => {
    fetchHeatmap()
  }, [fetchHeatmap, isRefreshing])

  return { heatmap: data, loading, error, refetch: fetchHeatmap }
}

export function useActors() {
  const { demoMode, actors: demoActors, isRefreshing } = useDemo()
  const [data, setData] = useState<ThreatActor[]>(demoActors)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchActors = useCallback(async () => {
    if (demoMode) {
      setData(demoActors)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await api.getActors()
      setData(res)
    } catch (err: any) {
      setError(err?.message || 'Failed to load threat actors')
    } finally {
      setLoading(false)
    }
  }, [demoMode, demoActors])

  useEffect(() => {
    fetchActors()
  }, [fetchActors, isRefreshing])

  return { actors: data, loading, error, refetch: fetchActors }
}

export function useGraph(sessionId: string) {
  const { demoMode, graphData: demoGraph, isRefreshing } = useDemo()
  const [data, setData] = useState<AttackGraphData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGraph = useCallback(async () => {
    if (demoMode && (!sessionId || sessionId === demoGraph.session_id)) {
      setData(demoGraph)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await api.getGraph(sessionId || 'abc123')
      setData(res)
    } catch (err: any) {
      setError(err?.message || 'Failed to load graph data')
    } finally {
      setLoading(false)
    }
  }, [sessionId, demoMode, demoGraph])

  useEffect(() => {
    fetchGraph()
  }, [fetchGraph, isRefreshing])

  return { graph: data, loading, error, refetch: fetchGraph }
}

export function usePredictions() {
  const { sessions, activeSessionDetail } = useDemo()

  // Aggregated predictions across sessions
  const predictions: {
    sessionId: string;
    sourceIp: string;
    actorType: string;
    riskScore: number;
    predictions: AttackPrediction[];
    currentTechniques: string[];
  }[] = [
    {
      sessionId: activeSessionDetail.session_id,
      sourceIp: activeSessionDetail.source_ip,
      actorType: activeSessionDetail.actor_type,
      riskScore: activeSessionDetail.risk_score,
      predictions: activeSessionDetail.predictions,
      currentTechniques: activeSessionDetail.techniques,
    },
    ...sessions
      .filter((s) => s.session_id !== activeSessionDetail.session_id)
      .map((s) => ({
        sessionId: s.session_id,
        sourceIp: s.source_ip,
        actorType: s.actor_type,
        riskScore: s.risk_score,
        predictions: [
          {
            next_technique_id: 'T1059',
            next_technique_name: 'Command and Scripting Interpreter',
            confidence: 0.74,
            reason: 'Automated script payload execution anticipated following valid session access.',
            evidence_commands: ['python3 -c "import socket..."'],
          },
        ],
        currentTechniques: s.techniques,
      })),
  ]

  return { predictions }
}
