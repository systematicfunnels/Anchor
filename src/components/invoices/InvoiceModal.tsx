import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';
import { useCurrency } from '../../hooks/useCurrency';
import { X } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal = ({ isOpen, onClose }: InvoiceModalProps) => {
  const { getCurrencySymbol } = useCurrency();
  const { clients, projects, fetchClients, fetchProjects, createManualInvoice } = useStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    projectId: '',
    subtotal: '',
    taxRate: '0',
  });

  useEffect(() => {
    if (isOpen) {
      fetchClients();
      fetchProjects();
      setFormData({
        clientId: '',
        projectId: '',
        subtotal: '',
        taxRate: '0',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.subtotal) return;

    setLoading(true);
    try {
      await createManualInvoice({
        clientId: formData.clientId,
        projectId: formData.projectId || undefined,
        subtotal: parseFloat(formData.subtotal),
        taxRate: parseFloat(formData.taxRate),
      });
      onClose();
    } catch (error) {
      console.error('Error creating manual invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => p.clientId === formData.clientId);
  const selectedClient = clients.find(c => c.id === formData.clientId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="text-lg font-bold">New Invoice</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Client *</label>
            <select
              required
              autoFocus
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value, projectId: '' })}
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Project (Optional)</label>
            <select
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              disabled={!formData.clientId}
            >
              <option value="">No associated project</option>
              {filteredProjects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Subtotal Amount *</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-neutral-400">
                  {getCurrencySymbol(selectedClient?.currency)}
                </span>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  value={formData.subtotal}
                  onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Tax Rate (%)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                />
                <span className="absolute right-3 top-2 text-neutral-400">%</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex justify-end gap-3">
            <Button type="button" intent="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.clientId || !formData.subtotal}>
              {loading ? 'Saving...' : 'Save Invoice'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
