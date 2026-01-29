import { create } from 'zustand';
import { Client, Project, Quote, Invoice, Milestone, ScopeChange } from '../types';
import { useNotificationStore } from './useNotificationStore';

interface AppState {
  clients: Client[];
  projects: Project[];
  quotes: Quote[];
  invoices: Invoice[];
  loading: boolean;
  
  fetchClients: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchQuotes: () => Promise<void>;
  fetchInvoices: () => Promise<void>;
  
  getProjectDetails: (projectId: string) => Promise<Project & { milestones: Milestone[], scopeChanges: ScopeChange[] }>;
  updateMilestone: (milestoneData: Partial<Milestone> & { id: string }) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  createScopeChange: (scopeChange: Partial<ScopeChange>) => Promise<void>;
  approveScopeChange: (scopeChangeId: string) => Promise<void>;
  deleteScopeChange: (id: string) => Promise<void>;
  
  addClient: (client: Partial<Client>) => Promise<void>;
  updateClient: (client: Partial<Client> & { id: string }) => Promise<void>;
  
  createQuote: (quote: Partial<Quote>) => Promise<void>;
  approveQuote: (quoteId: string) => Promise<void>;
  
  markInvoicePaid: (invoiceId: string) => Promise<void>;

  deleteClient: (id: string) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  resetDatabase: () => Promise<void>;
}

const notify = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  useNotificationStore.getState().addNotification({ message, type });
};

const handleApiError = (error: any, context: string) => {
  console.error(`[Store Error: ${context}]`, error);
  notify(`Failed to ${context.toLowerCase()}. Please try again.`, 'error');
};

const getApi = () => {
  if (!window.api) throw new Error('Electron API not initialized');
  return window.api;
};

export const useStore = create<AppState>((set, get) => ({
  clients: [],
  projects: [],
  quotes: [],
  invoices: [],
  loading: false,

  fetchClients: async () => {
    set({ loading: true });
    try {
      const clients = await getApi().getClients();
      set({ clients, loading: false });
    } catch (error) {
      handleApiError(error, 'Fetch Clients');
      set({ loading: false });
    }
  },

  fetchProjects: async () => {
    set({ loading: true });
    try {
      const projects = await getApi().getProjects();
      set({ projects, loading: false });
    } catch (error) {
      handleApiError(error, 'Fetch Projects');
      set({ loading: false });
    }
  },

  fetchQuotes: async () => {
    set({ loading: true });
    try {
      const quotes = await getApi().getQuotes();
      set({ quotes, loading: false });
    } catch (error) {
      handleApiError(error, 'Fetch Quotes');
      set({ loading: false });
    }
  },

  fetchInvoices: async () => {
    set({ loading: true });
    try {
      const invoices = await getApi().getInvoices();
      set({ invoices, loading: false });
    } catch (error) {
      handleApiError(error, 'Fetch Invoices');
      set({ loading: false });
    }
  },

  getProjectDetails: async (projectId) => {
    return getApi().getProjectDetails(projectId);
  },

  updateMilestone: async (milestoneData) => {
    try {
      await getApi().updateMilestone(milestoneData);
      notify('Milestone updated', 'success');
    } catch (error) {
      handleApiError(error, 'Update Milestone');
      throw error;
    }
  },

  deleteMilestone: async (id) => {
    set({ loading: true });
    try {
      await getApi().deleteMilestone(id);
      notify('Milestone deleted', 'success');
    } catch (error) {
      handleApiError(error, 'Delete Milestone');
    } finally {
      set({ loading: false });
    }
  },

  createScopeChange: async (scopeData) => {
    try {
      await getApi().createScopeChange(scopeData);
      notify('Scope change request created', 'success');
    } catch (error) {
      handleApiError(error, 'Create Scope Change');
      throw error;
    }
  },

  approveScopeChange: async (scopeChangeId) => {
    set({ loading: true });
    try {
      await getApi().approveScopeChange(scopeChangeId);
      await get().fetchProjects();
      notify('Scope change approved', 'success');
    } catch (error) {
      handleApiError(error, 'Approve Scope Change');
    } finally {
      set({ loading: false });
    }
  },

  deleteScopeChange: async (id) => {
    set({ loading: true });
    try {
      await getApi().deleteScopeChange(id);
      notify('Scope change deleted', 'success');
    } catch (error) {
      handleApiError(error, 'Delete Scope Change');
    } finally {
      set({ loading: false });
    }
  },

  addClient: async (clientData) => {
    try {
      await getApi().createClient(clientData);
      await get().fetchClients();
      notify('Client added successfully', 'success');
    } catch (error) {
      handleApiError(error, 'Add Client');
      throw error;
    }
  },

  updateClient: async (clientData) => {
    try {
      await getApi().updateClient(clientData);
      await get().fetchClients();
      notify('Client updated', 'success');
    } catch (error) {
      handleApiError(error, 'Update Client');
      throw error;
    }
  },

  createQuote: async (quoteData) => {
    try {
      await getApi().createQuote(quoteData);
      await get().fetchQuotes();
      notify('Quote created successfully', 'success');
    } catch (error) {
      handleApiError(error, 'Create Quote');
      throw error;
    }
  },

  approveQuote: async (quoteId) => {
    set({ loading: true });
    try {
      await getApi().approveQuote(quoteId);
      await Promise.all([get().fetchProjects(), get().fetchQuotes()]);
      notify('Quote approved - Project created', 'success');
    } catch (error) {
      handleApiError(error, 'Approve Quote');
    } finally {
      set({ loading: false });
    }
  },

  markInvoicePaid: async (invoiceId) => {
    set({ loading: true });
    try {
      await getApi().markInvoicePaid(invoiceId);
      await get().fetchInvoices();
      notify('Invoice marked as paid', 'success');
    } catch (error) {
      handleApiError(error, 'Update Invoice');
    } finally {
      set({ loading: false });
    }
  },

  deleteClient: async (id) => {
    set({ loading: true });
    try {
      await getApi().deleteClient(id);
      await get().fetchClients();
      notify('Client deleted successfully', 'success');
    } catch (error) {
      handleApiError(error, 'Delete Client');
    } finally {
      set({ loading: false });
    }
  },

  deleteQuote: async (id) => {
    set({ loading: true });
    try {
      await getApi().deleteQuote(id);
      await get().fetchQuotes();
      notify('Quote deleted successfully', 'success');
    } catch (error) {
      handleApiError(error, 'Delete Quote');
    } finally {
      set({ loading: false });
    }
  },

  deleteProject: async (id) => {
    set({ loading: true });
    try {
      await getApi().deleteProject(id);
      await Promise.all([get().fetchProjects(), get().fetchInvoices()]);
      notify('Project deleted successfully', 'success');
    } catch (error) {
      handleApiError(error, 'Delete Project');
    } finally {
      set({ loading: false });
    }
  },

  deleteInvoice: async (id) => {
    set({ loading: true });
    try {
      await getApi().deleteInvoice(id);
      await get().fetchInvoices();
      notify('Invoice deleted successfully', 'success');
    } catch (error) {
      handleApiError(error, 'Delete Invoice');
    } finally {
      set({ loading: false });
    }
  },

  resetDatabase: async () => {
    try {
      await getApi().resetDatabase();
      notify('Database reset successful', 'success');
      window.location.reload();
    } catch (error) {
      handleApiError(error, 'Reset Database');
    }
  },
}));
