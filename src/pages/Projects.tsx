import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent } from '../components/ui/Card';
import { Briefcase, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency, calculateMargin, getMarginColor } from '../lib/finance';

export const Projects = () => {
  const { projects, fetchProjects, loading } = useStore();

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Projects</h2>
        <p className="text-neutral-500">Delivery roadmap and real-time profitability tracking.</p>
      </div>

      {loading && projects.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 px-6 text-center border-dashed">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <Briefcase className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">No active projects</h3>
          <p className="text-neutral-500 max-w-sm mt-2">
            Projects are created automatically when a quote is approved.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {projects.map((project) => {
            const currentMargin = calculateMargin(project.baselinePrice, project.actualCost || project.baselineCost);
            const marginDrift = currentMargin - project.baselineMargin;

            return (
              <div 
                key={project.id} 
                className="cursor-pointer hover:shadow-md transition-shadow rounded-xl overflow-hidden"
                onClick={() => window.location.hash = `#projects/${project.id}`}
              >
                <Card className="border-l-4 border-l-primary-600 h-full">
                  <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          project.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {project.status}
                        </span>
                        <h3 className="text-lg font-bold text-neutral-900">{project.name}</h3>
                      </div>
                      <p className="text-sm text-neutral-500 mt-1">Client: {project.client?.name}</p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-6">
                        <div>
                          <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">Revenue</p>
                          <p className="text-lg font-financial font-bold">{formatCurrency(project.baselinePrice)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">Actual Cost</p>
                          <p className="text-lg font-financial font-bold">{formatCurrency(project.actualCost || project.baselineCost)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">Baseline Margin</p>
                          <p className="text-lg font-financial font-bold text-neutral-400">{project.baselineMargin.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">Current Margin</p>
                          <p className={`text-xl font-financial font-black ${getMarginColor(currentMargin)}`}>
                            {currentMargin.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="lg:w-64 bg-neutral-50 rounded-lg p-4 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-neutral-500 uppercase">Margin Drift</span>
                        {marginDrift < 0 ? (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className={`text-2xl font-black font-mono ${marginDrift < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {marginDrift > 0 ? '+' : ''}{marginDrift.toFixed(1)}%
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        Compared to initial baseline approval
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};
