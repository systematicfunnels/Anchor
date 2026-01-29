import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { 
  BarChart3
} from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';

export const UnitEconomics = () => {
  const { formatCurrency } = useCurrency();
  const { projects, invoices, fetchProjects, fetchInvoices } = useStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchProjects();
    fetchInvoices();
  }, []);

  const years = [
    new Date().getFullYear(),
    new Date().getFullYear() - 1,
    new Date().getFullYear() - 2
  ];

  const projectMetrics = projects.map(project => {
    const projectInvoices = invoices.filter(inv => inv.projectId === project.id && inv.status === 'Paid');
    const revenue = projectInvoices.reduce((sum, inv) => sum + inv.total, 0);
    // Use actualCost for expenses, baselineCost for estimated internal costs
    const cost = project.actualCost || project.baselineCost; 
    const profit = revenue - cost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      ...project,
      revenue,
      cost,
      profit,
      margin
    };
  }).filter(p => {
    if (!p.startDate) return true;
    const projectYear = new Date(p.startDate).getFullYear();
    return projectYear === selectedYear;
  });

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Unit Economics</h2>
          <p className="text-neutral-500 text-sm">Reflection on project profitability (Read-only)</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg p-1 shadow-sm">
          {years.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                selectedYear === year 
                ? 'bg-neutral-900 text-white shadow-md' 
                : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-neutral-900">
            {formatCurrency(projectMetrics.reduce((sum, p) => sum + p.revenue, 0))}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Total Profit</p>
          <p className="text-2xl font-bold text-neutral-900">
            {formatCurrency(projectMetrics.reduce((sum, p) => sum + p.profit, 0))}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Avg. Margin</p>
          <p className="text-2xl font-bold text-neutral-900">
            {(projectMetrics.reduce((sum, p) => sum + p.margin, 0) / (projectMetrics.length || 1)).toFixed(1)}%
          </p>
        </Card>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Project</th>
              <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Revenue</th>
              <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Cost</th>
              <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Profit</th>
              <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Margin</th>
              <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {projectMetrics.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-neutral-500 italic">
                  No project data found for {selectedYear}.
                </td>
              </tr>
            ) : projectMetrics.map(project => (
              <tr key={project.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-neutral-900">{project.name}</p>
                  <p className="text-xs text-neutral-500 uppercase tracking-tight">{project.type}</p>
                </td>
                <td className="px-6 py-4 text-right font-medium text-neutral-900">{formatCurrency(project.revenue)}</td>
                <td className="px-6 py-4 text-right text-neutral-600">{formatCurrency(project.cost)}</td>
                <td className={`px-6 py-4 text-right font-bold ${project.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatCurrency(project.profit)}
                </td>
                <td className="px-6 py-4 text-right font-medium text-neutral-900">{project.margin.toFixed(1)}%</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    project.margin >= 30 ? 'bg-emerald-100 text-emerald-700' :
                    project.margin >= 15 ? 'bg-blue-100 text-blue-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {project.margin >= 30 ? 'High Value' : project.margin >= 15 ? 'Healthy' : 'Low Margin'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-primary-50 border border-primary-100 rounded-lg p-6">
        <h4 className="text-primary-900 font-bold mb-2 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Solo Insight
        </h4>
        <p className="text-primary-800 text-sm leading-relaxed">
          Based on the current year, your high-margin projects are primarily in the <strong>Fixed Fee</strong> category. 
          Focusing on these will improve your overall unit economics without increasing total work volume.
        </p>
      </div>
    </div>
  );
};
