import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  HealthStatus,
  TelemetryEvent,
  AttackSession,
  SessionDetail,
  AttackGraphData,
  HeatmapItem,
  ThreatActor,
  DemoStep,
} from '../types'
import {
  MOCK_HEALTH,
  MOCK_SESSIONS,
  MOCK_SESSION_DETAIL_ABC123,
  MOCK_GRAPH_DATA_ABC123,
  MOCK_HEATMAP_DATA,
  MOCK_THREAT_ACTORS,
  MOCK_LIVE_EVENTS,
  DEMO_PROGRESSION_STEPS,
} from '../services/mockData'
import { api, setForcedMockMode } from '../services/api'

interface DemoContextType {
  demoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  autoPlay: boolean;
  setAutoPlay: (auto: boolean) => void;
  currentStepIndex: number;
  currentStep: DemoStep;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  jumpToStep: (step: number) => void;
  resetDemo: () => void;

  // Real-time state
  health: HealthStatus;
  refreshHealth: () => void;
  liveEvents: TelemetryEvent[];
  sessions: AttackSession[];
  activeSessionDetail: SessionDetail;
  graphData: AttackGraphData;
  heatmapData: HeatmapItem[];
  actors: ThreatActor[];

  // Global search & refresh
  globalSearch: string;
  setGlobalSearch: (query: string) => void;
  isRefreshing: boolean;
  triggerRefresh: () => void;
}

const DemoContext = createContext<DemoContextType | null>(null)

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [demoMode, setDemoModeState] = useState<boolean>(true)
  const [autoPlay, setAutoPlay] = useState<boolean>(false)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(3) // start at stage 3 (successful login) for immediate visual punch
  const [globalSearch, setGlobalSearch] = useState<string>('')
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  const [health, setHealth] = useState<HealthStatus>(MOCK_HEALTH)
  const [liveEvents, setLiveEvents] = useState<TelemetryEvent[]>(MOCK_LIVE_EVENTS)
  const [sessions, setSessions] = useState<AttackSession[]>(MOCK_SESSIONS)
  const [activeSessionDetail, setActiveSessionDetail] = useState<SessionDetail>(MOCK_SESSION_DETAIL_ABC123)
  const [graphData, setGraphData] = useState<AttackGraphData>(MOCK_GRAPH_DATA_ABC123)
  const [heatmapData, setHeatmapData] = useState<HeatmapItem[]>(MOCK_HEATMAP_DATA)
  const [actors, setActors] = useState<ThreatActor[]>(MOCK_THREAT_ACTORS)

  const setDemoMode = (enabled: boolean) => {
    setDemoModeState(enabled)
    setForcedMockMode(enabled)
  }

  // Fetch health check
  const refreshHealth = useCallback(async () => {
    try {
      const res = await api.getHealth()
      setHealth(res)
    } catch {
      setHealth((prev) => ({ ...prev, status: 'offline' }))
    }
  }, [])

  // Global Refresh
  const triggerRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await refreshHealth()
      if (!demoMode) {
        const [sList, eList, hList, aList] = await Promise.all([
          api.getSessions(),
          api.getLiveEvents(),
          api.getAttackHeatmap(),
          api.getActors(),
        ])
        setSessions(sList)
        setLiveEvents(eList)
        setHeatmapData(hList)
        setActors(aList)
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 400)
    }
  }, [demoMode, refreshHealth])

  useEffect(() => {
    refreshHealth()
    const timer = setInterval(refreshHealth, 10000)
    return () => clearInterval(timer)
  }, [refreshHealth])

  // Apply step logic when in demo mode
  const applyStep = useCallback((stepIdx: number) => {
    const step = DEMO_PROGRESSION_STEPS[stepIdx - 1]
    if (!step) return

    // Inject step's event into live telemetry feed
    setLiveEvents((prev) => {
      const exists = prev.some((e) => e.event_id === step.addedEvent.event_id)
      if (exists) return prev
      return [step.addedEvent, ...prev]
    })

    // Update active session detail
    setActiveSessionDetail((prev) => {
      const updatedEvents = prev.events.some((e) => e.event_id === step.addedEvent.event_id)
        ? prev.events
        : [...prev.events, step.addedEvent]

      const updatedTechniques = step.addedTechnique && !prev.techniques.includes(step.addedTechnique)
        ? [...prev.techniques, step.addedTechnique]
        : prev.techniques

      const updatedPredictions = step.predictionTriggered && !prev.predictions.some(p => p.next_technique_id === step.predictionTriggered?.next_technique_id)
        ? [step.predictionTriggered, ...prev.predictions]
        : prev.predictions

      return {
        ...prev,
        events: updatedEvents,
        techniques: updatedTechniques,
        predictions: updatedPredictions,
        commands_executed: Math.max(prev.commands_executed, updatedEvents.filter(e => e.event_type === 'command_execution').length),
        risk_score: Math.min(99, 45 + stepIdx * 8),
      }
    })

    // Update heatmap count
    if (step.addedTechnique) {
      setHeatmapData((prev) =>
        prev.map((item) =>
          item.technique_id === step.addedTechnique
            ? { ...item, count: item.count + 1 }
            : item
        )
      )
    }
  }, [])

  // Auto-play timer
  useEffect(() => {
    if (!demoMode || !autoPlay) return

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = prev < DEMO_PROGRESSION_STEPS.length ? prev + 1 : 1
        applyStep(next)
        return next
      })
    }, 4500)

    return () => clearInterval(interval)
  }, [demoMode, autoPlay, applyStep])

  const nextStep = () => {
    setCurrentStepIndex((prev) => {
      const next = Math.min(DEMO_PROGRESSION_STEPS.length, prev + 1)
      applyStep(next)
      return next
    })
  }

  const prevStep = () => {
    setCurrentStepIndex((prev) => {
      const next = Math.max(1, prev - 1)
      applyStep(next)
      return next
    })
  }

  const jumpToStep = (step: number) => {
    if (step >= 1 && step <= DEMO_PROGRESSION_STEPS.length) {
      setCurrentStepIndex(step)
      applyStep(step)
    }
  }

  const resetDemo = () => {
    setCurrentStepIndex(1)
    setLiveEvents(MOCK_LIVE_EVENTS)
    setActiveSessionDetail(MOCK_SESSION_DETAIL_ABC123)
    setGraphData(MOCK_GRAPH_DATA_ABC123)
    setHeatmapData(MOCK_HEATMAP_DATA)
    applyStep(1)
  }

  const currentStep = DEMO_PROGRESSION_STEPS[currentStepIndex - 1] || DEMO_PROGRESSION_STEPS[0]

  return (
    <DemoContext.Provider
      value={{
        demoMode,
        setDemoMode,
        autoPlay,
        setAutoPlay,
        currentStepIndex,
        currentStep,
        totalSteps: DEMO_PROGRESSION_STEPS.length,
        nextStep,
        prevStep,
        jumpToStep,
        resetDemo,
        health,
        refreshHealth,
        liveEvents,
        sessions,
        activeSessionDetail,
        graphData,
        heatmapData,
        actors,
        globalSearch,
        setGlobalSearch,
        isRefreshing,
        triggerRefresh,
      }}
    >
      {children}
    </DemoContext.Provider>
  )
}

export function useDemo() {
  const context = useContext(DemoContext)
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider')
  }
  return context
}
