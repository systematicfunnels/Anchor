import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';
import { X } from 'lucide-react';
import { Currency } from '../../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClientModal = ({ isOpen, onClose }: ClientModalProps) => {
  const { addClient } = useStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    billingAddress: '',
    currency: 'USD' as Currency,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addClient(formData);
      onClose();
      setFormData({ name: '', email: '', phone: '', billingAddress: '', currency: 'USD' as Currency });
    } catch (error) {
      // Error is handled by the store and shown via notifications
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="text-lg font-bold">Add New Client</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Client Name *</label>
            <input
              required
              type="text"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Billing Address</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              value={formData.billingAddress}
              onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Default Currency</label>
            <select
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
            </select>
          </div>

          <div className="pt-6 border-t border-neutral-100 flex justify-end gap-3">
            <Button type="button" intent="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>Save Client</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
