import { 
  TrendingUp, 
  Briefcase, 
  Receipt,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';

const stats = [
  { label: 'Cash Snapshot', value: '$124,500', trend: '+12%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Active Projects', value: '24', trend: '+5', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Upcoming Invoices', value: '$12,400', trend: '3 due', icon: Receipt, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Margin Alerts', value: '2', trend: 'Critical', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
];

export const Dashboard = () => {
  const navigate = (path: string) => { window.location.hash = path; };
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Operations Dashboard</h2>
          <p className="text-neutral-500 text-sm">Real-time pulse of your service delivery and financials.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-neutral-200 text-neutral-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-neutral-50 transition-colors">
            New Quote
          </button>
          <button className="bg-primary-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors">
            New Project
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
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">Margin Risk: Mobile App Redesign</p>
                      <p className="text-xs text-neutral-500">Current margin (24%) dropped below baseline (35%)</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('#projects')}
                    className="text-xs font-bold text-primary-600 hover:underline"
                  >
                    Review Financials
                  </button>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">Overdue Invoice: Acme Corp</p>
                      <p className="text-xs text-neutral-500">INV-2024-001 is 5 days overdue (£4,500.00)</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('#invoices')}
                    className="text-xs font-bold text-primary-600 hover:underline"
                  >
                    Send Reminder
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between py-3 px-4 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-tight">Active Delivery Roadmap</h3>
              <button className="text-xs text-primary-600 font-bold hover:underline">View All Projects</button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="bg-neutral-50/50">PROJECT</th>
                      <th className="bg-neutral-50/50">PROGRESS</th>
                      <th className="bg-neutral-50/50">MARGIN</th>
                      <th className="bg-neutral-50/50"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    <tr>
                      <td className="py-3">
                        <p className="font-bold text-sm">Cloud Migration</p>
                        <p className="text-[10px] text-neutral-400 font-bold">Global Tech • Due in 12 days</p>
                      </td>
                      <td className="py-3">
                        <div className="w-32 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="bg-primary-500 h-full w-[65%]" />
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1 font-bold">65% Complete</p>
                      </td>
                      <td className="py-3 font-financial font-bold text-green-600">42.5%</td>
                      <td className="py-3 text-right">
                        <button className="p-1 hover:bg-neutral-100 rounded">
                          <ArrowRight className="w-4 h-4 text-neutral-400" />
                        </button>
                      </td>
                    </tr>
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
                {[
                  { client: 'Acme Corp', amount: '£2,400', date: 'Jan 28' },
                  { client: 'Stark Ind.', amount: '£12,000', date: 'Feb 02' },
                ].map((inv) => (
                  <div key={inv.client} className="flex items-center justify-between border-l-2 border-primary-500 pl-3">
                    <div>
                      <p className="text-sm font-bold text-neutral-900">{inv.client}</p>
                      <p className="text-[10px] text-neutral-500 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due {inv.date}
                      </p>
                    </div>
                    <p className="font-financial font-bold text-neutral-900">{inv.amount}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
