import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';
import { useCurrency } from '../../hooks/useCurrency';
import { X } from 'lucide-react';
import { Project, ProjectStatus, ProjectType } from '../../types';
import { calculateMargin, convertCurrency } from '../../lib/finance';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  initialClientId?: string;
}

export const ProjectModal = ({ isOpen, onClose, project, initialClientId }: ProjectModalProps) => {
  const { getCurrencySymbol, currencies } = useCurrency();
  const { updateProject, clients, updateClient, addProject } = useStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    status: 'Active' as ProjectStatus,
    type: 'Fixed' as ProjectType,
    baselineCost: 0,
    baselinePrice: 0,
    actualCost: 0,
    clientId: '',
    description: '',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        status: project.status,
        type: project.type,
        baselineCost: project.baselineCost,
        baselinePrice: project.baselinePrice,
        actualCost: project.actualCost || project.baselineCost,
        clientId: project.clientId || '',
        description: project.description || '',
      });
    } else if (initialClientId) {
      setFormData(prev => ({ ...prev, clientId: initialClientId }));
    }
  }, [project, isOpen, initialClientId]);

  const selectedClient = clients.find(c => c.id === formData.clientId);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (project) {
        const { clientId, ...rest } = formData;
        await updateProject({ ...rest, id: project.id });
      } else if (formData.clientId) {
        await addProject({
          ...formData,
          baselineMargin: calculateMargin(formData.baselinePrice, formData.baselineCost),
          progress: 0,
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-neutral-900">
            {project ? 'Edit Project' : 'New Project'}
          </h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {!project && (
            <div>
              <label htmlFor="project-client" className="block text-sm font-medium text-neutral-700 mb-1">Client *</label>
              <select
                id="project-client"
                name="clientId"
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              >
                <option value="">Select a client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="project-name" className="block text-sm font-medium text-neutral-700 mb-1">Project Name *</label>
            <input
              id="project-name"
              name="name"
              required
              autoFocus
              type="text"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="project-status" className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
              <select
                id="project-status"
                name="status"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
              >
                <option value="Planned">Planned</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
            <div>
              <label htmlFor="project-currency" className="block text-sm font-medium text-neutral-700 mb-1">Client Currency</label>
              <select
                id="project-currency"
                name="currency"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-neutral-50"
                value={selectedClient?.currency || 'USD'}
                onChange={async (e) => {
                  const newCurrency = e.target.value as any;
                  if (selectedClient) {
                    const oldCurrency = selectedClient.currency || 'USD';
                    // Convert current values to new currency
                    setFormData(prev => ({
                      ...prev,
                      baselineCost: Number(convertCurrency(prev.baselineCost, oldCurrency, newCurrency).toFixed(2)),
                      baselinePrice: Number(convertCurrency(prev.baselinePrice, oldCurrency, newCurrency).toFixed(2)),
                      actualCost: Number(convertCurrency(prev.actualCost, oldCurrency, newCurrency).toFixed(2)),
                    }));
                    
                    await updateClient({ ...selectedClient, currency: newCurrency });
                  }
                }}
              >
                {currencies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="project-type" className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
            <select
              id="project-type"
              name="type"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ProjectType })}
            >
              <option value="Fixed">Fixed Price</option>
              <option value="T&M">Time & Materials</option>
              <option value="Retainer">Retainer</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="project-cost" className="block text-sm font-medium text-neutral-700 mb-1">
                Baseline Cost ({getCurrencySymbol(selectedClient?.currency)})
              </label>
              <input
                id="project-cost"
                name="baselineCost"
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500 font-mono"
                value={formData.baselineCost}
                onChange={(e) => setFormData({ ...formData, baselineCost: Math.max(0, parseFloat(e.target.value) || 0) })}
              />
            </div>
            <div>
              <label htmlFor="project-price" className="block text-sm font-medium text-neutral-700 mb-1">
                Quoted Price ({getCurrencySymbol(selectedClient?.currency)})
              </label>
              <input
                id="project-price"
                name="baselinePrice"
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500 font-mono"
                value={formData.baselinePrice}
                onChange={(e) => setFormData({ ...formData, baselinePrice: Math.max(0, parseFloat(e.target.value) || 0) })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="project-actual-cost" className="block text-sm font-medium text-neutral-700 mb-1">
              Actual Cost to Date ({getCurrencySymbol(selectedClient?.currency)})
            </label>
            <input
              id="project-actual-cost"
              name="actualCost"
              type="number"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500 font-mono"
              value={formData.actualCost}
              onChange={(e) => setFormData({ ...formData, actualCost: Math.max(0, parseFloat(e.target.value) || 0) })}
            />
          </div>

          <div className="pt-6 border-t border-neutral-100 flex justify-end gap-3">
            <Button type="button" intent="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
