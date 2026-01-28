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
}

const notify = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  useNotificationStore.getState().addNotification({ message, type });
};

const handleApiError = (error: any, context: string) => {
  console.error(`[Store Error: ${context}]`, error);
  notify(`Failed to ${context.toLowerCase()}. Please try again.`, 'error');
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
      if (!window.api) throw new Error('API not found');
      const clients = await window.api.getClients();
      set({ clients, loading: false });
    } catch (error) {
      handleApiError(error, 'Fetch Clients');
      set({ loading: false });
    }
  },

  fetchProjects: async () => {
    set({ loading: true });
    try {
      if (!window.api) throw new Error('API not found');
      const projects = await window.api.getProjects();
      set({ projects, loading: false });
    } catch (error) {
      handleApiError(error, 'Fetch Projects');
      set({ loading: false });
    }
  },

  fetchQuotes: async () => {
    set({ loading: true });
    try {
      if (!window.api) throw new Error('API not found');
      const quotes = await window.api.getQuotes();
      set({ quotes, loading: false });
    } catch (error) {
      handleApiError(error, 'Fetch Quotes');
      set({ loading: false });
    }
  },

  fetchInvoices: async () => {
    set({ loading: true });
    try {
      if (!window.api) throw new Error('API not found');
      const invoices = await window.api.getInvoices();
      set({ invoices, loading: false });
    } catch (error) {
      handleApiError(error, 'Fetch Invoices');
      set({ loading: false });
    }
  },

  getProjectDetails: async (projectId) => {
    if (!window.api) throw new Error('API not found');
    return window.api.getProjectDetails(projectId);
  },

  updateMilestone: async (milestoneData) => {
    if (!window.api) throw new Error('API not found');
    try {
      await window.api.updateMilestone(milestoneData);
      notify('Milestone updated', 'success');
    } catch (error) {
      handleApiError(error, 'Update Milestone');
      throw error;
    }
  },

  deleteMilestone: async (id) => {
    if (!window.api) throw new Error('API not found');
    set({ loading: true });
    try {
      await window.api.deleteMilestone(id);
      notify('Milestone deleted', 'success');
    } catch (error) {
      handleApiError(error, 'Delete Milestone');
    } finally {
      set({ loading: false });
    }
  },

  createScopeChange: async (scopeData) => {
    if (!window.api) throw new Error('API not found');
    try {
      await window.api.createScopeChange(scopeData);
      notify('Scope change request created', 'success');
    } catch (error) {
      handleApiError(error, 'Create Scope Change');
      throw error;
    }
  },

  approveScopeChange: async (scopeChangeId) => {
    if (!window.api) throw new Error('API not found');
    set({ loading: true });
    try {
      await window.api.approveScopeChange(scopeChangeId);
      await get().fetchProjects();
      notify('Scope change approved', 'success');
    } catch (error) {
      handleApiError(error, 'Approve Scope Change');
    } finally {
      set({ loading: false });
    }
  },

  deleteScopeChange: async (id) => {
    if (!window.api) throw new Error('API not found');
    set({ loading: true });
    try {
      await window.api.deleteScopeChange(id);
      notify('Scope change deleted', 'success');
    } catch (error) {
      handleApiError(error, 'Delete Scope Change');
    } finally {
      set({ loading: false });
    }
  },

  addClient: async (clientData) => {
    if (!window.api) throw new Error('API not found');
    try {
      await window.api.createClient(clientData);
      await get().fetchClients();
      notify('Client added successfully', 'success');
    } catch (error) {
      handleApiError(error, 'Add Client');
      throw error;
    }
  },

  updateClient: async (clientData) => {
    if (!window.api) throw new Error('API not found');
    try {
      await window.api.updateClient(clientData);
      await get().fetchClients();
      notify('Client updated', 'success');
    } catch (error) {
      handleApiError(error, 'Update Client');
      throw error;
    }
  },

  createQuote: async (quoteData) => {
    if (!window.api) throw new Error('API not found');
    try {
      await window.api.createQuote(quoteData);
      await get().fetchQuotes();
      notify('Quote created successfully', 'success');
    } catch (error) {
      handleApiError(error, 'Create Quote');
      throw error;
    }
  },

  approveQuote: async (quoteId) => {
    if (!window.api) throw new Error('API not found');
    set({ loading: true });
    try {
      await window.api.approveQuote(quoteId);
      await Promise.all([get().fetchProjects(), get().fetchQuotes()]);
      notify('Quote approved - Project created', 'success');
    } catch (error) {
      handleApiError(error, 'Approve Quote');
    } finally {
      set({ loading: false });
    }
  },

  markInvoicePaid: async (invoiceId) => {
    if (!window.api) throw new Error('API not found');
    set({ loading: true });
    try {
      await window.api.markInvoicePaid(invoiceId);
      await get().fetchInvoices();
      notify('Invoice marked as paid', 'success');
    } catch (error) {
      handleApiError(error, 'Update Invoice');
    } finally {
      set({ loading: false });
    }
  },

  deleteClient: async (id) => {
    if (!window.api) throw new Error('API not found');
    set({ loading: true });
    try {
      await window.api.deleteClient(id);
      await get().fetchClients();
      notify('Client deleted successfully', 'success');
    } catch (error) {
      handleApiError(error, 'Delete Client');
    } finally {
      set({ loading: false });
    }
  },

  deleteQuote: async (id) => {
    if (!window.api) throw new Error('API not found');
    set({ loading: true });
    try {
      await window.api.deleteQuote(id);
      await get().fetchQuotes();
      notify('Quote deleted successfully', 'success');
    } catch (error) {
      handleApiError(error, 'Delete Quote');
    } finally {
      set({ loading: false });
    }
  },

  deleteProject: async (id) => {
    if (!window.api) throw new Error('API not found');
    set({ loading: true });
    try {
      await window.api.deleteProject(id);
      await get().fetchProjects();
      notify('Project deleted successfully', 'success');
    } catch (error) {
      handleApiError(error, 'Delete Project');
    } finally {
      set({ loading: false });
    }
  },

  deleteInvoice: async (id) => {
    if (!window.api) throw new Error('API not found');
    set({ loading: true });
    try {
      await window.api.deleteInvoice(id);
      await get().fetchInvoices();
      notify('Invoice deleted successfully', 'success');
    } catch (error) {
      handleApiError(error, 'Delete Invoice');
    } finally {
      set({ loading: false });
    }
  },
}));
