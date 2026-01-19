import { useState } from 'react'
import { 
  ChevronDown, 
  Activity, 
  ShieldCheck, 
  ClipboardCheck, 
  Rocket, 
  History, 
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  Code2,
  Globe,
  TestTube2,
  Archive as ArchiveIcon,
  Search,
  X
} from 'lucide-react'
import WorkspaceShell from './components/layout/WorkspaceShell'

const DASHBOARD_METRICS = [
  { label: 'Project Health', value: 'Stable', sub: '488 active nodes', icon: Activity, color: 'text-emerald-500' },
  { label: 'Compliance Risk', value: '0.02%', sub: '2 unlinked reqs', icon: ShieldCheck, color: 'text-slate-400' },
  { label: 'Pending Approvals', value: '03', sub: '2 priority gates', icon: ClipboardCheck, color: 'text-rose-500' },
  { label: 'Active Env', value: 'Staging', sub: 'v2.4.0-rc1', icon: Rocket, color: 'text-blue-500' },
]

const INITIAL_INTEL_EVENTS = [
  { id: 'DEC-042', type: 'Architecture Decision', desc: 'Migration to Micro-frontends', actor: 'Hemant Chaudhary', time: '2h ago', status: 'Approved' },
  { id: 'REQ-881', type: 'Requirement Update', desc: 'Added compliance validation to API', actor: 'Sarah Chen', time: '4h ago', status: 'Pending' },
  { id: 'TST-102', type: 'Test Execution', desc: 'Critical Path Verification: PASS', actor: 'CI/CD Bot', time: '6h ago', status: 'Verified' },
  { id: 'REL-004', type: 'Governance Gate', desc: 'Staging Release Approval', actor: 'Michael Ross', time: '1d ago', status: 'Approved' },
]

function Dashboard({ onNewDecision, events }: { onNewDecision: () => void, events: typeof INITIAL_INTEL_EVENTS }) {
  return (
    <div className="flex flex-col gap-space-4">
      {/* Header Section */}
      <header className="flex items-center justify-between">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-space-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Alpha</h1>
            <span className="px-8 py-2 bg-slate-100 text-slate-500 rounded-4 text-[10px] font-bold uppercase tracking-widest border border-slate-200">v2.4.0</span>
          </div>
          <div className="flex items-center gap-12">
            <span className="flex items-center gap-6 text-xs text-slate-500">
              <div className="w-8 h-8 bg-emerald-500 rounded-full ring-2 ring-emerald-500/20" />
              Active Phase: <span className="font-bold text-slate-700 uppercase tracking-wide">Development</span>
            </span>
            <span className="w-px h-12 bg-slate-200" />
            <p className="text-xs text-slate-500 font-medium italic">Last intelligence sync: 2m ago</p>
          </div>
        </div>
        <div className="flex gap-space-2">
          <button className="px-space-2 py-space-1 bg-white border border-neutral-border rounded-4 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-sm">
            View Audit Trail
          </button>
          <button 
            onClick={onNewDecision}
            className="px-space-2 py-space-1 bg-brand-accent text-white rounded-4 text-xs font-bold hover:bg-blue-600 active:scale-95 transition-all shadow-sm shadow-brand-accent/20"
          >
            New Decision Record
          </button>
        </div>
      </header>

      {/* Intelligence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-space-3">
        {DASHBOARD_METRICS.map((m) => (
          <div key={m.label} className="governed-card flex flex-col gap-space-2 group cursor-default hover:border-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{m.label}</span>
              <m.icon className={`w-12 h-12 ${m.color}`} />
            </div>
            <div className="flex items-baseline gap-space-1">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{m.value}</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed text-left font-medium">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Traceability & Intelligence Surface */}
      <div className="bg-white border border-neutral-border rounded-4 overflow-hidden shadow-sm">
        <div className="px-space-3 py-space-2 border-b border-neutral-border flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-space-1">
            <History className="w-14 h-14 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">Recent Project Intelligence</h3>
          </div>
          <button className="text-xs text-brand-accent font-bold hover:underline">Full Audit Trail</button>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th className="w-[120px]">Identity</th>
                <th>Intelligence Event</th>
                <th className="w-[180px]">Actor</th>
                <th className="w-[120px]">Timestamp</th>
                <th className="w-[100px] text-right">Status</th>
                <th className="w-[60px] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="group cursor-pointer">
                  <td className="font-bold text-slate-900">{event.id}</td>
                  <td className="text-left">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-700">{event.type}</span>
                      <span className="text-xs text-slate-500">{event.desc}</span>
                    </div>
                  </td>
                  <td className="text-left">
                    <div className="flex items-center gap-8 text-xs text-slate-600">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border border-slate-200">
                        <User className="w-12 h-12 text-slate-400" />
                      </div>
                      <span>{event.actor}</span>
                    </div>
                  </td>
                  <td className="text-slate-500 text-xs text-left">{event.time}</td>
                  <td className="text-right">
                    <span className={`text-[11px] font-bold px-8 py-2 rounded-4 uppercase tracking-tighter ${
                      event.status === 'Approved' || event.status === 'Verified' 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="p-4 hover:bg-slate-100 rounded-4 transition-colors">
                      <ChevronDown className="w-12 h-12 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function GovernanceView() {
  const gates = [
    { id: 'G-01', name: 'Architecture Review', status: 'Passed', date: '2024-01-10', owner: 'Technical Board' },
    { id: 'G-02', name: 'Security Sign-off', status: 'Passed', date: '2024-01-12', owner: 'Security Team' },
    { id: 'G-03', name: 'Product Quality Gate', status: 'Pending', date: 'Pending', owner: 'Product QA' },
  ]

  return (
    <div className="flex flex-col gap-space-4 text-left">
      <header className="flex items-center justify-between">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Release & Governance</h1>
          <p className="text-xs text-slate-500 italic">"Is this ready for the world?" • Compliance & Quality Gates</p>
        </div>
        <button className="px-space-2 py-space-1 bg-brand-accent text-white rounded-4 text-xs font-bold hover:bg-blue-600 transition-all shadow-sm">
          Submit for Approval
        </button>
      </header>

      <div className="bg-white border border-neutral-border rounded-4 overflow-hidden">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th className="w-[80px]">ID</th>
              <th>Governance Gate</th>
              <th className="w-[120px]">Status</th>
              <th className="w-[120px]">Completion</th>
              <th className="text-right">Owner</th>
            </tr>
          </thead>
          <tbody>
            {gates.map((gate) => (
              <tr key={gate.id} className="hover:bg-slate-50">
                <td className="font-bold text-slate-400">{gate.id}</td>
                <td className="font-bold text-slate-900">{gate.name}</td>
                <td>
                  <span className={`text-[9px] font-bold px-8 py-2 rounded-4 uppercase border ${
                    gate.status === 'Passed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                  }`}>
                    {gate.status}
                  </span>
                </td>
                <td className="text-xs text-slate-500">{gate.date}</td>
                <td className="text-right text-xs font-medium text-slate-600">{gate.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ArchiveView() {
  const history = [
    { version: 'v2.3.0', date: '2023-12-15', changes: 142, artifacts: 'Full', status: 'Archived' },
    { version: 'v2.2.0', date: '2023-11-20', changes: 89, artifacts: 'Partial', status: 'Archived' },
    { version: 'v2.1.0', date: '2023-10-05', changes: 210, artifacts: 'Full', status: 'Archived' },
  ]

  return (
    <div className="flex flex-col gap-space-4 text-left">
      <header className="flex items-center justify-between">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Historical Record</h1>
          <p className="text-xs text-slate-500 italic">"What did we do before?" • Preservation of Superseded Knowledge</p>
        </div>
      </header>

      <div className="bg-white border border-neutral-border rounded-4 overflow-hidden">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Version</th>
              <th>Release Date</th>
              <th>Change Count</th>
              <th>Artifact Retention</th>
              <th className="text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.version} className="hover:bg-slate-50">
                <td className="font-bold text-slate-900">{h.version}</td>
                <td className="text-xs text-slate-500">{h.date}</td>
                <td className="text-xs font-bold text-slate-700">{h.changes} commits</td>
                <td className="text-xs text-slate-500">{h.artifacts}</td>
                <td className="text-right">
                  <span className="text-[9px] font-bold px-8 py-2 rounded-4 uppercase bg-slate-100 text-slate-500">
                    {h.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DeploymentView() {
  const deployments = [
    { env: 'Production', version: 'v2.3.9', status: 'Healthy', cluster: 'us-east-1', traffic: '100%' },
    { env: 'Staging', version: 'v2.4.0-rc1', status: 'Healthy', cluster: 'us-east-1', traffic: '0%' },
    { env: 'Development', version: 'v2.4.0-nightly', status: 'Degraded', cluster: 'us-west-2', traffic: '0%' },
  ]

  return (
    <div className="flex flex-col gap-space-4 text-left">
      <header className="flex items-center justify-between">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Deployment & Infrastructure</h1>
          <p className="text-xs text-slate-500 italic">"Where does this live?" • Environments & Orchestration</p>
        </div>
        <div className="flex gap-space-2">
          <button className="px-space-2 py-space-1 bg-brand-accent text-white rounded-4 text-xs font-bold hover:bg-blue-600 transition-all shadow-sm">
            Deploy New Version
          </button>
        </div>
      </header>

      <div className="bg-white border border-neutral-border rounded-4 overflow-hidden">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Environment</th>
              <th className="w-[120px]">Version</th>
              <th className="w-[100px]">Status</th>
              <th className="w-[120px]">Cluster</th>
              <th className="w-[100px] text-right">Traffic</th>
            </tr>
          </thead>
          <tbody>
            {deployments.map((dep) => (
              <tr key={dep.env} className="hover:bg-slate-50">
                <td className="font-bold text-slate-900">{dep.env}</td>
                <td className="font-mono text-xs text-slate-500">{dep.version}</td>
                <td>
                  <span className={`flex items-center gap-4 text-[10px] font-bold uppercase ${
                    dep.status === 'Healthy' ? 'text-emerald-500' : 'text-amber-500'
                  }`}>
                    <div className={`w-6 h-6 rounded-full ${dep.status === 'Healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {dep.status}
                  </span>
                </td>
                <td className="text-xs text-slate-500">{dep.cluster}</td>
                <td className="text-right text-xs font-bold text-slate-700">{dep.traffic}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SecurityView() {
  const securityMetrics = [
    { label: 'Vulnerabilities', value: '0', sub: 'All critical fixed', status: 'Secure' },
    { label: 'Secrets Scanned', value: '1,204', sub: 'No leaks detected', status: 'Secure' },
    { label: 'Auth Failures', value: '0.01%', sub: 'Within threshold', status: 'Secure' },
  ]

  return (
    <div className="flex flex-col gap-space-4 text-left">
      <header className="flex items-center justify-between">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Governance & Control</h1>
          <p className="text-xs text-slate-500 italic">"Who approved what and when?" • Authority & Incident Logs</p>
        </div>
        <button className="px-space-2 py-space-1 bg-rose-500 text-white rounded-4 text-xs font-bold hover:bg-rose-600 transition-all shadow-sm">
          Run Security Audit
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-3">
        {securityMetrics.map((m) => (
          <div key={m.label} className="governed-card flex flex-col gap-space-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{m.value}</span>
              <span className="text-[9px] font-bold text-emerald-600 uppercase bg-emerald-50 px-6 py-2 rounded-4">
                {m.status}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 text-white p-space-3 rounded-4 font-mono text-xs overflow-hidden relative group">
        <div className="flex items-center justify-between mb-space-2">
          <span className="flex items-center gap-8">
            <div className="w-8 h-8 bg-emerald-500 rounded-full" />
            Live Security Feed
          </span>
          <span className="text-slate-500">Real-time</span>
        </div>
        <div className="space-y-2 opacity-80">
          <p className="text-emerald-400">[INFO] Scan initiated for anchor-api-gateway</p>
          <p className="text-slate-400">[PASS] 12 security gates verified</p>
          <p className="text-slate-400">[PASS] No secrets found in latest commit (3a92b1)</p>
          <p className="text-emerald-400">[IDLE] Monitoring production traffic...</p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  )
}

function APIView() {
  const endpoints = [
    { method: 'POST', path: '/v1/auth/verify', status: 'Production', uptime: '99.99%', latency: '45ms' },
    { method: 'GET', path: '/v1/traceability/graph', status: 'Production', uptime: '99.95%', latency: '120ms' },
    { method: 'PUT', path: '/v1/requirements/:id', status: 'Staging', uptime: '98.50%', latency: '60ms' },
  ]

  return (
    <div className="flex flex-col gap-space-4 text-left">
      <header className="flex items-center justify-between">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">API Management</h1>
          <p className="text-xs text-slate-500 italic">"How does this connect?" • Integration & Contracts</p>
        </div>
        <div className="flex gap-space-2">
          <button className="px-space-2 py-space-1 bg-brand-accent text-white rounded-4 text-xs font-bold hover:bg-blue-600 transition-all shadow-sm">
            API Docs
          </button>
        </div>
      </header>

      <div className="bg-white border border-neutral-border rounded-4 overflow-hidden">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th className="w-[100px]">Method</th>
              <th>Endpoint Path</th>
              <th className="w-[120px]">Environment</th>
              <th className="w-[100px]">Uptime</th>
              <th className="w-[100px] text-right">Latency</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((ep) => (
              <tr key={ep.path} className="hover:bg-slate-50">
                <td>
                  <span className={`text-[10px] font-bold px-8 py-2 rounded-4 border ${
                    ep.method === 'GET' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    ep.method === 'POST' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {ep.method}
                  </span>
                </td>
                <td className="font-mono text-xs text-slate-700">{ep.path}</td>
                <td className="text-xs font-medium text-slate-500">{ep.status}</td>
                <td className="text-xs font-bold text-emerald-600">{ep.uptime}</td>
                <td className="text-right text-xs text-slate-400 font-mono">{ep.latency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TestingView() {
  const testSuites = [
    { name: 'Core Logic - Unit', tests: 450, passed: 450, failed: 0, coverage: '98%', status: 'Passed' },
    { name: 'Identity Flow - E2E', tests: 42, passed: 40, failed: 2, coverage: '85%', status: 'Failed' },
    { name: 'Traceability - Integration', tests: 120, passed: 120, failed: 0, coverage: '92%', status: 'Passed' },
  ]

  return (
    <div className="flex flex-col gap-space-4 text-left">
      <header className="flex items-center justify-between">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quality & Testing</h1>
          <p className="text-xs text-slate-500 italic">"Is this working correctly?" • Verification & Validation</p>
        </div>
        <button className="px-space-2 py-space-1 bg-brand-accent text-white rounded-4 text-xs font-bold hover:bg-blue-600 transition-all shadow-sm">
          Run All Tests
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-3">
        {testSuites.map((suite) => (
          <div key={suite.name} className="governed-card flex flex-col gap-space-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">{suite.name}</h3>
              <span className={`text-[9px] font-bold px-6 py-2 rounded-4 uppercase ${
                suite.status === 'Passed' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {suite.status}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-bold uppercase">Pass Rate</span>
                <span className="font-bold text-slate-700">{Math.round((suite.passed / suite.tests) * 100)}%</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${suite.status === 'Passed' ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                  style={{ width: `${(suite.passed / suite.tests) * 100}%` }} 
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-slate-50">
              <span className="text-[10px] text-slate-500 font-medium">{suite.tests} tests executed</span>
              <span className="text-[10px] font-bold text-brand-accent cursor-pointer hover:underline">Details</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DesignView() {
  const architectures = [
    { id: 'ARC-001', name: 'Micro-frontend Core', type: 'Architecture', status: 'Approved', complexity: 'High', artifacts: 12 },
    { id: 'SCH-042', name: 'Auth Schema v2', type: 'Database Schema', status: 'In Review', complexity: 'Medium', artifacts: 4 },
    { id: 'UX-109', name: 'Intelligence Dashboard Flow', type: 'UX Flow', status: 'Draft', complexity: 'High', artifacts: 8 },
  ]

  return (
    <div className="flex flex-col gap-space-4 text-left">
      <header className="flex items-center justify-between">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Design & Architecture</h1>
          <p className="text-xs text-slate-500 italic">"How is this supposed to work?" • Structural Blueprint</p>
        </div>
        <div className="flex gap-space-2">
          <button className="px-space-2 py-space-1 bg-white border border-neutral-border rounded-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            Export Diagrams
          </button>
          <button className="px-space-2 py-space-1 bg-brand-accent text-white rounded-4 text-xs font-bold hover:bg-blue-600 transition-all shadow-sm">
            New Component
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-3">
        {architectures.map((arch) => (
          <div key={arch.id} className="governed-card flex flex-col gap-space-3 group">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{arch.id}</span>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-accent transition-colors">{arch.name}</h3>
              </div>
              <span className={`text-[9px] font-bold px-6 py-2 rounded-4 uppercase ${
                arch.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {arch.status}
              </span>
            </div>
            
            <div className="flex items-center gap-12 py-8 border-y border-slate-50">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Complexity</span>
                <span className="text-xs font-semibold text-slate-700">{arch.complexity}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Artifacts</span>
                <span className="text-xs font-semibold text-slate-700">{arch.artifacts} files</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-500">{arch.type}</span>
              <button className="text-[10px] font-bold text-brand-accent hover:underline">View Blueprint</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DevelopmentView() {
  const repositories = [
    { name: 'anchor-core', branch: 'main', health: 'Healthy', coverage: '94%', lastCommit: 'Fix: Auth handshake', time: '12m ago' },
    { name: 'anchor-ui-kit', branch: 'develop', health: 'Healthy', coverage: '88%', lastCommit: 'Feat: Data tables', time: '1h ago' },
    { name: 'anchor-api-gateway', branch: 'feat/v2-auth', health: 'Degraded', coverage: '72%', lastCommit: 'WIP: Migration', time: '3h ago' },
  ]

  return (
    <div className="flex flex-col gap-space-4 text-left">
      <header className="flex items-center justify-between">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Development</h1>
          <p className="text-xs text-slate-500 italic">"How is this being built?" • Execution & Codebase</p>
        </div>
        <div className="flex gap-space-2">
          <button className="px-space-2 py-space-1 bg-white border border-neutral-border rounded-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            CI/CD Pipeline
          </button>
          <button className="px-space-2 py-space-1 bg-brand-accent text-white rounded-4 text-xs font-bold hover:bg-blue-600 transition-all shadow-sm">
            Create PR
          </button>
        </div>
      </header>

      <div className="bg-white border border-neutral-border rounded-4 overflow-hidden shadow-sm">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Repository</th>
              <th className="w-[150px]">Branch</th>
              <th className="w-[100px]">Health</th>
              <th className="w-[100px]">Coverage</th>
              <th>Latest Activity</th>
              <th className="w-[100px] text-right">Age</th>
            </tr>
          </thead>
          <tbody>
            {repositories.map((repo) => (
              <tr key={repo.name} className="hover:bg-slate-50 cursor-pointer group">
                <td>
                  <div className="flex items-center gap-8">
                    <Code2 className="w-14 h-14 text-slate-400 group-hover:text-brand-accent" />
                    <span className="font-bold text-slate-900">{repo.name}</span>
                  </div>
                </td>
                <td className="font-mono text-[11px] text-slate-500">{repo.branch}</td>
                <td>
                  <span className={`flex items-center gap-4 text-[10px] font-bold uppercase ${
                    repo.health === 'Healthy' ? 'text-emerald-500' : 'text-amber-500'
                  }`}>
                    <div className={`w-6 h-6 rounded-full ${repo.health === 'Healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {repo.health}
                  </span>
                </td>
                <td className="font-bold text-slate-700 text-xs">{repo.coverage}</td>
                <td>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-700">{repo.lastCommit}</span>
                  </div>
                </td>
                <td className="text-right text-[10px] text-slate-400 font-medium">{repo.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RequirementsView() {
  const requirements = [
    { id: 'REQ-001', title: 'System Authentication', priority: 'High', status: 'Approved', coverage: '100%', owner: 'Security Team' },
    { id: 'REQ-002', title: 'Audit Trail Persistence', priority: 'High', status: 'Approved', coverage: '85%', owner: 'Platform Team' },
    { id: 'REQ-003', title: 'Real-time Traceability Graph', priority: 'Medium', status: 'In Review', coverage: '0%', owner: 'UI/UX Team' },
  ]

  return (
    <div className="flex flex-col gap-space-4 text-left">
      <header className="flex items-center justify-between">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Requirements</h1>
          <p className="text-xs text-slate-500 italic">"Why are we building this?" • Business & Product Needs</p>
        </div>
        <div className="flex gap-space-2">
          <button className="px-space-2 py-space-1 bg-brand-accent text-white rounded-4 text-xs font-bold hover:bg-blue-600 transition-all shadow-sm">
            Import PRD
          </button>
        </div>
      </header>

      <div className="bg-white border border-neutral-border rounded-4 overflow-hidden shadow-sm">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th className="w-[100px]">ID</th>
              <th>Requirement Title</th>
              <th className="w-[100px]">Priority</th>
              <th className="w-[120px]">Coverage</th>
              <th className="w-[120px]">Owner</th>
              <th className="text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50 cursor-pointer">
                <td className="font-bold text-slate-900">{req.id}</td>
                <td className="font-medium text-slate-700">{req.title}</td>
                <td>
                  <span className={`text-[11px] font-bold uppercase ${req.priority === 'High' ? 'text-rose-500' : 'text-amber-500'}`}>
                    {req.priority}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-8">
                    <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden max-w-[60px]">
                      <div className="h-full bg-emerald-500" style={{ width: req.coverage }} />
                    </div>
                    <span className="text-xs font-bold text-slate-500">{req.coverage}</span>
                  </div>
                </td>
                <td className="text-slate-600 font-medium">{req.owner}</td>
                <td className="text-right">
                  <span className={`text-[11px] font-bold px-8 py-2 rounded-4 uppercase border ${
                    req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                  }`}>
                    {req.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface DecisionRecord {
  id: string;
  title: string;
  context: string;
  decision: string;
  consequences: string;
  status: 'Draft' | 'Proposed' | 'Accepted' | 'Deprecated';
  actor: string;
  time: string;
}

function DecisionDrawer({ 
  isOpen, 
  onClose, 
  onCommit 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onCommit: (decision: any) => void 
}) {
  const [formData, setFormData] = useState({
    title: '',
    context: '',
    decision: '',
    consequences: '',
    status: 'Proposed'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null;

  const handleCommit = () => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      const newDecision = {
        ...formData,
        id: `DEC-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        type: 'Architecture Decision',
        desc: formData.title,
        actor: 'Hemant Chaudhary',
        time: 'Just now'
      }
      onCommit(newDecision)
      setIsSubmitting(false)
      onClose()
      // Reset form
      setFormData({
        title: '',
        context: '',
        decision: '',
        consequences: '',
        status: 'Proposed'
      })
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-space-3 py-space-2 border-b border-neutral-border flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-space-1">
            <div className="w-10 h-10 bg-brand-accent rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">New Decision Record</h2>
              <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Architecture Governance</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-space-1 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-18 h-18 text-slate-400" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-space-3 space-y-space-4 custom-scrollbar">
          <div className="space-y-4">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Decision Title</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Adoption of GraphQL for Mobile API"
              className="w-full px-space-2 py-space-1 bg-slate-50 border border-neutral-border rounded-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Context</label>
            <textarea 
              rows={4}
              value={formData.context}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              placeholder="What is the problem we are solving? What are the constraints?"
              className="w-full px-space-2 py-space-1 bg-slate-50 border border-neutral-border rounded-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all resize-none"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">The Decision</label>
            <textarea 
              rows={4}
              value={formData.decision}
              onChange={(e) => setFormData({ ...formData, decision: e.target.value })}
              placeholder="What is the proposed solution? Why this choice?"
              className="w-full px-space-2 py-space-1 bg-slate-50 border border-neutral-border rounded-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all resize-none"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Consequences</label>
            <textarea 
              rows={4}
              value={formData.consequences}
              onChange={(e) => setFormData({ ...formData, consequences: e.target.value })}
              placeholder="What are the trade-offs? What is the impact on other systems?"
              className="w-full px-space-2 py-space-1 bg-slate-50 border border-neutral-border rounded-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-space-2">
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-space-2 py-space-1 bg-slate-50 border border-neutral-border rounded-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all"
              >
                <option>Proposed</option>
                <option>Accepted</option>
                <option>Draft</option>
                <option>Deprecated</option>
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Owner</label>
              <div className="flex items-center gap-8 px-space-2 py-space-1 bg-slate-50 border border-neutral-border rounded-4">
                <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="w-10 h-10 text-slate-400" />
                </div>
                <span className="text-xs text-slate-700 font-medium">Hemant Chaudhary</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-space-3 border-t border-neutral-border flex gap-space-2 bg-slate-50/50">
          <button 
            onClick={onClose}
            className="flex-1 px-space-2 py-space-1 bg-white border border-neutral-border rounded-4 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
          >
            Discard
          </button>
          <button 
            onClick={handleCommit}
            disabled={isSubmitting || !formData.title}
            className={`flex-1 px-space-2 py-space-1 bg-brand-accent text-white rounded-4 text-xs font-bold hover:bg-blue-600 active:scale-95 transition-all shadow-sm shadow-brand-accent/20 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Committing...
              </>
            ) : (
              'Commit Decision'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function FinancialLegalView() {
  const records = [
    { id: 'FIN-001', item: 'Infrastructure Budget 2024', type: 'Budget', status: 'Approved', amount: '$45,000', owner: 'Hemant C.' },
    { id: 'LEG-042', item: 'Cloud Services Master Agreement', type: 'Contract', status: 'Signed', amount: 'N/A', owner: 'Legal Team' },
    { id: 'FIN-002', item: 'Vulnerability Bounty Program', type: 'Cost Tracking', status: 'Active', amount: '$5,000', owner: 'Security' },
  ]

  return (
    <div className="flex flex-col gap-space-4 text-left">
      <header className="flex items-center justify-between">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial & Legal</h1>
          <p className="text-xs text-slate-500 italic">"How much does this cost and what are our obligations?" • Budgets & Contracts</p>
        </div>
        <button className="px-space-2 py-space-1 bg-brand-accent text-white rounded-4 text-xs font-bold hover:bg-blue-600 transition-all shadow-sm">
          Add Record
        </button>
      </header>

      <div className="bg-white border border-neutral-border rounded-4 overflow-hidden shadow-sm">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th className="w-[100px]">ID</th>
              <th>Object Item</th>
              <th className="w-[120px]">Type</th>
              <th className="w-[120px]">Amount/Value</th>
              <th className="w-[120px]">Owner</th>
              <th className="text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50">
                <td className="font-bold text-slate-900">{record.id}</td>
                <td className="font-medium text-slate-700">{record.item}</td>
                <td className="text-xs text-slate-500">{record.type}</td>
                <td className="text-xs font-bold text-slate-900">{record.amount}</td>
                <td className="text-xs text-slate-600">{record.owner}</td>
                <td className="text-right">
                  <span className="text-[9px] font-bold px-8 py-2 rounded-4 uppercase bg-slate-100 text-slate-500 border border-slate-200">
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function App() {
  const [activeSection, setActiveSection] = useState('Project Identity')
  const [isDecisionDrawerOpen, setIsDecisionDrawerOpen] = useState(false)
  const [events, setEvents] = useState(INITIAL_INTEL_EVENTS)

  const renderContent = () => {
    switch (activeSection) {
      case 'Project Identity':
        return (
          <Dashboard 
            events={events} 
            onNewDecision={() => setIsDecisionDrawerOpen(true)} 
          />
        )
      case 'Requirements':
        return <RequirementsView />
      case 'Design':
        return <DesignView />
      case 'Development':
        return <DevelopmentView />
      case 'API & Contracts':
        return <APIView />
      case 'Testing & Validation':
        return <TestingView />
      case 'Deployment':
        return <DeploymentView />
      case 'Governance & Control':
        return <SecurityView />
      case 'Financial & Legal':
        return <FinancialLegalView />
      case 'Historical Record':
        return <ArchiveView />
      default:
        return (
          <div className="flex flex-col items-center justify-center py-space-6 text-slate-500">
            <Search className="w-space-4 h-space-4 mb-space-2 opacity-30" />
            <p className="text-sm font-bold tracking-tight">The {activeSection} module is initializing...</p>
            <p className="text-xs uppercase font-bold tracking-widest mt-4 opacity-60 italic">Answers: How this is built and governed</p>
          </div>
        )
    }
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col">
      <WorkspaceShell 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      >
        <main className="flex-1 overflow-y-auto custom-scrollbar p-space-4">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </WorkspaceShell>

      {/* Decision Drawer */}
      <DecisionDrawer 
        isOpen={isDecisionDrawerOpen} 
        onClose={() => setIsDecisionDrawerOpen(false)} 
        onCommit={(newDecision) => setEvents([newDecision, ...events])}
      />
    </div>
  )
}

export default App
