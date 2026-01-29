import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent } from '../components/ui/Card';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { Briefcase, TrendingUp, AlertTriangle, Trash2, MoreVertical, Edit2, Plus } from 'lucide-react';
import { calculateMargin, getMarginColor } from '../lib/finance';
import { DropdownMenu } from '../components/ui/DropdownMenu';
import { ProjectModal } from '../components/projects/ProjectModal';
import { Project } from '../types';
import { useCurrency } from '../hooks/useCurrency';

export const Projects = () => {
  const { formatCurrency } = useCurrency();
  const { projects, fetchProjects, deleteProject, loading } = useStore();
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialClientId, setInitialClientId] = useState<string | undefined>();

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete);
      setProjectToDelete(null);
    }
  };

  const handleEdit = (project: Project) => {
    setProjectToEdit(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProjectToEdit(null);
    setInitialClientId(undefined);
  };

  const navigate = (path: string) => { window.location.hash = path; };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Projects</h2>
          <p className="text-sm text-neutral-500">Delivery roadmap and real-time profitability tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white border border-neutral-200 text-neutral-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-neutral-50 transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
          <button 
            onClick={() => navigate('#quotes')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-all shadow-md shadow-primary-500/20 flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4" />
            View Quotes
          </button>
        </div>
      </div>

      {loading && projects.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 px-6 text-center border-dashed border-2">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <Briefcase className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">No active projects yet</h3>
          <p className="text-neutral-500 max-w-sm mt-2 text-sm">
            Projects are created automatically when a quote is approved by a client.
          </p>
          <button 
            onClick={() => navigate('#quotes')}
            className="mt-6 bg-white border border-neutral-200 text-neutral-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-neutral-50 transition-all shadow-sm"
          >
            Go to Quotes
          </button>
        </Card>
      ) : (
        <div className="space-y-[var(--spacing-card-gap)]">
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
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            project.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            {project.status}
                          </span>
                          <h3 className="text-lg font-bold text-neutral-900">{project.name}</h3>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu
                            trigger={
                              <button className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            }
                            items={[
                              {
                                label: 'Edit Project',
                                icon: <Edit2 className="w-4 h-4" />,
                                onClick: () => handleEdit(project)
                              },
                              {
                                label: 'Delete Project',
                                icon: <Trash2 className="w-4 h-4" />,
                                variant: 'danger',
                                onClick: () => setProjectToDelete(project.id)
                              }
                            ]}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-neutral-500 mt-1">Client: {project.client?.name}</p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-6">
                        <div>
                          <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">Revenue</p>
                          <p className="text-lg font-financial font-bold">{formatCurrency(project.baselinePrice, project.client?.currency)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">Actual Cost</p>
                          <p className="text-lg font-financial font-bold">{formatCurrency(project.actualCost || project.baselineCost, project.client?.currency)}</p>
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

      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        project={projectToEdit}
        initialClientId={initialClientId}
      />

      <ConfirmationDialog
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        description="Are you sure you want to delete this project? This will permanently remove all associated milestones and scope changes."
        confirmText="Delete Project"
        intent="danger"
      />
    </div>
  );
};
