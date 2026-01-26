import { Card } from '../components/ui/Card';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export const Reports = () => {
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
          <button className="bg-white border border-neutral-200 text-neutral-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-neutral-50 transition-colors">
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
          <div className="text-2xl font-bold font-financial">$124,500.00</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
            <ArrowUpRight className="w-3 h-3" />
            <span>+12.5% vs last month</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-500">Avg. Project Margin</span>
            <DollarSign className="w-4 h-4 text-primary-500" />
          </div>
          <div className="text-2xl font-bold font-financial">42.8%</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
            <ArrowDownRight className="w-3 h-3" />
            <span>-2.1% vs last month</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-500">Active Clients</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-financial">18</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
            <ArrowUpRight className="w-3 h-3" />
            <span>+2 new this month</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-500">Completed Projects</span>
            <Briefcase className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold font-financial">45</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
            <span>Stable vs last month</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Project Profitability</h3>
          <div className="space-y-4">
            {[
              { name: 'Website Redesign', revenue: '$15,000', margin: '52%', status: 'high' },
              { name: 'Mobile App Dev', revenue: '$42,000', margin: '38%', status: 'medium' },
              { name: 'SEO Audit', revenue: '$2,500', margin: '65%', status: 'high' },
              { name: 'Cloud Migration', revenue: '$12,000', margin: '24%', status: 'low' },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-neutral-500">{item.revenue} revenue</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${
                    item.status === 'high' ? 'text-green-600' : 
                    item.status === 'medium' ? 'text-primary-600' : 'text-red-600'
                  }`}>{item.margin}</div>
                  <div className="text-[10px] uppercase font-bold text-neutral-400">Margin</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Client Profitability</h3>
          <div className="space-y-4">
            {[
              { name: 'Acme Corp', revenue: '$57,000', margin: '45%', projects: 3 },
              { name: 'Global Tech', revenue: '$28,500', margin: '32%', projects: 2 },
              { name: 'Stark Ind.', revenue: '$12,400', margin: '58%', projects: 1 },
              { name: 'Wayne Ent.', revenue: '$4,200', margin: '41%', projects: 1 },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-neutral-500">{item.projects} projects</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-neutral-900">{item.margin}</div>
                  <div className="text-xs text-neutral-500 font-financial">{item.revenue}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
