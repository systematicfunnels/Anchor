import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';
import { X, Calculator } from 'lucide-react';
import { calculateMargin } from '../../lib/finance';
import { useCurrency } from '../../hooks/useCurrency';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuoteModal = ({ isOpen, onClose }: QuoteModalProps) => {
  const { formatCurrency, getCurrencySymbol } = useCurrency();
  const { clients, createQuote } = useStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    totalCost: 0,
    totalPrice: 0,
    taxRate: 20, // Default tax rate
  });

  if (!isOpen) return null;

  const selectedClient = clients.find(c => c.id === formData.clientId);
  const clientCurrency = selectedClient?.currency;

  const margin = calculateMargin(formData.totalPrice, formData.totalCost);
  const taxAmount = (formData.totalPrice * formData.taxRate) / 100;
  const grandTotal = formData.totalPrice + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) return; // Handled by required attribute
    
    setLoading(true);
    try {
      await createQuote({
        ...formData,
        name: formData.name || 'New Quote',
        margin,
      });
      onClose();
      setFormData({ clientId: '', name: '', totalCost: 0, totalPrice: 0, taxRate: 20 });
    } catch (error) {
      // Error handled by store
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-neutral-900">Create New Quote</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Quote Name *</label>
              <input
                required
                autoFocus
                type="text"
                placeholder="e.g. Website Redesign v1"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Select Client *</label>
            {clients.length === 0 ? (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-100 flex flex-col gap-2">
                <p>No clients found in the system.</p>
                <button 
                  type="button"
                  onClick={() => {
                    onClose();
                    window.location.hash = '#clients';
                  }}
                  className="text-amber-700 font-bold hover:underline text-left"
                >
                  + Add your first client
                </button>
              </div>
            ) : (
              <select
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              >
                <option value="">Choose a client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Estimated Cost</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{getCurrencySymbol(clientCurrency)}</span>
                <input
                  type="number"
                  step="0.01"
                  className="w-full pl-7 pr-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500 font-mono"
                  value={formData.totalCost}
                  onChange={(e) => setFormData({ ...formData, totalCost: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Quoted Price (Excl. Tax)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{getCurrencySymbol(clientCurrency)}</span>
                <input
                  type="number"
                  step="0.01"
                  className="w-full pl-7 pr-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500 font-mono"
                  value={formData.totalPrice}
                  onChange={(e) => setFormData({ ...formData, totalPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Tax Rate (%)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500 font-mono"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="flex-1 pt-6 text-right">
              <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Grand Total (Incl. Tax)</p>
              <p className="text-xl font-black text-neutral-900 font-mono">{formatCurrency(grandTotal, clientCurrency)}</p>
            </div>
          </div>

          {/* Profitability Preview */}
          <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-600 mb-3">
              <Calculator className="w-4 h-4" />
              Profitability Preview
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Gross Profit</p>
                <p className="text-lg font-bold font-mono">
                  {formatCurrency(formData.totalPrice - formData.totalCost, clientCurrency)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Project Margin</p>
                <p className={`text-2xl font-black font-mono ${
                  margin < 10 ? 'text-red-600' : margin < 20 ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {margin.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-100 flex justify-end gap-3">
            <Button type="button" intent="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading} disabled={!formData.clientId}>Create Draft Quote</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
