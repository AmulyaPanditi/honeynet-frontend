import React from 'react'
import {
  Search,
  RefreshCw,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import { cn } from '../../utils/cn'

export const TopBar: React.FC = () => {
  const {
    health,
    demoMode,
    setDemoMode,
    autoPlay,
    setAutoPlay,
    currentStepIndex,
    totalSteps,
    currentStep,
    nextStep,
    resetDemo,
    globalSearch,
    setGlobalSearch,
    isRefreshing,
    triggerRefresh,
    jumpToStep,
  } = useDemo()

  const getHealthBadge = () => {
    switch (health.status) {
      case 'online':
        return {
          dot: 'bg-emerald-400',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
          bg: 'bg-emerald-500/10',
          label: 'API Online',
        }
      case 'degraded':
        return {
          dot: 'bg-amber-400',
          text: 'text-amber-400',
          border: 'border-amber-500/30',
          bg: 'bg-amber-500/10',
          label: 'API Degraded',
        }
      case 'offline':
      default:
        return {
          dot: 'bg-rose-400',
          text: 'text-rose-400',
          border: 'border-rose-500/30',
          bg: 'bg-rose-500/10',
          label: 'API Offline (Mock Active)',
        }
    }
  }

  const healthStyle = getHealthBadge()

  return (
    <header className="h-16 bg-soc-surface/90 backdrop-blur-md border-b border-soc-border px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Title & Status */}
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
          <span>Honeynet ATT&CK Profiler</span>
          <span className="hidden lg:inline text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-soc-border/60 text-soc-muted">
            Cowrie SOC v2.4
          </span>
        </h1>

        {/* Backend Health Badge */}
        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border',
            healthStyle.bg,
            healthStyle.text,
            healthStyle.border
          )}
          title={`Backend status: ${health.status} (${health.engine_latency_ms}ms)`}
        >
          <span className={cn('w-2 h-2 rounded-full animate-pulse', healthStyle.dot)} />
          <span>{healthStyle.label}</span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 text-soc-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Global search by IP (e.g. 10.20.30.40) or Session (abc123)..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-soc-card border border-soc-border focus:border-soc-cyan focus:outline-none focus:ring-1 focus:ring-soc-cyan text-xs text-white placeholder-soc-muted/60 font-mono transition-all"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-soc-muted hover:text-white"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Action Controls & Demo Controller */}
      <div className="flex items-center gap-3">
        {/* Refresh Button */}
        <button
          onClick={triggerRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-soc-card border border-soc-border text-soc-muted hover:text-white hover:border-soc-borderLight transition-all"
          title="Refresh Telemetry and KPIs"
        >
          <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin text-soc-cyan')} />
        </button>

        {/* Demo Mode Toggle */}
        <div className="flex items-center gap-2 pl-2 border-l border-soc-border">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-medium text-soc-muted hidden md:inline">
              Demo Mode
            </span>
            <div
              onClick={() => setDemoMode(!demoMode)}
              className={cn(
                'w-10 h-5 rounded-full transition-colors relative cursor-pointer',
                demoMode ? 'bg-soc-cyan' : 'bg-soc-border'
              )}
            >
              <div
                className={cn(
                  'w-3.5 h-3.5 rounded-full bg-black absolute top-[3px] transition-transform shadow-sm',
                  demoMode ? 'translate-x-5' : 'translate-x-1'
                )}
              />
            </div>
          </label>
        </div>

        {/* Hackathon Stage Stepper (When Demo Mode is Active) */}
        {demoMode && (
          <div className="hidden xl:flex items-center gap-1.5 bg-soc-card/90 border border-purple-500/40 rounded-lg px-2.5 py-1 text-xs font-mono shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-purple-300 font-semibold">
              Stage {currentStepIndex}/{totalSteps}:
            </span>
            <span className="text-white truncate max-w-[130px]" title={currentStep.stageName}>
              {currentStep.stageName}
            </span>

            {/* Stepper Buttons */}
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-soc-border">
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className={cn(
                  'p-1 rounded hover:bg-soc-border/60 transition-colors',
                  autoPlay ? 'text-emerald-400' : 'text-soc-muted'
                )}
                title={autoPlay ? 'Pause Auto Progression' : 'Start Auto Progression (4s interval)'}
              >
                {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={nextStep}
                disabled={currentStepIndex >= totalSteps}
                className="p-1 rounded text-soc-muted hover:text-white hover:bg-soc-border/60 transition-colors disabled:opacity-40"
                title="Next Attack Stage"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={resetDemo}
                className="p-1 rounded text-soc-muted hover:text-white hover:bg-soc-border/60 transition-colors"
                title="Reset to Stage 1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick jump dropdown */}
            <select
              value={currentStepIndex}
              onChange={(e) => jumpToStep(Number(e.target.value))}
              aria-label="Jump to attack simulation stage"
              className="bg-soc-surface text-[11px] text-purple-300 border border-purple-500/30 rounded px-1.5 py-0.5 ml-1 focus:outline-none"
            >
              <option value={1}>1: Port Scan</option>
              <option value={2}>2: Brute Force</option>
              <option value={3}>3: Shell Breach</option>
              <option value={4}>4: Discovery</option>
              <option value={5}>5: File Recon</option>
              <option value={6}>6: Payload Fetch</option>
              <option value={7}>7: Graph Forecast</option>
            </select>
          </div>
        )}
      </div>
    </header>
  )
}
