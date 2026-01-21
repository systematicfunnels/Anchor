import { useState, useEffect } from 'react'
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
  X,
  Lock
} from 'lucide-react'
import WorkspaceShell from './components/layout/WorkspaceShell'
import { AccessLevel } from './types/auth'
import { useAuth } from './context/AuthContext'

const DASHBOARD_METRICS = [
  { label: 'Architectural Integrity', value: '98.4%', sub: 'No critical drifts', icon: Layers, color: 'text-brand-accent' },
  { label: 'Security Posture', value: 'A+', sub: '0 critical vulns', icon: ShieldCheck, color: 'text-emerald-500' },
  { label: 'Deployment Velocity', value: '2.4/d', sub: '↑ 12% vs last sprint', icon: Rocket, color: 'text-blue-500' },
  { label: 'Traceability Coverage', value: '100%', sub: 'All requirements linked', icon: CheckCircle2, color: 'text-indigo-500' },
]

const INITIAL_INTEL_EVENTS = [
  { id: 'DEC-042', type: 'Arch Decision', desc: 'Migration to Micro-frontends', actor: 'Hemant Chaudhary', time: '2h ago', status: 'Approved', hash: '8f2a1c' },
  { id: 'REQ-881', type: 'Requirement', desc: 'Added compliance validation to API', actor: 'Sarah Chen', time: '4h ago', status: 'Pending', hash: '3e9d4b' },
  { id: 'TST-102', type: 'Validation', desc: 'Critical Path Verification: PASS', actor: 'CI/CD Bot', time: '6h ago', status: 'Verified', hash: 'a1b2c3' },
  { id: 'REL-004', type: 'Governance', desc: 'Staging Release Approval', actor: 'Michael Ross', time: '1d ago', status: 'Approved', hash: 'f5e6d7' },
]

function Dashboard({ onNewDecision, events, accessLevel }: { onNewDecision: () => void, events: typeof INITIAL_INTEL_EVENTS, accessLevel: AccessLevel }) {
  return (
    <div className="flex flex-col gap-space-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header Section */}
      <header className="flex items-center justify-between">
        <div className="space-y-space-1 text-left">
          <div className="flex items-center gap-space-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Alpha</h1>
            <span className="px-space-2 py-0.5 bg-slate-100 text-slate-500 rounded-4 text-[10px] font-bold uppercase tracking-widest border border-slate-200">v2.4.0-production</span>
          </div>
          <div className="flex items-center gap-space-4">
            <span className="flex items-center gap-space-2 text-xs text-slate-500">
              <div className="w-space-1 h-space-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              Status: <span className="font-bold text-slate-700 uppercase tracking-wide">Operational</span>
            </span>
            <span className="w-px h-space-2 bg-slate-200" />
            <div className="flex items-center gap-space-2">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">Global Read-Only Mode</span>
              <Lock className="w-space-2 h-space-2 text-slate-300" />
            </div>
          </div>
        </div>
        <div className="flex gap-space-2">
          <button className="flex items-center gap-space-2 px-space-2 py-space-1 bg-white border border-neutral-border rounded-4 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-sm">
            <Search className="w-space-2 h-space-2" />
            Full Audit Trail
          </button>
        </div>
      </header>


      {/* Intelligence Grid */}
      <div className="layout-grid">
        {DASHBOARD_METRICS.map((m) => (
          <div key={m.label} className="col-span-3 governed-card flex flex-col gap-space-2 group cursor-default hover:border-brand-accent/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</span>
              <m.icon className={`w-space-2 h-space-2 ${m.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
            </div>
            <div className="flex items-baseline gap-space-1">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{m.value}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed text-left font-medium opacity-80">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Traceability & Intelligence Surface */}
      <div className="bg-white border border-neutral-border rounded-4 overflow-hidden shadow-sm flex flex-col">
        <div className="px-space-3 py-space-2 border-b border-neutral-border flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-space-1">
          <Activity className="w-space-2 h-space-2 text-brand-accent" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Real-time Project Intelligence</h3>
        </div>
          <div className="flex items-center gap-space-3">
            <span className="flex items-center gap-space-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="w-space-0.75 h-space-0.75 bg-emerald-500 rounded-full" />
              Live Sync
            </span>
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th className="w-space-4">Object ID</th>
                <th>Event Type & Narrative</th>
                <th className="w-space-6">Ownership</th>
                <th className="w-space-4">SHA-1</th>
                <th className="w-space-4">Timeline</th>
                <th className="w-space-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="font-mono text-[11px] font-bold text-brand-accent">{event.id}</td>
                  <td className="text-left">
                    <div className="flex flex-col py-space-1">
                      <span className="text-xs font-bold text-slate-800 tracking-tight">{event.type}</span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{event.desc}</span>
                    </div>
                  </td>
                  <td className="text-left">
                    <div className="flex items-center gap-space-2 text-[11px] font-medium text-slate-600">
                      <div className="w-space-3 h-space-3 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-[9px] font-bold text-slate-500">
                        {event.actor.split(' ').map(n => n[0]).join('')}
                      </div>
                      {event.actor}
                    </div>
                  </td>
                  <td className="font-mono text-[10px] text-slate-400">{event.hash}</td>
                  <td className="text-[11px] text-slate-500 font-medium">{event.time}</td>
                  <td className="text-right">
                    <span className={`text-[9px] font-bold px-space-2 py-0.5 rounded-4 uppercase border ${
                      event.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      event.status === 'Verified' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-space-3 py-space-1 bg-slate-50/30 border-t border-neutral-border">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-left">
            System Identity: anchor-prod-01 • Intelligence Layer v2.4.0 • Encrypted at Rest
          </p>
        </div>
      </div>
    </div>
  )
}

function GovernanceView({ accessLevel }: { accessLevel: AccessLevel }) {
  const gates = [
    { id: 'G-01', name: 'Architecture Review', status: 'Passed', date: '2024-01-10', owner: 'Technical Board' },
    { id: 'G-02', name: 'Security Sign-off', status: 'Passed', date: '2024-01-12', owner: 'Security Team' },
    { id: 'G-03', name: 'Product Quality Gate', status: 'Pending', date: 'Pending', owner: 'Product QA' },
  ]

  return (
    <div className="flex flex-col gap-space-4 text-left">
      <header className="flex items-center justify-between">
        <div className="space-y-space-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Release & Governance</h1>
          <p className="text-xs text-slate-500 italic">"Is this ready for the world?" • Compliance & Quality Gates</p>
        </div>
        {accessLevel === 'FULL' && (
          <button className="px-space-2 py-space-1 bg-brand-accent text-white rounded-4 text-xs font-bold hover:bg-blue-600 transition-all shadow-sm">
            Submit for Approval
          </button>
        )}
      </header>


      <div className="bg-white border border-neutral-border rounded-4 overflow-hidden shadow-sm">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th className="w-space-4">ID</th>
              <th>Governance Gate & Verification Objective</th>
              <th className="w-space-6">Status</th>
              <th className="w-space-6">Timeline</th>
              <th className="w-space-6 text-right">Authority</th>
            </tr>
          </thead>
          <tbody>
            {gates.map((gate) => (
              <tr key={gate.id} className="hover:bg-slate-50">
                <td className="font-mono text-[10px] font-bold text-brand-accent">{gate.id}</td>
                <td className="text-left">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{gate.name}</span>
                    <span className="text-[10px] text-slate-500 italic">Canonical Compliance Check</span>
                  </div>
                </td>
                <td>
                  <span className={`text-[9px] font-bold px-space-2 py-0.5 rounded-4 uppercase border ${
                    gate.status === 'Passed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                  }`}>
                    {gate.status}
                  </span>
                </td>
                <td className="text-xs text-slate-500 font-medium">{gate.date}</td>
                <td className="text-right text-xs font-bold text-slate-700">{gate.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ArchiveView({ accessLevel }: { accessLevel: AccessLevel }) {
  const history = [
    { version: 'v2.3.0', date: '2023-12-15', changes: 142, artifacts: 'Full', status: 'Archived' },
    { version: 'v2.2.0', date: '2023-11-20', changes: 89, artifacts: 'Partial', status: 'Archived' },
    { version: 'v2.1.0', date: '2023-10-05', changes: 210, artifacts: 'Full', status: 'Archived' },
  ]

  return (
    <div className="flex flex-col gap-space-4 text-left">
      <header className="flex items-center justify-between">
        <div className="space-y-space-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Historical Record</h1>
          <p className="text-xs text-slate-500 italic">"What did we do before?" • Preservation of Superseded Knowledge</p>
        </div>
      </header>

      <div className="bg-white border border-neutral-border rounded-4 overflow-hidden shadow-sm">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th className="w-space-4">Version</th>
              <th>Release Date & Lifecycle Segment</th>
              <th className="w-space-6">Change Count</th>
              <th className="w-space-6">Retention</th>
              <th className="w-space-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.version} className="hover:bg-slate-50">
                <td className="font-bold text-slate-900">{h.version}</td>
                <td className="text-xs text-slate-500">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-700">{h.date}</span>
                    <span className="text-[10px] opacity-60 italic">Historical Snapshot</span>
                  </div>
                </td>
                <td className="text-xs font-bold text-slate-700">{h.changes} commits</td>
                <td className="text-xs text-slate-500 font-medium">{h.artifacts}</td>
                <td className="text-right">
                  <span className="text-[9px] font-bold px-space-2 py-0.5 rounded-4 uppercase bg-slate-100 text-slate-500 border border-slate-200">
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

function DeploymentView({ accessLevel }: { accessLevel: AccessLevel }) {
  const deployments = [
    { env: 'Production', version: 'v2.3.9', status: 'Healthy', cluster: 'us-east-1', traffic: '100%' },
    { env: 'Staging', version: 'v2.4.0-rc1', status: 'Healthy', cluster: 'us-east-1', traffic: '0%' },
    { env: 'Development', version: 'v2.4.0-nightly', status: 'Degraded', cluster: 'us-west-2', traffic: '0%' },
  ]

  return (
    <div className="flex flex-col gap-space-4 text-left">
      <header className="flex items-center justify-between">
        <div className="space-y-space-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Deployment & Infrastructure</h1>
          <p className="text-xs text-slate-500 italic">"Where does this live?" • Environments & Orchestration</p>
        </div>
        {accessLevel === 'FULL' && (
          <div className="flex gap-space-2">
            <button className="px-space-2 py-space-1 bg-brand-accent text-white rounded-4 text-xs font-bold hover:bg-blue-600 transition-all shadow-sm">
              Deploy New Version
            </button>
          </div>
        )}
      </header>


      <div className="bg-white border border-neutral-border rounded-4 overflow-hidden shadow-sm">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Target Environment</th>
              <th className="w-space-6">Registry Tag</th>
              <th className="w-space-4">Health</th>
              <th className="w-space-6">Cloud Context</th>
              <th className="w-space-4 text-right">Traffic</th>
            </tr>
          </thead>
          <tbody>
            {deployments.map((dep) => (
              <tr key={dep.env} className="hover:bg-slate-50">
                <td className="font-bold text-slate-900">{dep.env}</td>
                <td className="font-mono text-[10px] font-bold text-slate-500">{dep.version}</td>
                <td>
                  <span className={`flex items-center gap-space-2 text-[10px] font-bold uppercase ${
                    dep.status === 'Healthy' ? 'text-emerald-500' : 'text-amber-500'
                  }`}>
                    <div className={`w-space-2 h-space-2 rounded-full ${dep.status === 'Healthy' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-amber-500'}`} />
                    {dep.status}
                  </span>
                </td>
                <td className="text-[11px] text-slate-500 font-medium italic">{dep.cluster}</td>
                <td className="text-right text-xs font-bold text-slate-700">{dep.traffic}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SecurityView({ accessLevel }: { accessLevel: AccessLevel }) {
  const securityMetrics = [
    { label: 'Vulnerabilities', value: '0', sub: 'All critical fixed', status: 'Secure' },
    { label: 'Secrets Scanned', value: '1,204', sub: 'No leaks detected', status: 'Secure' },
    { label: 'Auth Failures', value: '0.01%', sub: 'Within threshold', status: 'Secure' },
  ]

  return (
    <div className="flex flex-col gap-space-4 text-left">
      <header className="flex items-center justify-between">
        <div className="space-y-space-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Governance & Control</h1>
          <p className="text-xs text-slate-500 italic">"Who approved what and when?" • Authority & Incident Logs</p>
        </div>
        {accessLevel === 'FULL' && (
          <button className="px-space-2 py-space-1 bg-rose-500 text-white rounded-4 text-xs font-bold hover:bg-rose-600 transition-all shadow-sm">
            Run Security Audit
          </button>
        )}
      </header>


      <div className="layout-grid">
        {securityMetrics.map((m) => (
          <div key={m.label} className="col-span-4 governed-card flex flex-col gap-space-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{m.value}</span>
              <span className="text-[9px] font-bold text-emerald-600 uppercase bg-emerald-50 px-space-3 py-space-1 rounded-4">
                {m.status}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 text-white p-space-3 rounded-4 font-mono text-xs overflow-hidden relative group">
        <div className="flex items-center justify-between mb-space-2">
          <span className="flex items-center gap-space-4">
            <div className="w-space-4 h-space-4 bg-emerald-500 rounded-full" />
            Live Security Feed
          </span>
          <span className="text-slate-500">Real-time</span>
        </div>
        <div className="space-y-space-1 opacity-80">
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

function APIView({ accessLevel }: { accessLevel: AccessLevel }) {
  const endpoints = [
    { method: 'POST', path: '/v1/auth/verify', status: 'Production', uptime: '99.99%', latency: '45ms' },
    { method: 'GET', path: '/v1/traceability/graph', status: 'Production', uptime: '99.95%', latency: '120ms' },
    { method: 'PUT', path: '/v1/requirements/:id', status: 'Staging', uptime: '98.50%', latency: '60ms' },
  ]

  return (
    <div className="flex flex-col gap-space-4 text-left">
      <header className="flex items-center justify-between">
        <div className="space-y-space-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">API Management</h1>
          <p className="text-xs text-slate-500 italic">"How does this connect?" • Integration & Contracts</p>
        </div>
        <div className="flex gap-space-2">
          <button className="px-space-2 py-space-1 bg-brand-accent text-white rounded-4 text-xs font-bold hover:bg-blue-600 transition-all shadow-sm">
            API Docs
          </button>
        </div>
      </header>


      <div className="bg-white border border-neutral-border rounded-4 overflow-hidden shadow-sm">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th className="w-space-4">Method</th>
              <th>Endpoint Path & Canonical Contract</th>
              <th className="w-space-6">Context</th>
              <th className="w-space-4">Availability</th>
              <th className="w-space-4 text-right">Latency</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((ep) => (
              <tr key={ep.path} className="hover:bg-slate-50">
                <td>
                  <span className={`text-[10px] font-bold px-space-2 py-0.5 rounded-4 border ${
                    ep.method === 'GET' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    ep.method === 'POST' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {ep.method}
                  </span>
                </td>
                <td className="text-left">
                  <div className="flex flex-col">
                    <span className="font-mono text-xs text-slate-700 font-bold">{ep.path}</span>
                    <span className="text-[10px] text-slate-400 italic">OpenAPI v3.0 Contract Verified</span>
                  </div>
                </td>
                <td className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{ep.status}</td>
                <td className="text-xs font-bold text-emerald-600">{ep.uptime}</td>
                <td className="text-right text-[10px] text-slate-400 font-mono font-bold">{ep.latency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TestingView({ accessLevel }: { accessLevel: AccessLevel }) {
  const testSuites = [
    { name: 'Core Logic - Unit', tests: 450, passed: 450, failed: 0, coverage: '98%', status: 'Passed' },
    { name: 'Identity Flow - E2E', tests: 42, passed: 40, failed: 2, coverage: '85%', status: 'Failed' },
    { name: 'Traceability - Integration', tests: 120, passed: 120, failed: 0, coverage: '92%', status: 'Passed' },
  ]

  return (
    <div className="flex flex-col gap-space-4 text-left">
      <header className="flex items-center justify-between">
        <div className="space-y-space-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quality & Testing</h1>
          <p className="text-xs text-slate-500 italic">"Is this working correctly?" • Verification & Validation</p>
        </div>
        {accessLevel === 'FULL' && (
          <button className="px-space-2 py-space-1 bg-brand-accent text-white rounded-4 text-xs font-bold hover:bg-blue-600 transition-all shadow-sm">
            Run All Tests
          </button>
        )}
      </header>


      <div className="layout-grid">
        {testSuites.map((suite) => (
          <div key={suite.name} className="col-span-4 governed-card flex flex-col gap-space-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">{suite.name}</h3>
              <span className={`text-[9px] font-bold px-space-3 py-space-1 rounded-4 uppercase ${
                suite.status === 'Passed' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {suite.status}
              </span>
            </div>

            <div className="space-y-space-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-bold uppercase">Pass Rate</span>
                <span className="font-bold text-slate-700">{Math.round((suite.passed / suite.tests) * 100)}%</span>
              </div>
              <div className="h-space-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${suite.status === 'Passed' ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                  style={{ width: `${(suite.passed / suite.tests) * 100}%` }} 
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-space-4 border-t border-slate-50">
              <span className="text-[10px] text-slate-500 font-medium">{suite.tests} tests executed</span>
              <span className="text-[10px] font-bold text-brand-accent cursor-pointer hover:underline">Details</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DesignView({ accessLevel }: { accessLevel: AccessLevel }) {
  const architectures = [
    { id: 'ARC-001', name: 'Micro-frontend Core', type: 'Architecture', status: 'Approved', complexity: 'High', artifacts: 12 },
    { id: 'SCH-042', name: 'Auth Schema v2', type: 'Database Schema', status: 'In Review', complexity: 'Medium', artifacts: 4 },
    { id: 'UX-109', name: 'Intelligence Dashboard Flow', type: 'UX Flow', status: 'Draft', complexity: 'High', artifacts: 8 },
  ]

  return (
    <div className="flex flex-col gap-space-4 text-left">
      <header className="flex items-center justify-between">
        <div className="space-y-space-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Design & Architecture</h1>
          <p className="text-xs text-slate-500 italic">"How is this supposed to work?" • Structural Blueprint</p>
        </div>
        <div className="flex gap-space-2">
          <button className="px-space-2 py-space-1 bg-white border border-neutral-border rounded-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            Export Diagrams
          </button>
          {accessLevel === 'FULL' && (
            <button className="px-space-2 py-space-1 bg-brand-accent text-white rounded-4 text-xs font-bold hover:bg-blue-600 transition-all shadow-sm">
              New Component
            </button>
          )}
        </div>
      </header>


      <div className="layout-grid">
        {architectures.map((arch) => (
          <div key={arch.id} className="col-span-4 governed-card flex flex-col gap-space-3 group">
            <div className="flex items-start justify-between">
              <div className="space-y-space-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{arch.id}</span>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-accent transition-colors">{arch.name}</h3>
              </div>
              <span className={`text-[9px] font-bold px-space-3 py-space-1 rounded-4 uppercase ${
                arch.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {arch.status}
              </span>
            </div>
            
            <div className="flex items-center gap-space-6 py-space-4 border-y border-slate-50">
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

function DevelopmentView({ accessLevel }: { accessLevel: AccessLevel }) {
  const repositories = [
    { name: 'anchor-core', branch: 'main', health: 'Healthy', coverage: '94%', lastCommit: 'Fix: Auth handshake', time: '12m ago' },
    { name: 'anchor-ui-kit', branch: 'develop', health: 'Healthy', coverage: '88%', lastCommit: 'Feat: Data tables', time: '1h ago' },
    { name: 'anchor-api-gateway', branch: 'feat/v2-auth', health: 'Degraded', coverage: '72%', lastCommit: 'WIP: Migration', time: '3h ago' },
  ]

  return (
    <div className="flex flex-col gap-space-4 text-left">
      <header className="flex items-center justify-between">
        <div className="space-y-space-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Development</h1>
          <p className="text-xs text-slate-500 italic">"How is this being built?" • Execution & Codebase</p>
        </div>
        <div className="flex gap-space-2">
          <button className="px-space-2 py-space-1 bg-white border border-neutral-border rounded-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            CI/CD Pipeline
          </button>
          {accessLevel === 'FULL' && (
            <button className="px-space-2 py-space-1 bg-brand-accent text-white rounded-4 text-xs font-bold hover:bg-blue-600 transition-all shadow-sm">
              Create PR
            </button>
          )}
        </div>
      </header>


      <div className="bg-white border border-neutral-border rounded-4 overflow-hidden shadow-sm">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Managed Repository</th>
              <th className="w-space-6">Active Branch</th>
              <th className="w-space-4">Health</th>
              <th className="w-space-4">Coverage</th>
              <th>Latest Canonical Activity</th>
              <th className="w-space-4 text-right">Age</th>
            </tr>
          </thead>
          <tbody>
            {repositories.map((repo) => (
              <tr key={repo.name} className="hover:bg-slate-50 cursor-pointer group">
                <td>
                  <div className="flex items-center gap-space-3">
                    <Code2 className="w-space-2 h-space-2 text-slate-400 group-hover:text-brand-accent transition-colors" />
                    <span className="font-bold text-slate-900">{repo.name}</span>
                  </div>
                </td>
                <td className="font-mono text-[10px] text-slate-500 font-bold uppercase">{repo.branch}</td>
                <td>
                  <span className={`flex items-center gap-space-2 text-[10px] font-bold uppercase ${
                    repo.health === 'Healthy' ? 'text-emerald-500' : 'text-amber-500'
                  }`}>
                    <div className={`w-space-2 h-space-2 rounded-full ${repo.health === 'Healthy' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-amber-500'}`} />
                    {repo.health}
                  </span>
                </td>
                <td className="font-bold text-slate-700 text-[11px]">{repo.coverage}</td>
                <td>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-700">{repo.lastCommit}</span>
                    <span className="text-[10px] text-slate-400 italic leading-none mt-0.5">Verified Commit</span>
                  </div>
                </td>
                <td className="text-right text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{repo.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RequirementsView({ accessLevel }: { accessLevel: AccessLevel }) {
  const requirements = [
    { id: 'REQ-001', title: 'System Authentication', priority: 'High', status: 'Approved', coverage: '100%', owner: 'Security Team' },
    { id: 'REQ-002', title: 'Audit Trail Persistence', priority: 'High', status: 'Approved', coverage: '85%', owner: 'Platform Team' },
    { id: 'REQ-003', title: 'Real-time Traceability Graph', priority: 'Medium', status: 'In Review', coverage: '0%', owner: 'UI/UX Team' },
  ]

  return (
    <div className="flex flex-col gap-space-4 text-left">
      <header className="flex items-center justify-between">
        <div className="space-y-space-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Requirements</h1>
          <p className="text-xs text-slate-500 italic">"Why are we building this?" • Business & Product Needs</p>
        </div>
        {accessLevel === 'FULL' && (
          <div className="flex gap-space-2">
            <button className="px-space-2 py-space-1 bg-brand-accent text-white rounded-4 text-xs font-bold hover:bg-blue-600 transition-all shadow-sm">
              Import PRD
            </button>
          </div>
        )}
      </header>


      <div className="bg-white border border-neutral-border rounded-4 overflow-hidden shadow-sm">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th className="w-space-4">ID</th>
              <th>Requirement Title & Business Intent</th>
              <th className="w-space-4">Priority</th>
              <th className="w-space-6">Traceability</th>
              <th className="w-space-6">Authority</th>
              <th className="w-space-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50 cursor-pointer">
                <td className="font-mono text-[10px] font-bold text-brand-accent">{req.id}</td>
                <td className="text-left">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{req.title}</span>
                    <span className="text-[10px] text-slate-500 italic">Canonical Requirement Definition</span>
                  </div>
                </td>
                <td>
                  <span className={`text-[10px] font-bold uppercase tracking-tight ${req.priority === 'High' ? 'text-rose-500' : 'text-amber-500'}`}>
                    {req.priority}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-space-2">
                    <div className="flex-1 h-space-1 bg-slate-100 rounded-full overflow-hidden max-w-[48px]">
                      <div className="h-full bg-emerald-500" style={{ width: req.coverage }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{req.coverage}</span>
                  </div>
                </td>
                <td className="text-slate-600 font-medium text-xs">{req.owner}</td>
                <td className="text-right">
                  <span className={`text-[9px] font-bold px-space-2 py-0.5 rounded-4 uppercase border ${
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
      <div className="relative w-full max-w-form bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-space-3 py-space-2 border-b border-neutral-border flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-space-1">
            <div className="w-space-4 h-space-4 bg-brand-accent rounded-full flex items-center justify-center">
              <FileText className="w-space-3 h-space-3 text-white" />
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
            <X className="w-space-3 h-space-3 text-slate-400" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-space-3 space-y-space-4 custom-scrollbar">
          <div className="space-y-space-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Decision Title</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Adoption of GraphQL for Mobile API"
              className="w-full px-space-2 py-space-1 bg-slate-50 border border-neutral-border rounded-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all"
            />
          </div>

          <div className="space-y-space-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Context</label>
            <textarea 
              rows={4}
              value={formData.context}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              placeholder="What is the problem we are solving? What are the constraints?"
              className="w-full px-space-2 py-space-1 bg-slate-50 border border-neutral-border rounded-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all resize-none"
            />
          </div>

          <div className="space-y-space-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">The Decision</label>
            <textarea 
              rows={4}
              value={formData.decision}
              onChange={(e) => setFormData({ ...formData, decision: e.target.value })}
              placeholder="What is the proposed solution? Why this choice?"
              className="w-full px-space-2 py-space-1 bg-slate-50 border border-neutral-border rounded-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all resize-none"
            />
          </div>

          <div className="space-y-space-2">
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
            <div className="space-y-space-2">
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
            <div className="space-y-space-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Owner</label>
              <div className="flex items-center gap-space-4 px-space-2 py-space-1 bg-slate-50 border border-neutral-border rounded-4">
                <div className="w-space-4 h-space-4 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="w-space-3 h-space-3 text-slate-400" />
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
            className={`flex-1 px-space-2 py-space-1 bg-brand-accent text-white rounded-4 text-xs font-bold hover:bg-blue-600 active:scale-95 transition-all shadow-sm shadow-brand-accent/20 flex items-center justify-center gap-space-1 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <div className="w-space-2 h-space-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

function FinancialLegalView({ accessLevel }: { accessLevel: AccessLevel }) {
  const records = [
    { id: 'FIN-001', item: 'Infrastructure Budget 2024', type: 'Budget', status: 'Approved', amount: '$45,000', owner: 'Hemant C.' },
    { id: 'LEG-042', item: 'Cloud Services Master Agreement', type: 'Contract', status: 'Signed', amount: 'N/A', owner: 'Legal Team' },
    { id: 'FIN-002', item: 'Vulnerability Bounty Program', type: 'Cost Tracking', status: 'Active', amount: '$5,000', owner: 'Security' },
  ]

  return (
    <div className="flex flex-col gap-space-4 text-left">
      <header className="flex items-center justify-between">
        <div className="space-y-space-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial & Legal</h1>
          <p className="text-xs text-slate-500 italic">"How much does this cost and what are our obligations?" • Budgets & Contracts</p>
        </div>
        {accessLevel === 'FULL' && (
          <button className="px-space-2 py-space-1 bg-brand-accent text-white rounded-4 text-xs font-bold hover:bg-blue-600 transition-all shadow-sm">
            Add Record
          </button>
        )}
      </header>


      <div className="bg-white border border-neutral-border rounded-4 overflow-hidden shadow-sm">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th className="w-space-4">ID</th>
              <th>Object Item & Financial Context</th>
              <th className="w-space-6">Type</th>
              <th className="w-space-6">Value</th>
              <th className="w-space-6">Owner</th>
              <th className="w-space-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50 cursor-pointer">
                <td className="font-mono text-[10px] font-bold text-brand-accent">{record.id}</td>
                <td className="text-left">
                  <div className="flex flex-col">
                     <span className="font-bold text-slate-900">{record.item}</span>
                     <span className="text-[10px] text-slate-500 italic leading-none mt-space-0.5">Canonical Financial Record</span>
                   </div>
                </td>
                <td className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{record.type}</td>
                <td className="text-xs font-bold text-slate-900">{record.amount}</td>
                <td className="text-xs text-slate-600 font-medium">{record.owner}</td>
                <td className="text-right">
                  <span className="text-[9px] font-bold px-space-2 py-0.5 rounded-4 uppercase bg-slate-100 text-slate-500 border border-slate-200">
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
  const { user, getAccessLevel } = useAuth()
  const [activeSection, setActiveSection] = useState('Project Identity')
  const [isDecisionDrawerOpen, setIsDecisionDrawerOpen] = useState(false)
  const [events, setEvents] = useState(INITIAL_INTEL_EVENTS)

  // Auto-redirect if current section is no longer accessible
  useEffect(() => {
    if (getAccessLevel(activeSection) === 'NO_ACCESS') {
      setActiveSection('Project Identity');
    }
  }, [user.role, activeSection, getAccessLevel]);

  const renderContent = () => {
    const accessLevel = getAccessLevel(activeSection);

    if (accessLevel === 'NO_ACCESS') {
      return (
        <div className="flex flex-col items-center justify-center py-space-6 text-slate-500 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="w-space-4 h-space-4 bg-rose-50 rounded-full flex items-center justify-center mb-space-3 border border-rose-100 shadow-sm">
            <Lock className="w-space-2 h-space-2 text-rose-500 opacity-80" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Access Restricted</h2>
          <p className="text-sm mt-space-1 max-w-md text-slate-500 font-medium">
            This lifecycle segment is restricted for the <span className="text-brand-accent font-bold px-space-1 py-0.5 bg-brand-accent/5 rounded-4 border border-brand-accent/10">{user.role}</span> role. 
          </p>
          <p className="text-[11px] text-slate-400 mt-space-2 italic">
            Evidence and governance controls for {activeSection} are not available in your current context.
          </p>
          <button 
            onClick={() => setActiveSection('Project Identity')}
            className="mt-space-4 px-space-3 py-space-1 bg-brand-accent text-white rounded-4 text-xs font-bold hover:bg-blue-600 active:scale-95 transition-all shadow-lg shadow-brand-accent/20 flex items-center gap-space-1"
          >
            Return to Project Identity
          </button>
        </div>
      );
    }

    switch (activeSection) {
      case 'Project Identity':
        return (
          <Dashboard 
            events={events} 
            onNewDecision={() => setIsDecisionDrawerOpen(true)} 
            accessLevel={accessLevel}
          />
        )
      // ... views continue
      case 'Requirements':
        return <RequirementsView accessLevel={accessLevel} />
      case 'Design':
        return <DesignView accessLevel={accessLevel} />
      case 'Development':
        return <DevelopmentView accessLevel={accessLevel} />
      case 'API & Contracts':
        return <APIView accessLevel={accessLevel} />
      case 'Testing & Validation':
        return <TestingView accessLevel={accessLevel} />
      case 'Deployment':
        return <DeploymentView accessLevel={accessLevel} />
      case 'Governance & Control':
        return <SecurityView accessLevel={accessLevel} />
      case 'Financial & Legal':
        return <FinancialLegalView accessLevel={accessLevel} />
      case 'Historical Record':
        return <ArchiveView accessLevel={accessLevel} />
      default:
        return (
          <div className="flex flex-col items-center justify-center py-space-6 text-slate-500 animate-in fade-in duration-700">
            <div className="w-space-6 h-space-6 bg-white rounded-full flex items-center justify-center mb-space-3 border border-neutral-border shadow-sm">
              <Search className="w-space-4 h-space-4 text-brand-accent animate-pulse" />
            </div>
            <p className="text-lg font-bold text-slate-900 tracking-tight">Synchronizing Intelligence...</p>
            <p className="text-sm text-slate-500 mt-space-1 max-w-sm text-center font-medium">
              The {activeSection} evidence layer is being verified against the project's immutable historical record.
            </p>
            <div className="mt-space-4 flex items-center gap-space-2 px-space-3 py-space-1 bg-white rounded-full border border-neutral-border shadow-sm">
              <div className="w-space-1 h-space-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Integrity Check in Progress
              </span>
            </div>
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
        {renderContent()}
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
