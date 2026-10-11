export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type ActorType =
  | 'automated_scanner'
  | 'credential_stuffer'
  | 'interactive_attacker'
  | 'discovery_heavy'
  | 'persistence_attempt'
  | 'botnet_dropper';

export type EventType =
  | 'login_attempt'
  | 'successful_login'
  | 'command_execution'
  | 'file_download'
  | 'file_upload'
  | 'session_closed'
  | 'port_scan';

export interface HealthStatus {
  status: 'online' | 'degraded' | 'offline';
  timestamp: string;
  version: string;
  honeypot_nodes: number;
  active_sessions_count: number;
  engine_latency_ms: number;
}

export interface AttackSession {
  session_id: string;
  source_ip: string;
  start_time: string;
  end_time?: string | null;
  duration_seconds: number;
  login_attempts: number;
  successful_login: boolean;
  commands_executed: number;
  risk_score: number;
  actor_type: ActorType;
  techniques: string[];
  status: 'active' | 'closed';
  country?: string;
  city?: string;
  asn?: string;
}

export interface TelemetryEvent {
  event_id: string;
  timestamp: string;
  source_ip: string;
  session_id: string;
  event_type: EventType;
  command?: string;
  username?: string;
  password_attempt?: string;
  file_name?: string;
  file_hash?: string;
  success: boolean;
  technique_id?: string;
  technique_name?: string;
  tactic?: string;
  risk_level: RiskLevel;
  raw_payload?: string;
  confidence?: number;
}

export interface TechniqueMapping {
  event_id: string;
  technique_id: string;
  technique_name: string;
  tactic: string;
  confidence: number;
  evidence: string;
}

export interface BehavioralProfile {
  actor_type: ActorType;
  automation_score: number; // 0 to 1
  discovery_score: number;
  persistence_score: number;
  credential_activity_score: number;
  command_diversity: number;
  session_depth: number;
}

export interface AttackPrediction {
  next_technique_id: string;
  next_technique_name: string;
  tactic?: string;
  confidence: number;
  reason: string;
  evidence_commands?: string[];
}

export interface SessionDetail extends AttackSession {
  events: TelemetryEvent[];
  technique_mappings: TechniqueMapping[];
  behavioral_profile: BehavioralProfile;
  predictions: AttackPrediction[];
  recommended_actions?: string[];
}

export type GraphNodeType =
  | 'attacker'
  | 'session'
  | 'login'
  | 'command'
  | 'file'
  | 'technique'
  | 'prediction';

export type GraphEdgeType =
  | 'initiated'
  | 'attempted_login'
  | 'authenticated'
  | 'executed'
  | 'downloaded'
  | 'mapped_to'
  | 'enables'
  | 'likely_next';

export interface GraphNodeData {
  [key: string]: any;
  id: string;
  type: GraphNodeType;
  label: string;
  sublabel?: string;
  risk_level?: RiskLevel;
  confidence?: number;
  evidence?: string;
  technique_id?: string;
  tactic?: string;
  timestamp?: string;
  details?: Record<string, any>;
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  label: GraphEdgeType | string;
  confidence?: number;
  is_prediction?: boolean;
}

export interface AttackGraphData {
  session_id?: string;
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
}

export interface HeatmapItem {
  technique_id: string;
  technique_name: string;
  tactic: string;
  count: number;
  risk_level: RiskLevel;
  description?: string;
  sample_commands?: string[];
  associated_sessions?: string[];
  confidence?: number;
}

export interface ThreatActor {
  source_ip: string;
  actor_type: ActorType;
  sessions_count: number;
  total_commands: number;
  first_seen: string;
  last_seen: string;
  top_techniques: string[];
  risk_score: number;
  country?: string;
  country_code?: string;
  behavioral_tags: string[];
  behavioral_scores?: {
    automation: number;
    discovery: number;
    persistence: number;
    evasion: number;
  };
  predictions?: AttackPrediction[];
  recent_session_ids?: string[];
}

export interface OverviewMetrics {
  active_sessions_count: number;
  unique_attackers_count: number;
  total_commands_executed: number;
  total_login_attempts: number;
  high_risk_sessions_count: number;
  detected_techniques_count: number;
}

export interface DemoStep {
  stepIndex: number;
  title: string;
  stageName: string;
  narrative: string;
  sessionId: string;
  sourceIp: string;
  addedEvent: TelemetryEvent;
  addedTechnique?: string;
  predictionTriggered?: AttackPrediction;
}
