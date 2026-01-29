import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { Plus, MoreVertical, Mail, Phone, MapPin, Users, Trash2, Edit2, Copy } from 'lucide-react';
import { ClientModal } from '../components/clients/ClientModal';
import { DropdownMenu } from '../components/ui/DropdownMenu';
import { Client } from '../types';

export const Clients = () => {
  const { clients, fetchClients, deleteClient, loading } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [clientToDuplicate, setClientToDuplicate] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const handleDuplicate = (client: Client) => {
    setClientToDuplicate(client);
    setIsDuplicateModalOpen(true);
  };

  const handleCloseDuplicateModal = () => {
    setIsDuplicateModalOpen(false);
    setClientToDuplicate(null);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async () => {
    if (clientToDelete) {
      await deleteClient(clientToDelete);
      setClientToDelete(null);
    }
  };

  const handleEdit = (client: Client) => {
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setClientToEdit(null);
  };

  const navigate = (path: string) => { window.location.hash = path; };

  return (
    <div className="page-container overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Clients</h2>
          <p className="text-sm text-neutral-500">Manage your customer base and their billing preferences.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Add Client
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : clients.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 px-6 text-center border-dashed border-2">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">No clients yet</h3>
          <p className="text-neutral-500 max-w-sm mt-2 text-sm">
            Start by adding your first client to create projects, quotes, and invoices.
          </p>
          <Button intent="secondary" className="mt-6" onClick={() => setIsModalOpen(true)}>
            Add First Client
          </Button>
        </Card>
      ) : (        <div className="grid-layout">
          {clients.map((client) => (
            <Card 
              key={client.id} 
              className="hover:border-primary-200 transition-colors group cursor-pointer"
              onClick={() => navigate(`#clients/${client.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 font-bold text-xl">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <DropdownMenu
                      trigger={
                        <button 
                          className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      }
                      items={[
                        { label: 'Edit', icon: <Edit2 className="w-4 h-4" />, onClick: () => handleEdit(client) },
                        { label: 'Duplicate', icon: <Copy className="w-4 h-4" />, onClick: () => handleDuplicate(client) },
                        { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => setClientToDelete(client.id), variant: 'danger' },
                      ]}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">{client.name}</h3>
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.billingAddress && (
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{client.billingAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ClientModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        client={clientToEdit}
      />

      <ClientModal 
        isOpen={isDuplicateModalOpen} 
        onClose={handleCloseDuplicateModal} 
        client={clientToDuplicate}
        isDuplicate={true}
      />

      <ConfirmationDialog
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Client"
        description="Are you sure you want to delete this client? This will also delete all associated projects, quotes, and invoices. This action cannot be undone."
        confirmText="Delete Client"
        intent="danger"
      />
    </div>
  );
};
