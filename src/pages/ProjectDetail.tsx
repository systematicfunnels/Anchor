import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { Card, CardContent } from '../components/ui/Card';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { 
  ChevronLeft, 
  AlertTriangle, 
  Plus, 
  History,
  Target,
  BarChart3,
  Trash2
} from 'lucide-react';
import { formatCurrency, calculateMargin, getMarginColor } from '../lib/finance';
import { Project, Milestone, ScopeChange } from '../types';

export const ProjectDetail = () => {
  const currentPath = window.location.hash;
  const id = currentPath.split('/')[1];
  const navigate = (path: string) => { window.location.hash = path; };
  const { getProjectDetails, updateMilestone, deleteMilestone, createScopeChange, approveScopeChange, deleteScopeChange } = useStore();
  const { addNotification } = useNotificationStore();
  
  const [project, setProject] = useState<Project & { milestones: Milestone[], scopeChanges: ScopeChange[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScopeModal, setShowScopeModal] = useState(false);
  const [newScope, setNewScope] = useState({ description: '', costImpact: 0, priceImpact: 0 });
  
  const [confirmMilestone, setConfirmMilestone] = useState<Milestone | null>(null);
  const [confirmDeleteMilestoneId, setConfirmDeleteMilestoneId] = useState<string | null>(null);
  const [confirmScopeId, setConfirmScopeId] = useState<string | null>(null);
  const [confirmDeleteScopeId, setConfirmDeleteScopeId] = useState<string | null>(null);

  useEffect(() => {
    loadDetails();
    
    // Listen for global save shortcut
    const handleSave = () => {
      addNotification({ type: 'info', message: 'Saving project data...' });
      loadDetails();
    };
    window.addEventListener('app-save', handleSave);
    return () => window.removeEventListener('app-save', handleSave);
  }, [id]);

  const loadDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const details = await getProjectDetails(id);
      setProject(details);
    } catch (error) {
      console.error('Failed to load project details', error);
      addNotification({ type: 'error', message: 'Failed to load project details. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleMilestoneToggle = async (milestone: Milestone) => {
    const newStatus = milestone.status === 'Completed' ? 'In Progress' : 'Completed';
    await updateMilestone({ id: milestone.id, status: newStatus, progress: newStatus === 'Completed' ? 100 : 50 });
    addNotification({ 
      type: 'success', 
      message: `Milestone "${milestone.name}" updated to ${newStatus}` 
    });
    loadDetails();
  };

  const handleCreateScopeChange = async () => {
    if (!id) return;
    await createScopeChange({ ...newScope, projectId: id });
    setShowScopeModal(false);
    setNewScope({ description: '', costImpact: 0, priceImpact: 0 });
    addNotification({ type: 'success', message: 'Scope change request created' });
    loadDetails();
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    await deleteMilestone(milestoneId);
    setConfirmDeleteMilestoneId(null);
    addNotification({ type: 'success', message: 'Milestone deleted' });
    loadDetails();
  };

  const handleApproveScope = async (scopeId: string) => {
    await approveScopeChange(scopeId);
    setConfirmScopeId(null);
    addNotification({ type: 'success', message: 'Scope change approved and financials updated' });
    loadDetails();
  };

  const handleDeleteScope = async (scopeId: string) => {
    await deleteScopeChange(scopeId);
    setConfirmDeleteScopeId(null);
    addNotification({ type: 'success', message: 'Scope change deleted' });
    loadDetails();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  
  if (!project) return (
    <div className="flex flex-col items-center justify-center h-96 space-y-4">
      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
        <Target className="w-8 h-8 text-neutral-400" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold text-neutral-900">Project not found</h3>
        <p className="text-neutral-500">The project you're looking for doesn't exist or has been removed.</p>
      </div>
      <button 
        onClick={() => navigate('#projects')}
        className="bg-white border border-neutral-200 text-neutral-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-neutral-50 transition-all shadow-sm"
      >
        Back to Projects
      </button>
    </div>
  );

  const currentMargin = calculateMargin(project.baselinePrice, project.actualCost || project.baselineCost);

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('#projects')}
        className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Projects
      </button>

      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">{project.name}</h2>
          <p className="text-neutral-500">Client: {project.client?.name}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowScopeModal(true)}
            className="flex items-center gap-2 bg-white border border-neutral-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-neutral-50"
          >
            <Plus className="w-4 h-4" />
            Scope Change
          </button>
          <button 
            onClick={() => addNotification({ type: 'info', message: 'Invoice generation logic is being finalized. You will be able to generate invoices from roadmaps soon.' })}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-700"
          >
            Generate Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-600" />
              Delivery Roadmap
            </h3>
            <div className="space-y-4">
              {project.milestones.length === 0 ? (
                <p className="text-neutral-500 italic">No milestones defined for this project.</p>
              ) : (
                project.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                    <div className="flex items-center gap-4">
                      <input 
                        type="checkbox" 
                        checked={milestone.status === 'Completed'}
                        onChange={() => setConfirmMilestone(milestone)}
                        className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <p className="font-bold text-neutral-900">{milestone.name}</p>
                        <p className="text-xs text-neutral-500">Est. Cost: {formatCurrency(milestone.estimatedCost)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-neutral-900">{formatCurrency(milestone.price)}</p>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          milestone.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {milestone.status}
                        </span>
                      </div>
                      <button 
                        onClick={() => setConfirmDeleteMilestoneId(milestone.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Milestone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              Financial Health
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Revenue</p>
                <p className="text-2xl font-financial font-bold">{formatCurrency(project.baselinePrice)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Actual Cost</p>
                <p className="text-2xl font-financial font-bold">{formatCurrency(project.actualCost || project.baselineCost)}</p>
              </div>
              <div className="pt-4 border-t border-neutral-100">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Current Margin</p>
                    <p className={`text-3xl font-financial font-black ${getMarginColor(currentMargin)}`}>
                      {currentMargin.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Baseline</p>
                    <p className="text-lg font-financial font-bold text-neutral-400">{project.baselineMargin.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
              {currentMargin < project.baselineMargin && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-xs text-red-700 leading-relaxed">
                    Margin has dropped below baseline. Review actual costs and consider raising a scope change if the requirements have shifted.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-primary-600" />
            Scope Changes & History
          </h3>
          <div className="space-y-4">
            {project.scopeChanges.length === 0 ? (
              <p className="text-neutral-500 italic">No scope changes recorded.</p>
            ) : (
              project.scopeChanges.map((change) => (
                <div key={change.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                  <div className="flex-1">
                    <p className="font-bold text-neutral-900">{change.description}</p>
                    <div className="flex gap-4 mt-1">
                      <p className="text-xs text-neutral-500">Cost Impact: <span className="text-red-600">+{formatCurrency(change.costImpact)}</span></p>
                      <p className="text-xs text-neutral-500">Price Impact: <span className="text-green-600">+{formatCurrency(change.priceImpact)}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      change.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                      change.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {change.status}
                    </span>
                    {change.status === 'Pending' && (
                      <button 
                        onClick={() => setConfirmScopeId(change.id)}
                        className="text-xs font-bold text-primary-600 hover:text-primary-700"
                      >
                        Approve Change
                      </button>
                    )}
                    <button 
                      onClick={() => setConfirmDeleteScopeId(change.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Scope Change"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {showScopeModal && (
        <div className="fixed inset-0 bg-neutral-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-neutral-900 mb-6">New Scope Change</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Description</label>
                <textarea 
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                  rows={3}
                  placeholder="What changed?"
                  value={newScope.description}
                  onChange={(e) => setNewScope({ ...newScope, description: e.target.value })}
                />
              </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Cost Impact</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                      <input 
                        type="number"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-mono"
                        value={newScope.costImpact}
                        onChange={(e) => setNewScope({ ...newScope, costImpact: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Price Impact</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                      <input 
                        type="number"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-mono"
                        value={newScope.priceImpact}
                        onChange={(e) => setNewScope({ ...newScope, priceImpact: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
                {newScope.priceImpact > 0 && (
                  <div className="p-3 bg-primary-50 rounded-lg border border-primary-100">
                    <div className="flex justify-between text-xs">
                      <span className="text-primary-700 font-bold uppercase">Estimated Margin Impact</span>
                      <span className="text-primary-900 font-bold">
                        {calculateMargin(newScope.priceImpact, newScope.costImpact).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setShowScopeModal(false)}
                  className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-bold text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateScopeChange}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700"
                >
                  Save Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={!!confirmMilestone}
        onClose={() => setConfirmMilestone(null)}
        onConfirm={() => confirmMilestone && handleMilestoneToggle(confirmMilestone)}
        title="Update Milestone Status"
        description={`Are you sure you want to mark "${confirmMilestone?.name}" as ${confirmMilestone?.status === 'Completed' ? 'In Progress' : 'Completed'}?`}
        impact="Changes project progress and delivery timeline visibility."
      />

      <ConfirmationDialog
        isOpen={!!confirmDeleteMilestoneId}
        onClose={() => setConfirmDeleteMilestoneId(null)}
        onConfirm={() => confirmDeleteMilestoneId && handleDeleteMilestone(confirmDeleteMilestoneId)}
        title="Delete Milestone"
        description="Are you sure you want to delete this milestone? This will remove its associated price and cost from the project roadmap."
        confirmText="Delete Milestone"
        intent="danger"
      />

      <ConfirmationDialog
        isOpen={!!confirmScopeId}
        onClose={() => setConfirmScopeId(null)}
        onConfirm={() => confirmScopeId && handleApproveScope(confirmScopeId)}
        title="Approve Scope Change"
        description="Approving this change will permanently update the project budget and financial baselines."
        confirmText="Approve & Update Budget"
        impact="Changes project price, cost, and margin expectations."
      />

      <ConfirmationDialog
        isOpen={!!confirmDeleteScopeId}
        onClose={() => setConfirmDeleteScopeId(null)}
        onConfirm={() => confirmDeleteScopeId && handleDeleteScope(confirmDeleteScopeId)}
        title="Delete Scope Change"
        description="Are you sure you want to delete this scope change? This will remove its impact from your project financials."
        confirmText="Delete Change"
        intent="danger"
      />
    </div>
  );
};
