import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { Plus, Receipt, ExternalLink, Download, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { formatCurrency } from '../lib/finance';

export const Invoices = () => {
  const { invoices, fetchInvoices, loading, markInvoicePaid, deleteInvoice } = useStore();
  const { addNotification } = useNotificationStore();
  const [confirmPaidId, setConfirmPaidId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Invoices</h2>
          <p className="text-neutral-500">Manage billing, tracking, and payment collection.</p>
        </div>
        <Button 
          onClick={() => addNotification({ type: 'info', message: 'Manual invoice creation will be available in the next update. Please generate invoices from the Project Detail roadmaps for now.' })}
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
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>NUMBER</th>
                  <th>CLIENT</th>
                  <th>DUE DATE</th>
                  <th>TOTAL</th>
                  <th>STATUS</th>
                  <th className="text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="font-bold">{invoice.invoiceNumber}</td>
                    <td>{invoice.client?.name}</td>
                    <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td className="font-financial font-bold">{formatCurrency(invoice.total)}</td>
                    <td>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === 'Paid' ? 'bg-green-50 text-green-700' :
                        invoice.status === 'Overdue' ? 'bg-red-50 text-red-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {invoice.status === 'Paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {invoice.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.status !== 'Paid' && (
                          <button 
                            onClick={() => setConfirmPaidId(invoice.id)}
                            className="text-xs font-bold text-green-600 hover:text-green-700 px-2 py-1"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button className="p-2 text-neutral-400 hover:text-primary-600 transition-colors" title="Download PDF">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-neutral-400 hover:text-primary-600 transition-colors" title="View Details">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setConfirmDeleteId(invoice.id)}
                          className="p-2 text-neutral-400 hover:text-red-600 transition-colors" 
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <ConfirmationDialog 
        isOpen={!!confirmPaidId}
        onClose={() => setConfirmPaidId(null)}
        onConfirm={() => confirmPaidId && handleMarkPaid(confirmPaidId)}
        title="Mark Invoice as Paid"
        description="This will update your financial records and acknowledge receipt of payment."
        confirmText="Confirm Payment"
        impact="Increases cash snapshot and closes the invoice lifecycle."
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
