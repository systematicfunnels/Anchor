import { useEffect } from 'react';
import { 
  TrendingUp, 
  Briefcase, 
  Receipt,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { useStore } from '../store/useStore';

export const Dashboard = () => {
  const { 
    projects, 
    invoices, 
    fetchProjects, 
    fetchInvoices 
  } = useStore();

  useEffect(() => {
    fetchProjects();
    fetchInvoices();
  }, [fetchProjects, fetchInvoices]);

  const navigate = (path: string) => { window.location.hash = path; };
  
  // Calculate real stats from state
  const totalRevenue = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.total, 0);
  
  const activeProjectsCount = projects.filter(p => p.status === 'Active').length;
  
  const upcomingInvoices = invoices.filter(inv => inv.status === 'Sent' || inv.status === 'Draft');
  const upcomingInvoicesTotal = upcomingInvoices.reduce((sum, inv) => sum + inv.total, 0);
  
  const marginAlerts = projects.filter(p => p.baselineMargin < 30).length;

  const stats = [
    { label: 'Cash Snapshot', value: `$${totalRevenue.toLocaleString()}`, trend: 'Paid', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Projects', value: activeProjectsCount.toString(), trend: 'Running', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Upcoming Invoices', value: `$${upcomingInvoicesTotal.toLocaleString()}`, trend: `${upcomingInvoices.length} due`, icon: Receipt, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Margin Alerts', value: marginAlerts.toString(), trend: 'Review', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];
  
  if (projects.length === 0 && invoices.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Welcome to ServiceOps</h2>
            <p className="text-neutral-500 text-sm">Let's get your business operations set up.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-2 border-dashed border-neutral-200 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900">1. Register a Client</h3>
              <p className="text-sm text-neutral-500 mt-1">Every project and invoice starts with a client.</p>
            </div>
            <button 
              onClick={() => navigate('#clients')}
              className="mt-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-all"
            >
              Add Your First Client
            </button>
          </Card>

          <Card className="p-6 border-2 border-dashed border-neutral-200 flex flex-col items-center text-center space-y-4 opacity-50">
            <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6 text-neutral-400" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900">2. Create a Quote</h3>
              <p className="text-sm text-neutral-500 mt-1">Define scope and pricing for your services.</p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-dashed border-neutral-200 flex flex-col items-center text-center space-y-4 opacity-50">
            <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center">
              <Receipt className="w-6 h-6 text-neutral-400" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900">3. Bill your work</h3>
              <p className="text-sm text-neutral-500 mt-1">Generate professional invoices automatically.</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Operations Dashboard</h2>
          <p className="text-neutral-500 text-sm">Real-time pulse of your service delivery and financials.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('#projects')}
            className="bg-white border border-neutral-200 text-neutral-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-neutral-50 transition-all shadow-sm flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4 text-neutral-400" />
            Active Projects
          </button>
          <button 
            onClick={() => navigate('#quotes')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-all shadow-md shadow-primary-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Quote
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`${stat.bg} p-2 rounded-lg`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xl font-bold font-financial">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Critical Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <Card className="border-red-100 bg-red-50/20">
            <CardHeader className="py-3 px-4 border-b border-red-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-bold text-red-900 uppercase tracking-tight">Financial & Delivery Alerts</h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-red-100">
                {projects.filter(p => p.baselineMargin < 30).slice(0, 2).map(project => (
                  <div key={project.id} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">Margin Risk: {project.name}</p>
                        <p className="text-xs text-neutral-500">Current margin ({project.baselineMargin}%) is below safety threshold (30%)</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`#projects/${project.id}`)}
                      className="text-xs font-bold text-primary-600 hover:underline"
                    >
                      Review Financials
                    </button>
                  </div>
                ))}
                {invoices.filter(inv => inv.status === 'Overdue').slice(0, 2).map(inv => (
                  <div key={inv.id} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">Overdue Invoice: {inv.client?.name}</p>
                        <p className="text-xs text-neutral-500">{inv.invoiceNumber} is overdue (${inv.total.toLocaleString()})</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('#invoices')}
                      className="text-xs font-bold text-primary-600 hover:underline"
                    >
                      Send Reminder
                    </button>
                  </div>
                ))}
                {projects.filter(p => p.baselineMargin >= 30).length === 0 && invoices.filter(inv => inv.status === 'Overdue').length === 0 && (
                  <div className="p-4 text-center text-sm text-neutral-500">No critical alerts at this time.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between py-3 px-4 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-tight">Active Delivery Roadmap</h3>
              <button onClick={() => navigate('#projects')} className="text-xs text-primary-600 font-bold hover:underline">View All Projects</button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="bg-neutral-50/50">PROJECT</th>
                      <th className="bg-neutral-50/50">STATUS</th>
                      <th className="bg-neutral-50/50">MARGIN</th>
                      <th className="bg-neutral-50/50"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {projects.slice(0, 5).map(project => (
                      <tr key={project.id}>
                        <td className="py-3 px-4">
                          <p className="font-bold text-sm">{project.name}</p>
                          <p className="text-[10px] text-neutral-400 font-bold">{project.client?.name}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            project.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-700'
                          }`}>
                            {project.status.toUpperCase()}
                          </span>
                        </td>
                        <td className={`py-3 px-4 font-financial font-bold ${project.baselineMargin < 30 ? 'text-red-600' : 'text-green-600'}`}>
                          {project.baselineMargin}%
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => navigate(`#projects/${project.id}`)} className="p-1 hover:bg-neutral-100 rounded">
                            <ArrowRight className="w-4 h-4 text-neutral-400" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {projects.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-sm text-neutral-500">No active projects found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="py-3 px-4 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-tight">Upcoming Invoices</h3>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {upcomingInvoices.slice(0, 5).map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between border-l-2 border-primary-500 pl-3">
                    <div>
                      <p className="text-sm font-bold text-neutral-900">{inv.client?.name}</p>
                      <p className="text-[10px] text-neutral-500 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due {new Date(inv.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-financial font-bold text-neutral-900">${inv.total.toLocaleString()}</p>
                  </div>
                ))}
                {upcomingInvoices.length === 0 && (
                  <p className="text-center text-sm text-neutral-500 py-4">No upcoming invoices.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
