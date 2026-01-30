import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { ContextMenu } from '../components/ui/ContextMenu';
import { DropdownMenu } from '../components/ui/DropdownMenu';
import { Plus, FileText, CheckCircle, Clock, AlertCircle, Copy, Archive, Download, Trash2, MoreVertical } from 'lucide-react';
import { QuoteModal } from '../components/quotes/QuoteModal';
import { getMarginColor } from '../lib/finance';
import { useCurrency } from '../hooks/useCurrency';
import { Quote } from '../types';

export const Quotes = () => {
  const { formatCurrency } = useCurrency();
  const { quotes, fetchQuotes, fetchClients, approveQuote, duplicateQuote, deleteQuote, archiveQuote, loading } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [quoteViewMode, setQuoteViewMode] = useState<'edit' | 'preview'>('edit');

  const activeQuotes = useMemo(() => quotes.filter(q => q.status !== 'Archived'), [quotes]);

  const handleEdit = (quote: Quote, view: 'edit' | 'preview' = 'edit') => {
    setEditingQuote(quote);
    setQuoteViewMode(view);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingQuote(null);
    setQuoteViewMode('edit');
  };
  const [confirmApproveId, setConfirmApproveId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);

  useEffect(() => {
    fetchQuotes();
    fetchClients();
    
    // Listen for global new quote shortcut
    const handleNewQuote = () => setIsModalOpen(true);
    window.addEventListener('app-new-quote', handleNewQuote);
    return () => window.removeEventListener('app-new-quote', handleNewQuote);
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await approveQuote(id);
      setConfirmApproveId(null);
    } catch (error) {
      // Handled by store
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQuote(id);
      setConfirmDeleteId(null);
    } catch (error) {
      // Handled by store
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveQuote(id);
      setConfirmArchiveId(null);
    } catch (error) {
      // Handled by store
    }
  };

  const navigate = (path: string) => { window.location.hash = path; };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Quotes</h2>
          <p className="text-sm text-neutral-500">Draft, send, and approve project pricing.</p>
        </div>
        <div className="flex gap-3">
          <Button intent="secondary" onClick={() => navigate('#projects')} className="gap-2">
            <Archive className="w-4 h-4" />
            View Projects
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Quote
          </Button>
        </div>
      </div>

      {loading && quotes.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : activeQuotes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 px-6 text-center border-dashed border-2">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">No quotes yet</h3>
          <p className="text-neutral-500 max-w-sm mt-2 text-sm">
            Create your first quote to define project scope and pricing.
          </p>
          <Button intent="secondary" className="mt-6" onClick={() => setIsModalOpen(true)}>
            New Quote
          </Button>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="w-[10%]">QUOTE</th>
                  <th className="w-[20%]">CLIENT</th>
                  <th className="w-[20%]">TOTAL PRICE</th>
                  <th className="w-[15%]">MARGIN</th>
                  <th className="w-[15%]">STATUS</th>
                  <th className="w-[20%] text-right pr-6">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {activeQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-neutral-50 transition-colors group">
                    <td colSpan={6} className="p-0">
                      <ContextMenu items={[
                        { label: 'Duplicate', icon: <Copy className="w-4 h-4" />, onClick: () => duplicateQuote(quote.id) },
                        { label: 'Export PDF', icon: <Download className="w-4 h-4" />, onClick: () => handleEdit(quote, 'preview') },
                        { label: 'Archive', icon: <Archive className="w-4 h-4" />, onClick: () => setConfirmArchiveId(quote.id) },
                        { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => setConfirmDeleteId(quote.id), variant: 'danger' },
                      ]}>
                        <div className="flex items-center w-full px-4 py-3">
                          <div className="w-[10%]">
                            <div 
                              className="font-bold text-neutral-900 group-hover:text-primary-600 cursor-pointer transition-colors outline-none focus:underline" 
                              onClick={() => handleEdit(quote)}
                              onKeyDown={(e) => e.key === 'Enter' && handleEdit(quote)}
                              tabIndex={0}
                              role="button"
                            >
                              {quote.name}
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono uppercase">v{quote.version} • {quote.id.slice(0, 8)}</div>
                          </div>
                          <div className="w-[20%]">{quote.client?.name || 'Unknown Client'}</div>
                          <div className="w-[20%] font-financial font-bold">{formatCurrency(quote.totalPrice, quote.client?.currency)}</div>
                          <div className={`w-[15%] font-financial font-bold ${getMarginColor(quote.margin)}`}>
                            {quote.margin.toFixed(1)}%
                          </div>
                          <div className="w-[15%]">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              quote.status === 'Approved' ? 'bg-green-50 text-green-700' :
                              quote.status === 'Draft' ? 'bg-neutral-100 text-neutral-600' :
                              'bg-blue-50 text-blue-700'
                            }`}>
                              {quote.status === 'Approved' ? <CheckCircle className="w-3 h-3" /> : 
                               quote.status === 'Draft' ? <Clock className="w-3 h-3" /> : 
                               <AlertCircle className="w-3 h-3" />}
                              {quote.status}
                            </span>
                          </div>
                          <div className="w-[20%] text-right flex items-center justify-end gap-2">
                            {quote.status === 'Draft' && (
                              <Button 
                                intent="primary" 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmApproveId(quote.id);
                                }}
                              >
                                Approve
                              </Button>
                            )}
                            <DropdownMenu
                              trigger={
                                <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-500">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              }
                              items={[
                                 { 
                                   label: 'Duplicate', 
                                   icon: <Copy className="w-4 h-4" />, 
                                   onClick: () => duplicateQuote(quote.id) 
                                 },
                                 { 
                                   label: 'Export PDF', 
                                   icon: <Download className="w-4 h-4" />, 
                                   onClick: () => handleEdit(quote, 'preview') 
                                 },
                                 { 
                                   label: 'Archive', 
                                   icon: <Archive className="w-4 h-4" />, 
                                   onClick: () => setConfirmArchiveId(quote.id) 
                                 },
                                 { 
                                   label: 'Delete', 
                                   icon: <Trash2 className="w-4 h-4" />, 
                                   onClick: () => setConfirmDeleteId(quote.id),
                                   variant: 'danger' 
                                 },
                               ]}
                             />
                          </div>
                        </div>
                      </ContextMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <QuoteModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        quote={editingQuote || undefined}
        initialView={quoteViewMode}
      />

      <ConfirmationDialog
        isOpen={!!confirmApproveId}
        onClose={() => setConfirmApproveId(null)}
        onConfirm={() => confirmApproveId && handleApprove(confirmApproveId)}
        title="Approve Quote"
        description="Are you sure you want to approve this quote? This will create an active project and lock the financial baseline."
        confirmText="Approve & Start Project"
        impact="Converts quote to active project, locking price and initial margin baseline."
      />

      <ConfirmationDialog
        isOpen={!!confirmArchiveId}
        onClose={() => setConfirmArchiveId(null)}
        onConfirm={() => confirmArchiveId && handleArchive(confirmArchiveId)}
        title="Archive Quote"
        description="Are you sure you want to archive this quote? It will be hidden from the active list but its data will be preserved."
        confirmText="Archive Quote"
      />

      <ConfirmationDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        title="Delete Quote"
        description="Are you sure you want to delete this quote? This action cannot be undone."
        confirmText="Delete Quote"
        intent="danger"
      />
    </div>
  );
};
