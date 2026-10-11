import {
  HealthStatus,
  AttackSession,
  SessionDetail,
  AttackGraphData,
  HeatmapItem,
  ThreatActor,
  TelemetryEvent,
} from '../types'
import {
  MOCK_HEALTH,
  MOCK_SESSIONS,
  MOCK_SESSION_DETAIL_ABC123,
  MOCK_GRAPH_DATA_ABC123,
  MOCK_HEATMAP_DATA,
  MOCK_THREAT_ACTORS,
  MOCK_LIVE_EVENTS,
} from './mockData'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// Tracks whether we force mock data or automatically fallback
let forcedMockMode = false

export function setForcedMockMode(enabled: boolean) {
  forcedMockMode = enabled
}

export function isForcedMockMode(): boolean {
  return forcedMockMode
}

async function request<T>(endpoint: string, mockFallback: T): Promise<T> {
  // If user enabled forced mock mode or no API url configured, use mock
  if (forcedMockMode || !API_BASE_URL) {
    // Simulate brief network latency for realism
    await new Promise((r) => setTimeout(r, 120))
    return mockFallback
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      console.warn(`[API] Endpoint ${endpoint} returned ${res.status}. Falling back to mock data.`)
      return mockFallback
    }

    const data = await res.json()
    return data as T
  } catch (err) {
    console.warn(`[API] Network error fetching ${endpoint}. Falling back to mock data:`, err)
    return mockFallback
  }
}

export const api = {
  async getHealth(): Promise<HealthStatus> {
    if (forcedMockMode || !API_BASE_URL) {
      return MOCK_HEALTH
    }
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)
      const res = await fetch(`${API_BASE_URL}/api/health`, { signal: controller.signal })
      clearTimeout(timeoutId)
      if (res.ok) {
        return await res.json()
      }
      return { ...MOCK_HEALTH, status: 'degraded' }
    } catch {
      return { ...MOCK_HEALTH, status: 'offline' }
    }
  },

  async getSessions(): Promise<AttackSession[]> {
    return request<AttackSession[]>('/api/sessions', MOCK_SESSIONS)
  },

  async getSessionDetail(sessionId: string): Promise<SessionDetail> {
    // Generate specialized or base session detail
    const base = MOCK_SESSIONS.find((s) => s.session_id === sessionId)
    const fallbackDetail: SessionDetail = base
      ? {
          ...MOCK_SESSION_DETAIL_ABC123,
          session_id: base.session_id,
          source_ip: base.source_ip,
          duration_seconds: base.duration_seconds,
          login_attempts: base.login_attempts,
          commands_executed: base.commands_executed,
          risk_score: base.risk_score,
          actor_type: base.actor_type,
          status: base.status,
          country: base.country,
          city: base.city,
        }
      : MOCK_SESSION_DETAIL_ABC123

    return request<SessionDetail>(`/api/sessions/${sessionId}`, fallbackDetail)
  },

  async getGraph(sessionId: string): Promise<AttackGraphData> {
    const fallbackGraph: AttackGraphData = {
      ...MOCK_GRAPH_DATA_ABC123,
      session_id: sessionId,
      nodes: MOCK_GRAPH_DATA_ABC123.nodes.map((n) => {
        if (n.type === 'session') return { ...n, label: `Session #${sessionId}` }
        return n
      }),
    }

    return request<AttackGraphData>(`/api/graph/${sessionId}`, fallbackGraph)
  },

  async getAttackHeatmap(): Promise<HeatmapItem[]> {
    return request<HeatmapItem[]>('/api/attack-heatmap', MOCK_HEATMAP_DATA)
  },

  async getActors(): Promise<ThreatActor[]> {
    return request<ThreatActor[]>('/api/actors', MOCK_THREAT_ACTORS)
  },

  async getLiveEvents(): Promise<TelemetryEvent[]> {
    return request<TelemetryEvent[]>('/api/live-events', MOCK_LIVE_EVENTS)
  },
}
