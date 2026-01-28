import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { ContextMenu } from '../components/ui/ContextMenu';
import { Plus, FileText, CheckCircle, Clock, AlertCircle, Copy, Archive, Download } from 'lucide-react';
import { QuoteModal } from '../components/quotes/QuoteModal';
import { formatCurrency, getMarginColor } from '../lib/finance';

export const Quotes = () => {
  const { quotes, fetchQuotes, fetchClients, approveQuote, loading } = useStore();
  const { addNotification } = useNotificationStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmApproveId, setConfirmApproveId] = useState<string | null>(null);

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
      addNotification({ 
        type: 'success', 
        message: 'Quote approved and project created successfully' 
      });
    } catch (error) {
      addNotification({ 
        type: 'error', 
        message: 'Failed to approve quote' 
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Quotes</h2>
          <p className="text-neutral-500">Draft, send, and approve project pricing.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Quote
        </Button>
      </div>

      {loading && quotes.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : quotes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 px-6 text-center border-dashed">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">No quotes yet</h3>
          <p className="text-neutral-500 max-w-sm mt-2">
            Create your first quote to define project scope and pricing.
          </p>
          <Button intent="secondary" className="mt-6" onClick={() => setIsModalOpen(true)}>
            Create First Quote
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>VERSION</th>
                  <th>CLIENT</th>
                  <th>TOTAL PRICE</th>
                  <th>MARGIN</th>
                  <th>STATUS</th>
                  <th className="text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-neutral-50 transition-colors group">
                    <td colSpan={6} className="p-0">
                      <ContextMenu items={[
                        { label: 'Duplicate', icon: <Copy className="w-4 h-4" />, onClick: () => addNotification({ type: 'info', message: 'Duplicating quote...' }) },
                        { label: 'Export PDF', icon: <Download className="w-4 h-4" />, onClick: () => addNotification({ type: 'info', message: 'Generating PDF...' }) },
                        { label: 'Archive', icon: <Archive className="w-4 h-4" />, onClick: () => addNotification({ type: 'warning', message: 'Archiving quote...' }), variant: 'danger' },
                      ]}>
                        <div className="flex items-center w-full px-4 py-3">
                          <div className="w-[10%] font-medium">v{quote.version}</div>
                          <div className="w-[20%]">{quote.client?.name || 'Unknown Client'}</div>
                          <div className="w-[20%] font-financial font-bold">{formatCurrency(quote.totalPrice)}</div>
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
                          <div className="w-[20%] text-right">
                            {quote.status === 'Draft' && (
                              <Button 
                                intent="secondary" 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmApproveId(quote.id);
                                }}
                              >
                                Approve
                              </Button>
                            )}
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
        onClose={() => setIsModalOpen(false)} 
      />

      <ConfirmationDialog
        isOpen={!!confirmApproveId}
        onClose={() => setConfirmApproveId(null)}
        onConfirm={() => confirmApproveId && handleApprove(confirmApproveId)}
        title="Approve Quote"
        message="Are you sure you want to approve this quote? This will create an active project and lock the financial baseline."
        confirmText="Approve & Start Project"
        impact="Converts quote to active project, locking price and initial margin baseline."
      />
    </div>
  );
};
