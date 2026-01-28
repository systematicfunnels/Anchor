import { useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  DollarSign,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNotificationStore } from '../store/useNotificationStore';

export const Reports = () => {
  const { 
    projects, 
    clients, 
    invoices, 
    fetchProjects, 
    fetchClients, 
    fetchInvoices 
  } = useStore();
  const { addNotification } = useNotificationStore();

  const navigate = (path: string) => { window.location.hash = path; };

  useEffect(() => {
    fetchProjects();
    fetchClients();
    fetchInvoices();
  }, [fetchProjects, fetchClients, fetchInvoices]);

  // Calculate real metrics
  const totalRevenue = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const avgMargin = projects.length > 0 
    ? projects.reduce((sum, p) => sum + p.baselineMargin, 0) / projects.length 
    : 0;

  const activeClientsCount = clients.filter(c => c.status === 'Active').length;
  const completedProjectsCount = projects.filter(p => p.status === 'Completed').length;

  if (projects.length === 0 && invoices.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-neutral-900">Reports</h2>
        <Card className="flex flex-col items-center justify-center py-16 px-6 text-center border-dashed">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">Insufficient Data</h3>
          <p className="text-neutral-500 max-w-sm mt-2">
            Reports will populate once you have active projects and paid invoices.
          </p>
          <button 
            onClick={() => navigate('#dashboard')}
            className="mt-6 bg-white border border-neutral-200 text-neutral-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-neutral-50 transition-all shadow-sm"
          >
            Return to Dashboard
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">Reports</h2>
        <div className="flex gap-2">
          <select className="bg-white border border-neutral-200 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Year to Date</option>
            <option>All Time</option>
          </select>
          <button 
            onClick={() => addNotification({ type: 'info', message: 'Exporting data as CSV... This will be ready in a moment.' })}
            className="bg-white border border-neutral-200 text-neutral-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-neutral-50 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-500">Revenue Summary</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold font-financial">${totalRevenue.toLocaleString()}</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
            <ArrowUpRight className="w-3 h-3" />
            <span>Actual Paid Revenue</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-500">Avg. Project Margin</span>
            <DollarSign className="w-4 h-4 text-primary-500" />
          </div>
          <div className="text-2xl font-bold font-financial">{avgMargin.toFixed(1)}%</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
            <span>Across all projects</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-500">Active Clients</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-financial">{activeClientsCount}</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
            <span>Total active in system</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-500">Completed Projects</span>
            <Briefcase className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold font-financial">{completedProjectsCount}</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
            <span>Delivered & Closed</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Project Profitability</h3>
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => (
              <div 
                key={project.id} 
                onClick={() => navigate(`#projects/${project.id}`)}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 cursor-pointer transition-colors group"
              >
                <div>
                  <div className="font-medium text-sm group-hover:text-primary-600 flex items-center gap-1.5">
                    {project.name}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-xs text-neutral-500">${project.baselinePrice.toLocaleString()} revenue</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${
                    project.baselineMargin >= 40 ? 'text-green-600' : 
                    project.baselineMargin >= 25 ? 'text-primary-600' : 'text-red-600'
                  }`}>{project.baselineMargin}%</div>
                  <div className="text-[10px] uppercase font-bold text-neutral-400">Margin</div>
                </div>
              </div>
            ))}
            {projects.length === 0 && <p className="text-sm text-neutral-500 text-center py-4">No project data available.</p>}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Client Overview</h3>
          <div className="space-y-4">
            {clients.slice(0, 5).map((client) => {
              const clientProjects = projects.filter(p => p.clientId === client.id);
              const clientRevenue = clientProjects.reduce((sum, p) => sum + p.baselinePrice, 0);
              return (
                <div 
                  key={client.id} 
                  onClick={() => navigate('#clients')}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 cursor-pointer transition-colors group"
                >
                  <div>
                    <div className="font-medium text-sm group-hover:text-primary-600 flex items-center gap-1.5">
                      {client.name}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-xs text-neutral-500">{clientProjects.length} projects</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-neutral-900">{client.status}</div>
                    <div className="text-xs text-neutral-500 font-financial">${clientRevenue.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
            {clients.length === 0 && <p className="text-sm text-neutral-500 text-center py-4">No client data available.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};
