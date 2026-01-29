import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent } from '../components/ui/Card';
import { 
  ChevronLeft, 
  Plus, 
  Briefcase, 
  FileText, 
  Receipt,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';
import { ProjectModal } from '../components/projects/ProjectModal';

export const ClientDetail = () => {
  const { formatCurrency } = useCurrency();
  const currentPath = window.location.hash;
  const id = currentPath.split('/')[1];
  const navigate = (path: string) => { window.location.hash = path; };
  
  const { 
    clients, 
    projects, 
    quotes, 
    invoices, 
    fetchClients, 
    fetchProjects, 
    fetchQuotes, 
    fetchInvoices 
  } = useStore();
  
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchClients(),
        fetchProjects(),
        fetchQuotes(),
        fetchInvoices()
      ]);
      setLoading(false);
    };
    loadData();
  }, [id]);

  const client = clients.find(c => c.id === id);
  const clientProjects = projects.filter(p => p.clientId === id);
  const clientQuotes = quotes.filter(q => q.clientId === id);
  const clientInvoices = invoices.filter(i => i.clientId === id);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  if (!client) return <div className="p-8 text-center">Client not found</div>;

  const totalRevenue = clientInvoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, i) => sum + i.total, 0);

  const pendingRevenue = clientInvoices
    .filter(i => i.status !== 'Paid')
    .reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="page-container">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
        <button 
          onClick={() => navigate('#clients')}
          className="hover:text-primary-600 transition-colors"
        >
          Clients
        </button>
        <span className="text-neutral-300">/</span>
        <span className="text-neutral-900 font-bold">{client.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('#clients')}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-neutral-500" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">{client.name}</h2>
          <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500 font-medium">
            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {client.email || 'No email'}</span>
            <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {client.phone || 'No phone'}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {client.billingAddress || 'No address'}</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary-50 border-primary-100">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-xl font-bold text-primary-900">{formatCurrency(totalRevenue, client.currency)}</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-100">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Pending Invoices</p>
            <p className="text-xl font-bold text-amber-900">{formatCurrency(pendingRevenue, client.currency)}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Active Projects</p>
            <p className="text-xl font-bold text-blue-900">{clientProjects.filter(p => p.status === 'Active').length}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-100">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Open Quotes</p>
            <p className="text-xl font-bold text-emerald-900">{clientQuotes.filter(q => q.status === 'Sent').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Projects Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary-600" />
              Projects
            </h3>
            <button 
              onClick={() => setIsProjectModalOpen(true)}
              className="flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientProjects.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-neutral-200">
                <Briefcase className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500 font-medium">No projects found for this client.</p>
              </div>
            ) : (
              clientProjects.map(project => (
                <Card key={project.id} className="hover:border-primary-200 transition-all cursor-pointer group" onClick={() => navigate(`#projects/${project.id}`)}>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">{project.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        project.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                        project.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-neutral-100 text-neutral-600'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Budget</span>
                        <span className="font-bold text-neutral-900">{formatCurrency(project.baselinePrice, client.currency)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Actual Cost</span>
                        <span className="font-bold text-neutral-900">{formatCurrency(project.actualCost, client.currency)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Billing / Invoices */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary-600" />
              Billing & Invoices
            </h3>
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden text-sm">
              <table className="w-full text-left">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 font-bold text-neutral-700">Invoice #</th>
                    <th className="px-4 py-3 font-bold text-neutral-700">Status</th>
                    <th className="px-4 py-3 font-bold text-neutral-700">Date</th>
                    <th className="px-4 py-3 font-bold text-neutral-700 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {clientInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-neutral-500 italic">No invoices found.</td>
                    </tr>
                  ) : (
                    clientInvoices.map(invoice => (
                      <tr key={invoice.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3 text-primary-600 font-bold">{invoice.invoiceNumber}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                            invoice.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                            'bg-neutral-100 text-neutral-600'
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-neutral-500">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right font-bold text-neutral-900">{formatCurrency(invoice.total, client.currency)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quotes Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              Quotations
            </h3>
            <button className="text-sm font-bold text-primary-600 hover:text-primary-700">View All</button>
          </div>
          
          <div className="space-y-3">
            {clientQuotes.length === 0 ? (
              <div className="py-8 text-center bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                <p className="text-xs text-neutral-500 font-medium">No quotations yet.</p>
              </div>
            ) : (
              clientQuotes.map(quote => (
                <div key={quote.id} className="p-3 bg-white border border-neutral-200 rounded-lg flex items-center justify-between hover:border-primary-200 transition-colors cursor-pointer group">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-neutral-900 group-hover:text-primary-600 transition-colors truncate">Quote v{quote.version}</p>
                    <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-tight">
                      {new Date(quote.createdAt).toLocaleDateString()} • {quote.status}
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-sm font-bold text-neutral-900">{formatCurrency(quote.totalPrice, client.currency)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Contact Card */}
          <Card className="bg-neutral-900 text-white">
            <CardContent className="p-5">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-400" />
                Quick Actions
              </h4>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 rounded transition-colors flex items-center justify-between">
                  Email Project Status
                  <TrendingUp className="w-3 h-3 text-primary-400" />
                </button>
                <button className="w-full text-left px-3 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 rounded transition-colors flex items-center justify-between">
                  Export Client Ledger
                  <Receipt className="w-3 h-3 text-emerald-400" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)}
        initialClientId={id}
      />
    </div>
  );
};
