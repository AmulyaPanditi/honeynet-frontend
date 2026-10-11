import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Activity,
  Shield,
  Grid,
  Users,
  Network,
  Sparkles,
  ShieldAlert,
  Server,
  Flame,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useDemo } from '../../context/DemoContext'

export const Sidebar: React.FC = () => {
  const { demoMode, currentStepIndex, totalSteps } = useDemo()

  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Live Telemetry', path: '/telemetry', icon: Activity },
    { name: 'Attack Sessions', path: '/sessions', icon: Shield },
    { name: 'ATT&CK Heat Map', path: '/heatmap', icon: Grid },
    { name: 'Threat Actors', path: '/actors', icon: Users },
    { name: 'Causal Graph', path: '/graph', icon: Network, highlight: true },
    { name: 'Predictions', path: '/predictions', icon: Sparkles },
  ]

  return (
    <aside className="w-64 bg-soc-surface border-r border-soc-border flex flex-col shrink-0 min-h-screen select-none">
      {/* Brand Header */}
      <div className="h-16 border-b border-soc-border px-5 flex items-center justify-between bg-soc-card/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow-cyan">
            <ShieldAlert className="w-5 h-5 text-black font-bold" />
          </div>
          <div>
            <span className="font-mono font-bold text-sm tracking-wider text-white">
              HONEYNET<span className="text-soc-cyan">.AI</span>
            </span>
            <p className="text-[10px] text-soc-muted font-mono tracking-tight uppercase">
              MITRE ATT&CK Profiler
            </p>
          </div>
        </div>
      </div>

      {/* Demo Mode banner if active */}
      {demoMode && (
        <div className="mx-3 mt-3 p-2.5 rounded-lg bg-gradient-to-r from-purple-950/40 to-cyan-950/40 border border-purple-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-purple-400 animate-pulse" />
            <div>
              <span className="font-semibold text-purple-300">Demo Active</span>
              <p className="text-[10px] text-soc-muted">
                Stage {currentStepIndex}/{totalSteps}
              </p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-soc-muted/70 font-mono">
          Security Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group relative',
                  isActive
                    ? 'bg-soc-cyan/15 text-soc-cyan border border-soc-cyan/40 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-semibold'
                    : 'text-soc-muted hover:text-white hover:bg-soc-card/70 border border-transparent'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-soc-cyan' : 'text-soc-muted group-hover:text-white'
                    )}
                  />
                  <span className="tracking-wide">{item.name}</span>
                  {item.highlight && (
                    <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                      Graph
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-soc-cyan rounded-l-full shadow-glow-cyan" />
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Honeynet Node Status Footer */}
      <div className="p-4 border-t border-soc-border bg-soc-card/20 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-mono text-soc-muted flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            Cowrie Honeypot
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            4 NODES
          </span>
        </div>
        <div className="text-[10px] text-soc-muted/70 font-mono">
          Sensor: <span className="text-slate-300">ssh-cowrie-eu-01</span>
        </div>
      </div>
    </aside>
  )
}
