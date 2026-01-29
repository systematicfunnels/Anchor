import { useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  Briefcase, 
  Receipt,
  Plus,
  BarChart3
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { useCurrency } from '../hooks/useCurrency';

export const Dashboard = () => {
  const { formatCurrency } = useCurrency();
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
  const totalRevenue = useMemo(() => invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.total, 0), [invoices]);
  
  const avgMargin = useMemo(() => projects.length > 0 
    ? projects.reduce((sum, p) => sum + p.baselineMargin, 0) / projects.length 
    : 0, [projects]);

  const activeProjectsCount = useMemo(() => projects.filter(p => p.status === 'Active').length, [projects]);
  
  const upcomingInvoices = useMemo(() => invoices.filter(inv => inv.status === 'Sent' || inv.status === 'Draft'), [invoices]);
  const upcomingInvoicesTotal = useMemo(() => upcomingInvoices.reduce((sum, inv) => sum + inv.total, 0), [upcomingInvoices]);
  
  const stats = [
    { label: 'Cash Snapshot', value: formatCurrency(totalRevenue), trend: 'Paid', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Avg Margin', value: `${avgMargin.toFixed(1)}%`, trend: 'Lifetime', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Projects', value: activeProjectsCount.toString(), trend: 'Running', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Upcoming Invoices', value: formatCurrency(upcomingInvoicesTotal), trend: `${upcomingInvoices.length} due`, icon: Receipt, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];
  
  if (projects.length === 0 && invoices.length === 0) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Welcome to Anchor</h2>
            <p className="text-neutral-500 text-sm">Your personal workspace is ready.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-card-gap)]">
          <Card className="p-[var(--card-padding-x)] border-2 border-dashed border-neutral-200 flex flex-col items-center text-center space-y-4">
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

          <Card className="p-[var(--card-padding-x)] border-2 border-dashed border-neutral-200 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6 text-neutral-400" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900">2. Create a Quote</h3>
              <p className="text-sm text-neutral-500 mt-1">Define scope and pricing for your services.</p>
            </div>
          </Card>

          <Card className="p-[var(--card-padding-x)] border-2 border-dashed border-neutral-200 flex flex-col items-center text-center space-y-4">
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
    <div className="page-container overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Dashboard</h2>
          <p className="text-neutral-500 text-sm">Overview of your business performance.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => navigate('#projects')}
            className="flex-1 sm:flex-none bg-white border border-neutral-200 text-neutral-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-neutral-50 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Briefcase className="w-4 h-4 text-neutral-400" />
            Active Projects
          </button>
          <button 
            onClick={() => navigate('#quotes')}
            className="flex-1 sm:flex-none bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-all shadow-md shadow-primary-500/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Quote
          </button>
        </div>
      </div>

      <div className="grid-layout">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4">
              <div className={cn("p-3 rounded-lg", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-neutral-900 font-financial">{stat.value}</span>
                  <span className="text-xs font-medium text-neutral-400">{stat.trend}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
