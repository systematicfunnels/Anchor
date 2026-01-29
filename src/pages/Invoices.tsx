import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { Plus, Receipt, Download, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { InvoiceModal } from '../components/invoices/InvoiceModal';
import { useCurrency } from '../hooks/useCurrency';

export const Invoices = () => {
  const { formatCurrency } = useCurrency();
  const { invoices, fetchInvoices, loading, markInvoicePaid, deleteInvoice } = useStore();
  const [confirmPaidId, setConfirmPaidId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleMarkPaid = async (id: string) => {
    try {
      await markInvoicePaid(id);
      setConfirmPaidId(null);
    } catch (error) {
      // Handled by store
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInvoice(id);
      setConfirmDeleteId(null);
    } catch (error) {
      // Handled by store
    }
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Invoices</h2>
          <p className="text-neutral-500">Manage billing, tracking, and payment collection.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </Button>
      </div>

      {loading && invoices.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : invoices.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 px-6 text-center border-dashed">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <Receipt className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">No invoices yet</h3>
          <p className="text-neutral-500 max-w-sm mt-2">
            Generate invoices from completed milestones or project roadmaps.
          </p>
          <Button intent="secondary" className="mt-6" onClick={() => setIsModalOpen(true)}>
            Create First Invoice
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">NUMBER</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">CLIENT</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">DUE DATE</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">TOTAL</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">STATUS</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-bold">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3">{invoice.client?.name}</td>
                    <td className="px-4 py-3">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-financial font-bold">{formatCurrency(invoice.total, invoice.client?.currency)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === 'Paid' ? 'bg-green-50 text-green-700' :
                        invoice.status === 'Overdue' ? 'bg-red-50 text-red-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {invoice.status === 'Paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.status !== 'Paid' && (
                          <Button 
                            intent="primary" 
                            size="sm"
                            onClick={() => setConfirmPaidId(invoice.id)}
                            title="Mark as Paid"
                          >
                            Mark Paid
                          </Button>
                        )}
                        <Button 
                          intent="secondary" 
                          size="sm" 
                          className="p-1.5"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          intent="secondary" 
                          size="sm" 
                          className="p-1.5 text-red-600 hover:text-red-700"
                          onClick={() => setConfirmDeleteId(invoice.id)}
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <InvoiceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <ConfirmationDialog
        isOpen={!!confirmPaidId}
        onClose={() => setConfirmPaidId(null)}
        onConfirm={() => confirmPaidId && handleMarkPaid(confirmPaidId)}
        title="Mark as Paid"
        description="Are you sure you want to mark this invoice as paid? This will update the project revenue and cash flow metrics."
        confirmText="Mark as Paid"
      />

      <ConfirmationDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        title="Delete Invoice"
        description="Are you sure you want to delete this invoice? This action cannot be undone."
        confirmText="Delete Invoice"
        intent="danger"
      />
    </div>
  );
};
