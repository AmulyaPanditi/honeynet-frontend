# Autonomous Honeynet Telemetry & Threat Actor MITRE ATT&CK Causal Graph Profiler

A SOC & Threat Intelligence frontend prototype built for cybersecurity hackathons. This application ingests real-time attacker activity captured by a Cowrie honeypot, correlates observed commands and authentication waves against the **MITRE ATT&CK Framework**, constructs a **Causal Attack Graph** using directed acyclic graph (DAG) modeling, and generates **probabilistic next-action forecasts** for SOC analysts.

---

## 🚀 Key Features & Modules

### 1. 🛡️ SOC Overview Dashboard
- **KPI Metrics**: Active honeynet sessions, unique perimeter adversary IPs, commands intercepted, authentication probes, high-risk sessions, and unique ATT&CK techniques mapped.
- **24-Hour Attack Ingress Velocity**: Multi-stream area chart showing ingress attack events vs. dictionary auth probes.
- **Risk Severity Profiling**: Real-time donut chart categorizing intruder sessions into Critical, High, Medium, and Low risk.
- **Top ATT&CK Techniques**: Ranked horizontal bar chart visualizing the most frequently observed adversary techniques.
- **Live Feed Preview & Active Sessions**: Instant drill-down to active sessions and telemetry streams.

### 2. ⚡ Live Telemetry Stream
- **Sub-Second Event Stream**: Chronological event table with auto-polling (every 4 seconds) or simulated event injection in Demo Mode.
- **Multi-Dimensional Filters**: Filter by Source IP, Honeynet Session ID, Event Type (Command Exec, Login Attempt, Auth Success, Payload Download, Port Scan), Risk Level, and Technique ID.
- **Monospace Code Inspection**: Clear terminal command rendering (`uname -a`, `cat /etc/passwd`, `curl payload.sh`).
- **Telemetry Event Drawer**: Click any event to inspect normalized JSON telemetry, raw Cowrie sensor evidence, and ATT&CK mapping confidence.
- **Export Telemetry**: One-click JSON export for offline SIEM/Splunk ingestion.

### 3. 🎯 Attack Sessions Registry
- **Comprehensive Session Table**: Status indicator (Active/Closed), IP origin, duration, auth outcomes, and command counters.
- **Multi-Column Sorting**: Sort by Risk Score, Start Time, Session Duration, Login Attempts, or Commands Executed.
- **Behavioral Profile Badges**: Immediate categorization of attackers into *Interactive Attacker*, *Botnet Dropper*, *Credential Stuffer*, *Discovery Scout*, *Persistence Operator*, or *Automated Scanner*.

### 4. 🔬 Session Detail Module (Key Jury-Facing Screen)
Organized into an analyst-first **3-column SOC layout**:
- **Left Column**: Session summary, attacker IP origin, duration, login attempts, authentication breach status, network ASN, and **radial risk score gauge (0–100)**.
- **Middle Column**: **Chronological Attack Timeline** color-coded by event type with monospace command display, MITRE technique badges, and expandable accordions revealing raw Cowrie telemetry packets.
- **Right Column**: **Behavioral Profile Metrics** (Automation Score, Discovery Depth, Persistence Drive, Credential Activity), command diversity counters, session depth gauge, **probabilistic next actions**, and a **recommended analyst response playbook**.

### 5. 🕸️ MITRE ATT&CK Causal Attack Graph
- **Interactive Graph Canvas**: Built using modern `@xyflow/react` (React Flow).
- **Distinct Node Types**:
  - 🔴 **Attacker IP**: Perimeter source host
  - 🔵 **SSH Session**: Cowrie listener channel
  - 🟡 **Auth Probe / Login**: Credential attempts and privilege elevation
  - 🔷 **Command Exec**: Executed terminal commands
  - 🟣 **File Activity**: Downloaded payload scripts and hashes
  - 🟢 **MITRE Technique**: Mapped ATT&CK technique with tactic category
  - 🔮 **AI Forecast**: Probabilistic projected next action
- **Causal Edge Semantics**:
  - Solid cyan arrows: Observed causal links (`initiated`, `attempted_login`, `authenticated`, `executed`, `downloaded`, `mapped_to`)
  - Dashed purple arrows with live badge: Probabilistic forecasts (`likely_next` with likelihood %)
- **Graph Controls**: Zoom in/out, fit view, node type filters, minimum confidence slider, and an **evidence inspection drawer** when clicking any node.

### 6. 📊 MITRE ATT&CK Heat Map Matrix
- **Tactics Matrix Layout**: Grouped across 14 enterprise ATT&CK tactics (*Initial Access*, *Execution*, *Persistence*, *Privilege Escalation*, *Defense Evasion*, *Credential Access*, *Discovery*, *Lateral Movement*, *Collection*, *C2*, *Exfiltration*, *Impact*).
- **Dual Heatmap Modes**: Toggle between **Frequency Intensity** (detection count) and **Risk Severity**.
- **Technique Detail Sidepanel**: Full ATT&CK description, observed honeynet execution commands, linked sessions, and direct link to official MITRE documentation.

### 7. 👤 Threat Actor Intelligence Profiles
- **Cluster Cards**: Candidate threat actors grouped by source IP with behavioral tags and first/last seen timestamps.
- **Cluster Behavioral Dimensions**: Bar gauges measuring automation tendency, discovery intensity, persistence drive, and evasion.
- **Forensic Disclaimer**: Prominent adherence to forensic standards stating profiles are behavioral candidates rather than definitive real-world legal attribution.

### 8. 🔮 Probabilistic Predictions Module
- **Trajectory Forecasts**: Projects upcoming techniques based on observed Markovian and graph causal chains.
- **Confidence Sliders & Filters**: Filter predictions by minimum confidence, actor type, or target technique.
- **Analyst Decision Support**: Shows triggering command evidence and causal justification for every projection.

---

## 🛠️ Tech Stack

- **Framework**: React 18 with Vite and TypeScript
- **Styling**: Tailwind CSS (Tailwind v3 with customized SOC dark theme, neon glows, and custom scrollbars)
- **Routing**: React Router DOM v6
- **Graph Visualization**: `@xyflow/react` (React Flow v12)
- **Charts & Data Viz**: Recharts (Area charts, bar charts, donut charts)
- **Icons**: Lucide React
- **API Layer**: REST API client with automatic mock fallback and environment-variable switching

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- pnpm (or npm / yarn)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend REST API service (e.g., `http://localhost:8000`). If empty, the app runs in **Standalone Mock / Demo Mode**. | *(empty)* |

### 3. Run Locally in Development Mode
```bash
pnpm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Build for Production
```bash
pnpm run build
pnpm run preview
```

---

## 🔌 Connecting to a Real Backend

The frontend communicates with standard REST endpoints:

| Endpoint | Method | Response Description |
|---|---|---|
| `/api/health` | GET | Returns service status, honeypot nodes count, and latency |
| `/api/sessions` | GET | List of all captured attack sessions |
| `/api/sessions/:sessionId` | GET | Detailed session with events, mappings, behavioral profile, and predictions |
| `/api/graph/:sessionId` | GET | Graph nodes and directed causal edges for React Flow |
| `/api/attack-heatmap` | GET | MITRE technique counts, tactics, and risk levels |
| `/api/actors` | GET | Grouped threat actor profiles by source IP |
| `/api/live-events` | GET | Normalized Cowrie telemetry stream |

### How to Switch Between Mock and Live API Mode
- **Live Backend Mode**: Set `VITE_API_BASE_URL=http://localhost:8000` in `.env` and restart the dev server. The top bar health indicator will show `API Online` (green).
- **Demo / Mock Mode**: Toggle the **Demo Mode** switch in the top bar or leave `VITE_API_BASE_URL` empty. If the backend is unreachable, the frontend gracefully falls back to mock data without crashing or showing broken screens.

---

## 🏆 Hackathon Presentation & Live Demo Guide (5–10 Minutes)

Use this step-by-step walkthrough during your live jury pitch:

1. **The Hook (Overview Dashboard - 1 min)**:
   - Start on the **Overview** page (`/`).
   - Highlight the **KPI Cards**: Explain that this frontend is monitoring a live Cowrie honeypot network intercepting real-world automated and interactive attacks.
   - Point out the **Ingress Velocity Chart** and **Risk Profiling Donut**.

2. **The Progression (Demo Stepper - 2 mins)**:
   - In the top bar, show the **Stage Stepper** (`Stage 1/7` to `Stage 7/7`).
   - Step through the 7 stages of an attack:
     - **Stage 1 (Port Scan)**: Attacker scans port 2222.
     - **Stage 2 (Brute Force)**: Dictionary password spray.
     - **Stage 3 (Breach)**: Successful login using `root:password`.
     - **Stage 4 (Discovery)**: Attacker runs `uname -a` and `whoami`.
     - **Stage 5 (File Recon)**: Attacker inspects `/etc/passwd`.
     - **Stage 6 (Payload Dropper)**: Attacker downloads `payload.sh` via `curl`.
     - **Stage 7 (Graph Forecast)**: Attacker installs crontab persistence; AI predicts outbound C2 beaconing.
   - Notice how the live telemetry feed and session counters update dynamically!

3. **The Jury Deep-Dive (Session Detail - 2 mins)**:
   - Navigate to **Attack Sessions** (`/sessions`) and click **Session #abc123**.
   - Walk the jury through the **3-Column Screen**:
     - *Left*: Explain the **82/100 Risk Score** and candidate classification (*Interactive Attacker*).
     - *Middle*: Walk down the **Chronological Attack Timeline**. Expand an event to reveal the raw normalized Cowrie JSON telemetry.
     - *Right*: Point out the **Behavioral Metrics** (Automation 18%, Discovery 91%, Persistence 84%) and **Recommended Analyst Playbook**.

4. **The "Wow" Factor (Causal Attack Graph - 2 mins)**:
   - Click **Explore Causal Attack Graph** (`/graph?session=abc123`).
   - Show how the graph visually connects the attacker IP (`10.20.30.40`) → SSH session → commands executed → MITRE techniques mapped (`T1082`, `T1083`, `T1105`).
   - Highlight the **Dashed Purple Edges**: Explain that the engine is predicting the next likely technique (`T1071 C2 Web Beaconing` with 82% confidence).
   - Click a node to open the **Evidence Drawer** showing the underlying terminal command.

5. **Closing (Heat Map & Predictions - 1 min)**:
   - Switch to **ATT&CK Heat Map** (`/heatmap`) to show coverage across the 14 MITRE tactics.
   - Navigate to **Predictions** (`/predictions`) to emphasize the explainability of the probabilistic models and the analyst-first decision support design.

---

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── common/         # Reusable UI (KpiCard, RiskBadge, TechniqueBadge, ScoreBar, Drawer, Modal, EventRow, TimelineItem, etc.)
│   │   ├── graph/          # React Flow custom node components
│   │   └── layout/         # Persistent AppShell, Sidebar, TopBar with Demo Controller
│   ├── context/            # DemoContext for simulated multi-stage attack playback
│   ├── hooks/              # useSessions, useSessionDetail, useLiveEvents, useAttackHeatmap, useActors, useGraph, usePredictions, usePolling
│   ├── pages/              # Overview, LiveTelemetry, AttackSessions, SessionDetail, AttackHeatmap, ThreatActors, CausalGraph, Predictions
│   ├── services/           # api.ts (REST client with mock fallback) & mockData.ts (realistic Cowrie honeynet logs & MITRE graph)
│   ├── types/              # Comprehensive TypeScript interfaces matching backend API contracts
│   ├── utils/              # Formatting helpers, risk colors, MITRE tactic styling, clsx wrapper
│   ├── App.tsx             # Route definitions
│   ├── main.tsx            # Entry point
│   └── index.css           # Tailwind directives, cyber dark scrollbars, React Flow SOC theme
├── index.html              # Google Fonts (Inter & JetBrains Mono) & cyber favicon
├── tailwind.config.js      # SOC color palette (cyan, rose, amber, emerald, purple) & glow utilities
├── vite.config.ts          # Vite configuration with path aliases (@/*)
└── package.json            # Project dependencies & scripts
```

---

## 📜 License
MIT License - Created for cybersecurity hackathon prototypes.
