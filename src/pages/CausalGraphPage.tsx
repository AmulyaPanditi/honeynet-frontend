import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  Network,
  Sparkles,
  Info,
  Terminal,
  SlidersHorizontal,
} from 'lucide-react'
import { useGraph, useSessions } from '../hooks'
import { CustomGraphNode } from '../components/graph/CustomNode'
import { Drawer } from '../components/common/Drawer'
import { GraphNodeData } from '../types'
import { cn } from '../utils/cn'

// Registered custom node types
const nodeTypes = {
  custom: CustomGraphNode,
}

// Initial geometric layout coordinates for clean causal visualization
const NODE_COORDINATES: Record<string, { x: number; y: number }> = {
  'ip_10.20.30.40': { x: 420, y: 30 },
  'session_abc123': { x: 420, y: 150 },
  'login_root': { x: 120, y: 270 },
  'T1110': { x: 20, y: 390 },
  'T1078': { x: 180, y: 390 },
  'cmd_uname': { x: 420, y: 270 },
  'T1082': { x: 380, y: 390 },
  'cmd_whoami': { x: 670, y: 270 },
  'T1033': { x: 670, y: 390 },
  'cmd_passwd': { x: 920, y: 270 },
  'T1083': { x: 920, y: 390 },
  'cmd_curl': { x: 420, y: 510 },
  'file_payload': { x: 220, y: 630 },
  'T1105': { x: 420, y: 630 },
  'cmd_cron': { x: 740, y: 510 },
  'T1053': { x: 740, y: 630 },
  'pred_T1071': { x: 340, y: 770 },
  'pred_T1070': { x: 740, y: 770 },
}

export const CausalGraphPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { sessions } = useSessions()

  const currentSessionId = searchParams.get('session') || 'abc123'
  const { graph } = useGraph(currentSessionId)

  // Interactive UI controls state
  const [showPredictions, setShowPredictions] = useState<boolean>(true)
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.5)
  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null)
  const [filterType, setFilterType] = useState<string>('all')

  // Generate React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    if (!graph) return []

    return graph.nodes
      .filter((n) => {
        if (!showPredictions && n.type === 'prediction') return false
        if (filterType !== 'all' && n.type !== filterType) return false
        return true
      })
      .map((n, i) => {
        const coords = NODE_COORDINATES[n.id] || {
          x: 200 + (i % 4) * 240,
          y: 100 + Math.floor(i / 4) * 160,
        }
        return {
          id: n.id,
          type: 'custom',
          position: coords,
          data: n as unknown as Record<string, unknown>,
        }
      })
  }, [graph, showPredictions, filterType])

  // Generate React Flow edges
  const initialEdges: Edge[] = useMemo(() => {
    if (!graph) return []

    const validNodeIds = new Set(initialNodes.map((n) => n.id))

    return graph.edges
      .filter((e) => {
        if (!validNodeIds.has(e.source) || !validNodeIds.has(e.target)) return false
        if (!showPredictions && e.is_prediction) return false
        if (e.confidence && e.confidence < confidenceThreshold) return false
        return true
      })
      .map((e) => {
        const isPred = e.is_prediction || e.label === 'likely_next'
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          animated: isPred,
          style: {
            stroke: isPred ? '#a855f7' : '#06b6d4',
            strokeWidth: isPred ? 2.5 : 1.8,
            strokeDasharray: isPred ? '6,6' : undefined,
          },
          label: isPred && e.confidence ? `${e.label} (${Math.round(e.confidence * 100)}%)` : e.label,
          labelStyle: {
            fill: isPred ? '#d8b4fe' : '#94a3b8',
            fontSize: 10,
            fontFamily: 'monospace',
          },
          labelBgStyle: {
            fill: '#070b12',
            fillOpacity: 0.85,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isPred ? '#a855f7' : '#06b6d4',
          },
        }
      })
  }, [graph, initialNodes, showPredictions, confidenceThreshold])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    setNodes(initialNodes)
  }, [initialNodes, setNodes])

  useEffect(() => {
    setEdges(initialEdges)
  }, [initialEdges, setEdges])

  // Handle node selection
  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node.data as unknown as GraphNodeData)
  }, [])

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-100px)]">
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Network className="w-5 h-5 text-soc-cyan" />
            MITRE ATT&CK Causal Attack Graph
          </h1>
          <p className="text-xs text-soc-muted">
            Directed causal acyclic graph tracing attacker access, commands, technique mappings, and probabilistic forecasts
          </p>
        </div>

        {/* Action Controls & Session selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Session Selector */}
          <div className="flex items-center gap-1.5 bg-soc-card border border-soc-border rounded-lg px-2.5 py-1 text-xs font-mono">
            <span className="text-soc-muted">Session:</span>
            <select
              value={currentSessionId}
              onChange={(e) => setSearchParams({ session: e.target.value })}
              aria-label="Select Session for Causal Graph"
              className="bg-soc-surface text-cyan-300 font-bold focus:outline-none rounded px-1.5 py-0.5 border border-soc-border"
            >
              {sessions.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  #{s.session_id} ({s.source_ip})
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Predictions */}
          <button
            onClick={() => setShowPredictions(!showPredictions)}
            className={cn(
              'px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all',
              showPredictions
                ? 'bg-purple-950/60 border-purple-500/50 text-purple-300 shadow-glow-purple font-semibold'
                : 'bg-soc-card border-soc-border text-soc-muted hover:text-white'
            )}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            {showPredictions ? 'Predictions ON' : 'Predictions OFF'}
          </button>

          {/* Confidence threshold slider */}
          <div className="hidden lg:flex items-center gap-1.5 bg-soc-card border border-soc-border rounded-lg px-2.5 py-1 text-xs font-mono">
            <span className="text-soc-muted">Min Conf:</span>
            <input
              type="range"
              min="0.2"
              max="0.9"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="accent-soc-cyan cursor-pointer w-20"
            />
            <span className="text-soc-cyan font-bold">{Math.round(confidenceThreshold * 100)}%</span>
          </div>

          {/* Filter node types */}
          <div className="flex items-center gap-1 bg-soc-card border border-soc-border rounded-lg px-2.5 py-1 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-soc-cyan" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              aria-label="Filter Graph by Node Type"
              className="bg-transparent text-slate-200 focus:outline-none font-mono"
            >
              <option value="all">All Node Types</option>
              <option value="attacker">Attacker IPs</option>
              <option value="command">Commands Only</option>
              <option value="technique">Techniques Only</option>
              <option value="prediction">Predictions Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* React Flow Container */}
      <div className="flex-1 bg-soc-surface/90 border border-soc-border rounded-xl relative overflow-hidden shadow-2xl">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={0.3}
          maxZoom={1.8}
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls className="bg-soc-card border border-soc-border rounded-lg text-white" />
          <MiniMap
            nodeStrokeColor="#06b6d4"
            nodeColor="#0f172a"
            maskColor="rgba(7, 11, 18, 0.75)"
            className="bg-soc-card border border-soc-border rounded-lg overflow-hidden hidden md:block"
          />
        </ReactFlow>

        {/* Mini Legend Overlay in bottom-left */}
        <div className="absolute bottom-4 left-4 z-10 bg-soc-card/90 backdrop-blur-md border border-soc-border rounded-xl p-3 text-xs space-y-2 pointer-events-auto shadow-xl">
          <div className="font-mono text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-soc-cyan" />
            Causal Graph Legend
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-300">Attacker IP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-300">SSH Session</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-300">Auth Probe</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-slate-300">Command Exec</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300">MITRE Technique</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-purple-300 font-semibold">AI Forecast</span>
            </div>
          </div>
          <div className="pt-2 border-t border-soc-border/60 text-[10px] font-mono text-soc-muted flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-4 h-0.5 bg-soc-cyan inline-block" /> Solid: Observed
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-0.5 border-t border-dashed border-purple-400 inline-block" /> Dashed: Predicted
            </span>
          </div>
        </div>
      </div>

      {/* Node Evidence Inspection Drawer */}
      <Drawer
        isOpen={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        title={`Node Evidence: ${selectedNode?.label || ''}`}
        subtitle={`Type: ${selectedNode?.type?.toUpperCase() || ''}`}
        width="lg"
      >
        {selectedNode && (
          <div className="space-y-5 text-xs">
            {/* Header info */}
            <div className="p-3.5 bg-soc-card rounded-xl border border-soc-border space-y-1">
              <span className="text-[10px] font-mono uppercase text-soc-muted tracking-wider">
                Node Identifier
              </span>
              <div className="text-sm font-bold text-white font-mono">{selectedNode.id}</div>
              <div className="text-slate-300 font-medium">{selectedNode.label}</div>
            </div>

            {/* Type & Confidence */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-soc-card rounded-lg border border-soc-border">
                <span className="text-[10px] font-mono text-soc-muted uppercase">CLASSIFICATION</span>
                <p className="font-semibold text-white capitalize mt-0.5">
                  {selectedNode.type}
                </p>
              </div>
              <div className="p-3 bg-soc-card rounded-lg border border-soc-border">
                <span className="text-[10px] font-mono text-soc-muted uppercase">CONFIDENCE</span>
                <p className="font-semibold text-emerald-400 font-mono mt-0.5">
                  {selectedNode.confidence ? `${Math.round(selectedNode.confidence * 100)}%` : '100% (Direct Ground Truth)'}
                </p>
              </div>
            </div>

            {/* Evidence block */}
            {selectedNode.evidence && (
              <div className="space-y-1.5">
                <span className="font-mono text-soc-cyan font-semibold flex items-center gap-1.5">
                  <Terminal className="w-4 h-4" />
                  RAW EVIDENCE & COMMAND LOG
                </span>
                <div className="bg-black/90 border border-slate-800 rounded-lg p-3 font-mono text-cyan-200 select-all overflow-x-auto shadow-inner whitespace-pre-wrap">
                  {selectedNode.evidence}
                </div>
              </div>
            )}

            {/* MITRE technique reference */}
            {selectedNode.technique_id && (
              <div className="p-3.5 bg-soc-card rounded-lg border border-soc-border space-y-1.5">
                <span className="font-mono text-soc-muted text-[10px] uppercase">
                  Associated MITRE Technique
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-soc-cyan text-sm">
                    {selectedNode.technique_id}
                  </span>
                  {selectedNode.tactic && (
                    <span className="text-soc-muted">({selectedNode.tactic})</span>
                  )}
                </div>
              </div>
            )}

            {/* Structured details object if present */}
            {selectedNode.details && (
              <div className="space-y-1.5">
                <span className="font-mono text-soc-muted text-[10px] uppercase">
                  Additional Sensor Metadata
                </span>
                <pre className="p-3 bg-black/80 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300 overflow-x-auto">
                  {JSON.stringify(selectedNode.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
