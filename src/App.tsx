import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DemoProvider } from './context/DemoContext'
import { AppShell } from './components/layout/AppShell'

// Pages
import { OverviewPage } from './pages/OverviewPage'
import { LiveTelemetryPage } from './pages/LiveTelemetryPage'
import { AttackSessionsPage } from './pages/AttackSessionsPage'
import { SessionDetailPage } from './pages/SessionDetailPage'
import { AttackHeatmapPage } from './pages/AttackHeatmapPage'
import { ThreatActorsPage } from './pages/ThreatActorsPage'
import { CausalGraphPage } from './pages/CausalGraphPage'
import { PredictionsPage } from './pages/PredictionsPage'

export const App: React.FC = () => {
  return (
    <DemoProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<OverviewPage />} />
            <Route path="telemetry" element={<LiveTelemetryPage />} />
            <Route path="sessions" element={<AttackSessionsPage />} />
            <Route path="sessions/:sessionId" element={<SessionDetailPage />} />
            <Route path="heatmap" element={<AttackHeatmapPage />} />
            <Route path="actors" element={<ThreatActorsPage />} />
            <Route path="graph" element={<CausalGraphPage />} />
            <Route path="predictions" element={<PredictionsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DemoProvider>
  )
}

export default App
