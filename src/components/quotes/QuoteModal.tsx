import React, { useState, useMemo } from 'react';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';
import { X, Plus, Trash2, Eye, Edit3, Download, FileText } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { calculateMargin } from '../../lib/finance';
import { useCurrency } from '../../hooks/useCurrency';
import { QuoteItem, Quote } from '../../types';
import { generateQuotePDF } from '../../lib/pdf';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote?: Quote;
  initialView?: 'edit' | 'preview';
}

export const QuoteModal = ({ isOpen, onClose, quote, initialView = 'edit' }: QuoteModalProps) => {
  const { formatCurrency } = useCurrency();
  const { clients, createQuote, updateQuote, settings } = useStore();
  const { addNotification } = useNotificationStore();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'edit' | 'preview'>(initialView);
  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    quotationNumber: `QTN-${Date.now().toString().slice(-6)}`,
    issueDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalCost: 0,
    cgstRate: 9,
    sgstRate: 9,
    discountRate: 0,
    items: [] as QuoteItem[],
    notes: '',
    terms: '',
    gstin: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
  });

  React.useEffect(() => {
    if (isOpen) {
      setView(initialView);
    }
  }, [isOpen, initialView]);

  React.useEffect(() => {
    if (quote) {
      setFormData({
        clientId: quote.clientId,
        name: quote.name,
        quotationNumber: quote.quotationNumber || `QTN-${Date.now().toString().slice(-6)}`,
        issueDate: quote.issueDate ? new Date(quote.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        validUntil: quote.validUntil ? new Date(quote.validUntil).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalCost: quote.totalCost,
        cgstRate: quote.cgstRate || 9,
        sgstRate: quote.sgstRate || 9,
        discountRate: quote.discountRate || 0,
        items: quote.items || [],
        notes: quote.notes || '',
        terms: quote.terms || '',
        gstin: quote.gstin || '',
        businessEmail: quote.businessEmail || '',
        businessPhone: quote.businessPhone || '',
        businessAddress: quote.businessAddress || '',
      });
    } else {
      setFormData({
        clientId: '',
        name: settings.companyName || '',
        quotationNumber: `QTN-${Date.now().toString().slice(-6)}`,
        issueDate: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalCost: 0,
        cgstRate: 9,
        sgstRate: 9,
        discountRate: 0,
        items: [],
        notes: '',
        terms: '',
        gstin: settings.taxId || '',
        businessEmail: settings.email || '',
        businessPhone: settings.phone || '',
        businessAddress: settings.address || '',
      });
    }
  }, [quote, isOpen, settings]);

  const selectedClient = clients.find(c => c.id === formData.clientId);

  const totalPrice = useMemo(() => 
    formData.items.reduce((sum, item) => sum + item.total, 0),
    [formData.items]
  );

  if (!isOpen) return null;

  const discountAmount = (totalPrice * (formData.discountRate || 0)) / 100;
  const afterDiscount = totalPrice - discountAmount;
  const cgstAmount = (afterDiscount * (formData.cgstRate || 0)) / 100;
  const sgstAmount = (afterDiscount * (formData.sgstRate || 0)) / 100;
  const grandTotal = afterDiscount + cgstAmount + sgstAmount;
  const margin = calculateMargin(totalPrice, formData.totalCost);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const addItem = () => {
    const newItem: QuoteItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      quantity: 1,
      rate: 0,
      total: 0,
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const updateItem = (id: string, updates: Partial<QuoteItem>) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          updated.total = updated.quantity * updated.rate;
          return updated;
        }
        return item;
      })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) return;
    
    setLoading(true);
    try {
      const quoteData = {
        ...formData,
        issueDate: new Date(formData.issueDate),
        validUntil: new Date(formData.validUntil),
        totalPrice,
        name: formData.name || 'New Quote',
        margin,
      };

      if (quote) {
        await updateQuote({ ...quoteData, id: quote.id } as any);
      } else {
        await createQuote(quoteData as any);
      }
      onClose();
    } catch (error) {
      // Error handled by store
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    addNotification({ type: 'info', message: 'Generating PDF...' });
    const filename = `Quotation_${selectedClient?.name || 'Client'}_${formData.name || 'New'}`.replace(/\s+/g, '_');
    try {
      await generateQuotePDF('pdf-content', filename);
      addNotification({ type: 'success', message: 'PDF generated successfully' });
    } catch (error) {
      console.error('PDF Download Error:', error);
      addNotification({ type: 'error', message: 'Failed to generate PDF' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300`}>
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-neutral-900">Quotation Template App</h3>
            <p className="text-xs text-neutral-500">Create, edit and download professional quotations in ₹ INR</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex p-1 bg-neutral-100 rounded-lg" role="tablist">
              <button
                role="tab"
                aria-selected={view === 'edit'}
                onClick={() => setView('edit')}
                onKeyDown={(e) => e.key === 'Enter' && setView('edit')}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  view === 'edit' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                <Edit3 className="w-4 h-4" /> Edit
              </button>
              <button
                role="tab"
                aria-selected={view === 'preview'}
                onClick={() => setView('preview')}
                onKeyDown={(e) => e.key === 'Enter' && setView('preview')}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  view === 'preview' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                <Eye className="w-4 h-4" /> Preview
              </button>
            </div>
            <div className="flex items-center gap-2">
              {view === 'preview' && (
                <Button intent="secondary" size="sm" onClick={handleDownload} className="flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download PDF
                </Button>
              )}
              <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors ml-2">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/50">
          {view === 'edit' ? (
            <form id="quote-form" onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-12">
              {/* Business Details Section */}
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
                  <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-[#218091] rounded-full" />
                    1. Business Details
                  </h4>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Company Name</label>
                    <input
                      type="text"
                      placeholder="Anchor Agency"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:ring-1 focus:ring-[#218091] focus:border-[#218091] text-sm"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="contact@anchor.com"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:ring-1 focus:ring-[#218091] focus:border-[#218091] text-sm"
                      value={formData.businessEmail}
                      onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Phone</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:ring-1 focus:ring-[#218091] focus:border-[#218091] text-sm"
                      value={formData.businessPhone}
                      onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Address</label>
                    <textarea
                      rows={2}
                      placeholder="Suite 502, Tech Park, Mumbai"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:ring-1 focus:ring-[#218091] focus:border-[#218091] text-sm"
                      value={formData.businessAddress}
                      onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">GSTIN (Optional)</label>
                    <input
                      type="text"
                      placeholder="27AAAAA0000A1Z5"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:ring-1 focus:ring-[#218091] focus:border-[#218091] text-sm font-mono"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Quotation & Client Details */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                  <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
                    <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-[#218091] rounded-full" />
                      2. Quotation Info
                    </h4>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Quotation Number</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:ring-1 focus:ring-[#218091] focus:border-[#218091] text-sm font-mono"
                        value={formData.quotationNumber}
                        onChange={(e) => setFormData({ ...formData, quotationNumber: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Issue Date</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:ring-1 focus:ring-[#218091] focus:border-[#218091] text-sm"
                          value={formData.issueDate}
                          onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Valid Until</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:ring-1 focus:ring-[#218091] focus:border-[#218091] text-sm"
                          value={formData.validUntil}
                          onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                  <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
                    <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-[#218091] rounded-full" />
                      3. Client Details
                    </h4>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Select Client</label>
                      <select
                        required
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:ring-1 focus:ring-[#218091] focus:border-[#218091] text-sm"
                        value={formData.clientId}
                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      >
                        <option value="">Choose a client...</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                      </select>
                    </div>
                    {selectedClient && (
                      <div className="text-xs text-neutral-500 space-y-1 p-2 bg-neutral-50 rounded border border-neutral-100">
                        <p className="font-bold text-neutral-700">{selectedClient.name}</p>
                        <p>{selectedClient.email}</p>
                        <p>{selectedClient.billingAddress}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Line Items Section */}
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex justify-between items-center">
                  <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-[#218091] rounded-full" />
                    4. Line Items
                  </h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#218091] text-white text-[10px] font-bold uppercase rounded-md hover:bg-[#1a6573] transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>
                <div className="p-4">
                  {formData.items.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-neutral-100 rounded-lg">
                      <FileText className="w-8 h-8 text-neutral-200 mx-auto mb-2" />
                      <p className="text-sm text-neutral-400">No items added yet. Click "Add Item" to start.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-12 gap-4 px-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        <div className="col-span-6">Description</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-2 text-right">Unit Price (₹)</div>
                        <div className="col-span-2 text-right">Amount</div>
                      </div>
                      <div className="space-y-2">
                        {formData.items.map((item) => (
                          <div key={item.id} className="grid grid-cols-12 gap-4 items-center group bg-neutral-50/50 p-2 rounded-lg border border-transparent hover:border-neutral-200 transition-all">
                            <div className="col-span-6">
                              <input
                                type="text"
                                placeholder="Service description..."
                                className="w-full px-2 py-1.5 bg-white border border-neutral-200 rounded focus:ring-1 focus:ring-[#218091] focus:border-[#218091] text-sm"
                                value={item.description}
                                onChange={(e) => updateItem(item.id, { description: e.target.value })}
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                className="w-full px-2 py-1.5 bg-white border border-neutral-200 rounded focus:ring-1 focus:ring-[#218091] focus:border-[#218091] text-sm text-center font-mono"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                className="w-full px-2 py-1.5 bg-white border border-neutral-200 rounded focus:ring-1 focus:ring-[#218091] focus:border-[#218091] text-sm text-right font-mono"
                                value={item.rate}
                                onChange={(e) => updateItem(item.id, { rate: parseFloat(e.target.value) || 0 })}
                              />
                            </div>
                            <div className="col-span-2 flex items-center justify-end gap-3">
                              <span className="text-sm font-bold text-neutral-900 font-mono">
                                {formatCurrency(item.total, 'INR')}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="text-neutral-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary and Terms */}
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-7 space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                    <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
                      <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-[#218091] rounded-full" />
                        5. Terms & Notes
                      </h4>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Notes</label>
                        <textarea
                          rows={2}
                          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:ring-1 focus:ring-[#218091] focus:border-[#218091] text-sm"
                          placeholder="Payment terms, bank details..."
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Terms & Conditions</label>
                        <textarea
                          rows={2}
                          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:ring-1 focus:ring-[#218091] focus:border-[#218091] text-sm"
                          placeholder="Standard terms..."
                          value={formData.terms}
                          onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-5">
                  <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden sticky top-0">
                    <div className="px-4 py-3 bg-[#218091] border-b border-[#218091]">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Calculations</h4>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-neutral-500 font-medium">Subtotal</span>
                        <span className="font-bold font-mono">{formatCurrency(totalPrice, 'INR')}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm gap-4">
                        <span className="text-neutral-500 font-medium">Discount (%)</span>
                        <input
                          type="number"
                          className="w-20 px-2 py-1 bg-neutral-50 border border-neutral-200 rounded text-right text-sm font-mono"
                          value={formData.discountRate}
                          onChange={(e) => setFormData({ ...formData, discountRate: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="flex justify-between items-center text-sm gap-4">
                        <span className="text-neutral-500 font-medium">CGST (%)</span>
                        <input
                          type="number"
                          className="w-20 px-2 py-1 bg-neutral-50 border border-neutral-200 rounded text-right text-sm font-mono"
                          value={formData.cgstRate}
                          onChange={(e) => setFormData({ ...formData, cgstRate: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="flex justify-between items-center text-sm gap-4">
                        <span className="text-neutral-500 font-medium">SGST (%)</span>
                        <input
                          type="number"
                          className="w-20 px-2 py-1 bg-neutral-50 border border-neutral-200 rounded text-right text-sm font-mono"
                          value={formData.sgstRate}
                          onChange={(e) => setFormData({ ...formData, sgstRate: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="pt-4 border-t border-neutral-100">
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-900 font-black uppercase tracking-widest text-xs">Total Amount</span>
                          <span className="text-2xl font-black text-[#218091] font-mono">{formatCurrency(grandTotal, 'INR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* PREVIEW MODE - Enhanced for Indian Locale and GST */
            <div id="pdf-content" className="max-w-[800px] mx-auto bg-white shadow-2xl rounded-lg overflow-hidden border border-neutral-100 font-sans">
              {/* Header Style */}
              <div className="bg-[#218091] text-white p-10 flex justify-between items-start relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full pointer-events-none" />
                <div>
                  <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Quotation</h1>
                  <div className="space-y-1">
                    <p className="text-primary-100 text-[10px] font-black uppercase tracking-widest">Quotation Number</p>
                    <p className="text-xl font-mono font-bold">{formData.quotationNumber}</p>
                  </div>
                </div>
                <div className="text-right space-y-4">
                  <div>
                    <p className="text-2xl font-black uppercase tracking-tight">{formData.name || 'Anchor Agency'}</p>
                    <p className="text-primary-100 text-sm">{formData.businessEmail || 'contact@anchor-agency.com'}</p>
                    <p className="text-primary-100 text-sm">{formData.businessPhone || '+91 98765 43210'}</p>
                    {formData.businessAddress && (
                      <p className="text-primary-100 text-[10px] mt-1 opacity-80 whitespace-pre-line">{formData.businessAddress}</p>
                    )}
                  </div>
                  {formData.gstin && (
                    <div className="inline-block px-3 py-1 bg-white/10 rounded border border-white/20">
                      <p className="text-[8px] font-black uppercase tracking-widest text-primary-100">GSTIN</p>
                      <p className="text-xs font-mono font-bold">{formData.gstin}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-10 space-y-10">
                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-20">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[#218091] text-[10px] font-black uppercase tracking-[0.2em] mb-4">Quotation For</h4>
                      <div className="space-y-1">
                        <p className="text-2xl font-black text-neutral-900 leading-none">{selectedClient?.name || 'Client Name'}</p>
                        <p className="text-neutral-500 text-sm font-medium">{selectedClient?.email || 'client@email.com'}</p>
                        <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">{selectedClient?.billingAddress || 'Client Address Line'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-6">
                    <div>
                      <h4 className="text-[#218091] text-[10px] font-black uppercase tracking-[0.2em] mb-4">Date & Validity</h4>
                      <div className="space-y-2">
                        <div className="flex justify-end items-center gap-4">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase">Issue Date</span>
                          <span className="text-neutral-900 font-bold font-mono">{formatDate(formData.issueDate)}</span>
                        </div>
                        <div className="flex justify-end items-center gap-4">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase">Valid Until</span>
                          <span className="text-[#218091] font-bold font-mono">{formatDate(formData.validUntil)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-neutral-200">
                        <th className="px-6 py-5">Description</th>
                        <th className="px-6 py-5 text-center">Qty</th>
                        <th className="px-6 py-5 text-right">Unit Price</th>
                        <th className="px-6 py-5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-neutral-100">
                      {formData.items.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-neutral-300 italic font-medium">No items added to this quotation yet</td>
                        </tr>
                      ) : (
                        formData.items.map((item) => (
                          <tr key={item.id} className="group hover:bg-neutral-50/50 transition-colors">
                            <td className="px-6 py-5">
                              <p className="font-bold text-neutral-900">{item.description}</p>
                            </td>
                            <td className="px-6 py-5 text-center text-neutral-600 font-mono">{item.quantity}</td>
                            <td className="px-6 py-5 text-right text-neutral-600 font-mono">{formatCurrency(item.rate, 'INR')}</td>
                            <td className="px-6 py-5 text-right font-bold text-neutral-900 font-mono">{formatCurrency(item.total, 'INR')}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Calculations Summary */}
                <div className="flex justify-end">
                  <div className="w-80 space-y-4">
                    <div className="space-y-3 px-6 py-4 bg-neutral-50 rounded-lg">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500 font-bold uppercase tracking-wider">Subtotal</span>
                        <span className="font-bold font-mono text-neutral-900">{formatCurrency(totalPrice, 'INR')}</span>
                      </div>
                      {formData.discountRate > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-red-500 font-bold uppercase tracking-wider">Discount ({formData.discountRate}%)</span>
                          <span className="font-bold font-mono text-red-500">-{formatCurrency(discountAmount, 'INR')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500 font-bold uppercase tracking-wider">CGST ({formData.cgstRate}%)</span>
                        <span className="font-bold font-mono text-neutral-900">{formatCurrency(cgstAmount, 'INR')}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500 font-bold uppercase tracking-wider">SGST ({formData.sgstRate}%)</span>
                        <span className="font-bold font-mono text-neutral-900">{formatCurrency(sgstAmount, 'INR')}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center px-6 py-5 bg-[#218091] rounded-lg shadow-lg shadow-[#218091]/20">
                      <span className="text-white font-black uppercase tracking-widest text-sm">Grand Total</span>
                      <span className="text-3xl font-black text-white font-mono">{formatCurrency(grandTotal, 'INR')}</span>
                    </div>
                  </div>
                </div>

                {/* Terms & Footer */}
                {(formData.notes || formData.terms) && (
                  <div className="pt-12 border-t border-neutral-100 grid grid-cols-2 gap-12">
                    {formData.notes && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-[#218091] uppercase tracking-[0.2em]">Notes & Bank Details</h4>
                        <p className="text-[11px] text-neutral-500 leading-relaxed font-medium whitespace-pre-wrap">{formData.notes}</p>
                      </div>
                    )}
                    {formData.terms && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-[#218091] uppercase tracking-[0.2em]">Terms & Conditions</h4>
                        <p className="text-[11px] text-neutral-500 leading-relaxed font-medium whitespace-pre-wrap">{formData.terms}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="pt-20 text-center">
                  <p className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.4em]">Thank you for your business</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-neutral-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex flex-col">
             <span className="text-[10px] text-neutral-400 uppercase font-black tracking-widest">Total Payable</span>
             <span className="text-2xl font-black text-[#218091] font-mono">{formatCurrency(grandTotal, 'INR')}</span>
          </div>
          <div className="flex gap-3">
            <Button type="button" intent="secondary" onClick={onClose}>Discard</Button>
            {view === 'edit' && (
              <Button 
                type="submit" 
                form="quote-form"
                loading={loading} 
                disabled={!formData.clientId || formData.items.length === 0}
                className="bg-[#218091] hover:bg-[#1a6573]"
              >
                {quote ? 'Update Quotation' : 'Create Quotation'}
              </Button>
            )}
            {view === 'preview' && (
              <Button 
                type="button" 
                onClick={handleDownload}
                className="bg-[#218091] hover:bg-[#1a6573] gap-2"
              >
                <Download className="w-4 h-4" /> Download PDF
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
