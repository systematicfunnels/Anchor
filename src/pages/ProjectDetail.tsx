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
  Trash2,
  FileText,
  Upload,
  Download,
  File,
  MoreVertical,
  Archive,
  Edit2
} from 'lucide-react';
import { calculateMargin, getMarginColor } from '../lib/finance';
import { Project, Milestone, ScopeChange, Document, Expense } from '../types';
import { useCurrency } from '../hooks/useCurrency';
import { DropdownMenu } from '../components/ui/DropdownMenu';
import { ProjectModal } from '../components/projects/ProjectModal';

export const ProjectDetail = () => {
  const { formatCurrency, getCurrencySymbol } = useCurrency();
  const currentPath = window.location.hash;
  const id = currentPath.split('/')[1];
  const navigate = (path: string) => { window.location.hash = path; };
  const { 
    getProjectDetails, 
    updateMilestone, 
    deleteMilestone, 
    createScopeChange, 
    approveScopeChange, 
    deleteScopeChange,
    uploadDocument,
    downloadDocument,
    deleteDocument,
    addExpense,
    deleteExpense,
    generateInvoice,
    archiveProject,
    deleteProject
  } = useStore();
  const { addNotification } = useNotificationStore();
  
  const [project, setProject] = useState<Project & { milestones: Milestone[], scopeChanges: ScopeChange[], documents: Document[], expenses: Expense[] } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projectToArchive, setProjectToArchive] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showScopeModal, setShowScopeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newScope, setNewScope] = useState({ description: '', costImpact: 0, priceImpact: 0 });
  const [newExpense, setNewExpense] = useState({ description: '', category: 'Software', amount: 0 });
  
  const [confirmMilestone, setConfirmMilestone] = useState<Milestone | null>(null);
  const [confirmDeleteMilestoneId, setConfirmDeleteMilestoneId] = useState<string | null>(null);
  const [confirmScopeId, setConfirmScopeId] = useState<string | null>(null);
  const [confirmDeleteScopeId, setConfirmDeleteScopeId] = useState<string | null>(null);
  const [confirmDeleteDocumentId, setConfirmDeleteDocumentId] = useState<string | null>(null);
  const [selectedMilestones, setSelectedMilestones] = useState<string[]>([]);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;

    setUploading(true);
    try {
      await uploadDocument(id, file);
      await loadDetails();
    } catch (error) {
      console.error('File upload failed', error);
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    await deleteDocument(documentId);
    setConfirmDeleteDocumentId(null);
    await loadDetails();
  };

  const isLocked = project?.status === 'Completed';
  const isTestMode = true; // Enabled for testing as requested

  const handleAddExpense = async () => {
    if (!id) return;
    await addExpense({ ...newExpense, projectId: id, date: new Date() });
    setShowExpenseModal(false);
    setNewExpense({ description: '', category: 'Software', amount: 0 });
    loadDetails();
  };

  const handleGenerateInvoice = async () => {
    if (!id) return;
    setIsGeneratingInvoice(true);
    try {
      await generateInvoice(id, selectedMilestones);
      setSelectedMilestones([]);
      navigate('#invoices');
    } catch (error) {
      console.error('Invoice generation failed', error);
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleArchive = async () => {
    if (!projectToArchive) return;
    await archiveProject(projectToArchive);
    setProjectToArchive(null);
    addNotification({ type: 'success', message: 'Project archived' });
    navigate('#projects');
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    await deleteProject(projectToDelete);
    setProjectToDelete(null);
    addNotification({ type: 'success', message: 'Project deleted' });
    navigate('#projects');
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
    <div className="page-container">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
        <button 
          onClick={() => navigate('#projects')}
          className="hover:text-primary-600 transition-colors"
        >
          Projects
        </button>
        <span className="text-neutral-300">/</span>
        <span className="text-neutral-900 font-bold">{project.name}</span>
      </nav>

      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('#projects')}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-500" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-neutral-900">{project.name}</h2>
              {isLocked && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                  Completed (Testing Enabled)
                </span>
              )}
              <DropdownMenu
                trigger={
                  <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-500">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                }
                items={[
                  { 
                    label: 'Edit Project', 
                    icon: <Edit2 className="w-4 h-4" />, 
                    onClick: () => setIsEditModalOpen(true) 
                  },
                  { 
                    label: 'Archive Project', 
                    icon: <Archive className="w-4 h-4" />, 
                    onClick: () => setProjectToArchive(project.id) 
                  },
                  { 
                    label: 'Delete Project', 
                    icon: <Trash2 className="w-4 h-4" />, 
                    onClick: () => setProjectToDelete(project.id), 
                    variant: 'danger' 
                  }
                ]}
              />
            </div>
            <p className="text-neutral-500">Client: {project.client?.name}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowScopeModal(true)}
            className="flex items-center gap-2 bg-white border border-neutral-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-neutral-50"
          >
            <Plus className="w-4 h-4" />
            New Scope Change
          </button>
          <button 
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-2 bg-white border border-neutral-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-neutral-50"
          >
            <Plus className="w-4 h-4" />
            New Expense
          </button>
          <button 
            onClick={handleGenerateInvoice}
            disabled={isGeneratingInvoice}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isGeneratingInvoice ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            {selectedMilestones.length > 0 ? `Bill Selected (${selectedMilestones.length})` : 'New Invoice'}
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
                      <div className="flex flex-col gap-2">
                        {(!isLocked || isTestMode) && milestone.status === 'Completed' && (
                          <input 
                            type="checkbox" 
                            title="Select for invoicing"
                            checked={selectedMilestones.includes(milestone.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMilestones([...selectedMilestones, milestone.id]);
                              } else {
                                setSelectedMilestones(selectedMilestones.filter(id => id !== milestone.id));
                              }
                            }}
                            className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                          />
                        )}
                        <input 
                          type="checkbox" 
                          checked={milestone.status === 'Completed'}
                          onChange={() => handleMilestoneToggle(milestone)}
                          className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900">{milestone.name}</p>
                        <p className="text-xs text-neutral-500">Est. Cost: {formatCurrency(milestone.estimatedCost, project.client?.currency)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-neutral-900">{formatCurrency(milestone.price, project.client?.currency)}</p>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          milestone.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {milestone.status}
                        </span>
                      </div>
                      {(!isLocked || isTestMode) && (
                        <button 
                          onClick={() => setConfirmDeleteMilestoneId(milestone.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Milestone"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              Project Expenses
            </h3>
            {(!isLocked || isTestMode) && (
              <button 
                onClick={() => setShowExpenseModal(true)}
                className="text-primary-600 hover:text-primary-700 text-sm font-bold flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                New Expense
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="py-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">Date</th>
                  <th className="py-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">Category</th>
                  <th className="py-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">Description</th>
                  <th className="py-2 text-xs font-bold text-neutral-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {project.expenses?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-500 italic">No expenses logged for this project.</td>
                  </tr>
                ) : (
                  project.expenses?.map((expense) => (
                    <tr key={expense.id} className="group">
                      <td className="py-3 text-sm text-neutral-600">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-[10px] font-bold uppercase">
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-3 text-sm font-medium text-neutral-900">{expense.description}</td>
                      <td className="py-3 text-sm font-bold text-neutral-900 text-right">{formatCurrency(expense.amount, project.client?.currency)}</td>
                      <td className="py-3 text-right">
                        {(!isLocked || isTestMode) && (
                          <button 
                            onClick={() => deleteExpense(expense.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
                <p className="text-2xl font-financial font-bold">{formatCurrency(project.baselinePrice, project.client?.currency)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Actual Cost</p>
                <p className="text-2xl font-financial font-bold">{formatCurrency(project.actualCost || project.baselineCost, project.client?.currency)}</p>
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              Project Documents
            </h3>
            <div className="relative">
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold cursor-pointer transition-colors ${
                  uploading || isLocked
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' 
                    : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                }`}
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? 'Uploading...' : 'Upload Doc'}
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.documents?.length === 0 ? (
              <div className="col-span-full py-8 text-center bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                <File className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500 italic">No documents uploaded yet.</p>
              </div>
            ) : (
              project.documents?.map((doc) => (
                <div key={doc.id} className="group relative flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded-lg hover:border-primary-200 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-neutral-900 truncate" title={doc.name}>
                      {doc.name}
                    </p>
                    <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-tight">
                      {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => downloadDocument(doc.id)}
                      className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {(!isLocked || isTestMode) && (
                      <button
                        onClick={() => setConfirmDeleteDocumentId(doc.id)}
                        className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
                      <p className="text-xs text-neutral-500">Cost Impact: <span className="text-red-600">+{formatCurrency(change.costImpact, project.client?.currency)}</span></p>
                      <p className="text-xs text-neutral-500">Price Impact: <span className="text-green-600">+{formatCurrency(change.priceImpact, project.client?.currency)}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      change.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                      change.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {change.status}
                    </span>
                    {change.status === 'Pending' && (!isLocked || isTestMode) && (
                      <button 
                        onClick={() => setConfirmScopeId(change.id)}
                        className="text-xs font-bold text-primary-600 hover:text-primary-700"
                      >
                        Approve Change
                      </button>
                    )}
                    {(!isLocked || isTestMode) && (
                      <button 
                        onClick={() => setConfirmDeleteScopeId(change.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Scope Change"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                        {getCurrencySymbol(project?.client?.currency)}
                      </span>
                      <input 
                        type="number"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-mono"
                        value={newScope.costImpact}
                        onChange={(e) => setNewScope({ ...newScope, costImpact: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Price Impact</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                        {getCurrencySymbol(project?.client?.currency)}
                      </span>
                      <input 
                        type="number"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-mono"
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

      {showExpenseModal && (
        <div className="fixed inset-0 bg-neutral-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-neutral-900 mb-6">Log Project Expense</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Description</label>
                <input 
                  type="text"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                  placeholder="What was the expense for?"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Category</label>
                  <select 
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  >
                    <option value="Software">Software</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Subcontractor">Subcontractor</option>
                    <option value="Travel">Travel</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                      {getCurrencySymbol(project?.client?.currency)}
                    </span>
                    <input 
                      type="number"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-mono"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-bold text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddExpense}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700"
                >
                  Log Expense
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

      <ConfirmationDialog
        isOpen={!!confirmDeleteDocumentId}
        onClose={() => setConfirmDeleteDocumentId(null)}
        onConfirm={() => confirmDeleteDocumentId && handleDeleteDocument(confirmDeleteDocumentId)}
        title="Delete Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete Document"
        intent="danger"
      />

      {project && (
        <ProjectModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          project={project}
        />
      )}

      <ConfirmationDialog
        isOpen={!!projectToArchive}
        onClose={() => setProjectToArchive(null)}
        onConfirm={handleArchive}
        title="Archive Project"
        description="Are you sure you want to archive this project? It will be hidden from the active list but its data will be preserved."
        confirmText="Archive Project"
      />

      <ConfirmationDialog
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        description="Are you sure you want to delete this project? This will also delete all associated milestones, scope changes, and expenses. This action cannot be undone."
        confirmText="Delete Project"
        intent="danger"
      />
    </div>
  );
};
