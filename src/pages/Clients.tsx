import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { Plus, MoreVertical, Mail, Phone, MapPin, Users, Trash2 } from 'lucide-react';
import { ClientModal } from '../components/clients/ClientModal';

export const Clients = () => {
  const { clients, fetchClients, deleteClient, loading } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async () => {
    if (clientToDelete) {
      await deleteClient(clientToDelete);
      setClientToDelete(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Clients</h2>
          <p className="text-neutral-500">Manage your customer base and their billing preferences.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Client
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : clients.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 px-6 text-center border-dashed">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">No clients yet</h3>
          <p className="text-neutral-500 max-w-sm mt-2">
            Start by adding your first client to create projects, quotes, and invoices.
          </p>
          <Button intent="secondary" className="mt-6" onClick={() => setIsModalOpen(true)}>
            Add First Client
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <Card key={client.id} className="hover:border-primary-200 transition-colors group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 font-bold text-xl">
                    {client.name.charAt(0)}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setClientToDelete(client.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Client"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-bold text-lg text-neutral-900">{client.name}</h3>
                  <div className="mt-4 space-y-2">
                    {client.email && (
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Mail className="w-4 h-4" />
                        {client.email}
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Phone className="w-4 h-4" />
                        {client.phone}
                      </div>
                    )}
                    {client.billingAddress && (
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{client.billingAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-neutral-100 flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    client.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {client.status}
                  </span>
                  <span className="text-xs text-neutral-400">
                    Added {new Date(client.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <ConfirmationDialog
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Client"
        description="Are you sure you want to delete this client? This will not affect existing projects or invoices, but the client record will be removed."
        confirmText="Delete Client"
        intent="danger"
      />
    </div>
  );
};
