import { create } from 'zustand';
import { Client, Project, Quote, Invoice, Milestone, ScopeChange, Document, Expense, Currency, AuditLog } from '../types';
import { useNotificationStore } from './useNotificationStore';

interface AppState {
  clients: Client[];
  projects: Project[];
  quotes: Quote[];
  invoices: Invoice[];
  expenses: Expense[];
  settings: Record<string, string>;
  auditLogs: AuditLog[];
  loading: boolean;
  
  // View mode for currency exchange check
  viewCurrency: Currency | null;
  setViewCurrency: (currency: Currency | null) => void;
  
  fetchClients: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchQuotes: () => Promise<void>;
  fetchInvoices: () => Promise<void>;
  fetchExpenses: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  fetchAuditLogs: () => Promise<void>;
  
  getProjectDetails: (projectId: string) => Promise<Project & { 
    milestones: Milestone[], 
    scopeChanges: ScopeChange[], 
    documents: Document[],
    expenses: Expense[]
  }>;
  
  // Expense actions
  addExpense: (expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  updateMilestone: (milestoneData: Partial<Milestone> & { id: string }) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  createScopeChange: (scopeChange: Partial<ScopeChange>) => Promise<void>;
  approveScopeChange: (scopeChangeId: string) => Promise<void>;
  deleteScopeChange: (id: string) => Promise<void>;
  
  // Document actions
  uploadDocument: (projectId: string, file: File) => Promise<void>;
  downloadDocument: (documentId: string) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  
  addClient: (client: Partial<Client>) => Promise<void>;
  updateClient: (client: Partial<Client> & { id: string }) => Promise<void>;
  addProject: (project: Partial<Project>) => Promise<void>;
  updateProject: (project: Partial<Project> & { id: string }) => Promise<void>;
  
  createQuote: (quote: Partial<Quote>) => Promise<void>;
  duplicateQuote: (quoteId: string) => Promise<void>;
  approveQuote: (quoteId: string) => Promise<void>;
  updateQuote: (quote: Partial<Quote> & { id: string }) => Promise<void>;
  
  markInvoicePaid: (invoiceId: string) => Promise<void>;
  generateInvoice: (projectId: string, milestoneIds: string[]) => Promise<void>;
  createManualInvoice: (invoiceData: { clientId: string, subtotal: number, projectId?: string, taxRate?: number }) => Promise<void>;

  updateSettings: (key: string, value: string) => Promise<void>;

  deleteClient: (id: string) => Promise<void>;
  archiveClient: (id: string) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  archiveQuote: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  archiveInvoice: (id: string) => Promise<void>;
  resetDatabase: () => Promise<void>;
}

const notify = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  useNotificationStore.getState().addNotification({ message, type });
};

const handleApiError = (error: any, context: string) => {
  const isAppError = error && typeof error === 'object' && (error.__isAppError || error.code);
  const message = isAppError ? error.message : `Failed to ${context.toLowerCase()}. Please try again.`;
  const type = isAppError && (error.code === 'VALIDATION_ERROR' || error.code === 'NOT_FOUND') ? 'warning' : 'error';
  
  console.error(`[Store Error: ${context}]`, error);
  notify(message, type);
};

const getApi = () => {
  if (!window.api) {
    console.warn('Electron API not found. Ensure you are running in the Electron environment for data persistence.');
    throw new Error('Electron API not initialized');
  }
  return window.api;
};

const wrapApiCall = async (apiCall: Promise<any>) => {
  const result = await apiCall;
  if (result && typeof result === 'object') {
    if ('success' in result) {
      if (!result.success) throw result.error;
      return result.data;
    }
    if (result.__isAppError) throw result;
  }
  return result;
};

export const useStore = create<AppState>((set, get) => ({
  clients: [],
  projects: [],
  quotes: [],
  invoices: [],
  expenses: [],
  settings: {},
  auditLogs: [],
  loading: false,
  viewCurrency: null,

  setViewCurrency: (currency) => set({ viewCurrency: currency }),

  fetchClients: async () => {
    set({ loading: true });
    try {
      const result = await wrapApiCall(getApi().getClients());
      set({ clients: result, loading: false });
    } catch (error) {
      handleApiError(error, 'Fetch Clients');
      set({ loading: false });
    }
  },

  fetchProjects: async () => {
    set({ loading: true });
    try {
      const result = await wrapApiCall(getApi().getProjects());
      set({ projects: result, loading: false });
    } catch (error) {
      handleApiError(error, 'Fetch Projects');
      set({ loading: false });
    }
  },

  fetchQuotes: async () => {
    set({ loading: true });
    try {
      const result = await wrapApiCall(getApi().getQuotes());
      set({ quotes: result, loading: false });
    } catch (error) {
      handleApiError(error, 'Fetch Quotes');
      set({ loading: false });
    }
  },

  fetchInvoices: async () => {
    set({ loading: true });
    try {
      const result = await wrapApiCall(getApi().getInvoices());
      set({ invoices: result, loading: false });
    } catch (error) {
      handleApiError(error, 'Fetch Invoices');
      set({ loading: false });
    }
  },

  fetchExpenses: async () => {
    set({ loading: true });
    try {
      const result = await wrapApiCall(getApi().getExpenses(''));
      set({ expenses: result, loading: false });
    } catch (error) {
      handleApiError(error, 'Fetch Expenses');
      set({ loading: false });
    }
  },

  fetchSettings: async () => {
    try {
      const result = await wrapApiCall(getApi().getSettings());
      set({ settings: result });
    } catch (error) {
      handleApiError(error, 'Fetch Settings');
    }
  },

  fetchAuditLogs: async () => {
    try {
      const result = await wrapApiCall(getApi().getAuditTrail());
      set({ auditLogs: result });
    } catch (error) {
      handleApiError(error, 'Fetch Audit Logs');
    }
  },

  getProjectDetails: async (projectId) => {
    return wrapApiCall(getApi().getProjectDetails(projectId));
  },

  updateMilestone: async (milestoneData) => {
    try {
      await wrapApiCall(getApi().updateMilestone(milestoneData));
      // Update local state for immediate feedback
      set((state) => ({
        projects: state.projects.map(p => {
          if (p.milestones) {
            return {
              ...p,
              milestones: p.milestones.map((m: Milestone) => 
                m.id === milestoneData.id ? { ...m, ...milestoneData } : m
              )
            };
          }
          return p;
        })
      }));
      notify('Milestone updated', 'success');
    } catch (error) {
      handleApiError(error, 'Update Milestone');
      throw error;
    }
  },

  deleteMilestone: async (id) => {
    set({ loading: true });
    try {
      await wrapApiCall(getApi().deleteMilestone(id));
      // Update local state
      set((state) => ({
        projects: state.projects.map(p => ({
          ...p,
          milestones: p.milestones?.filter((m: Milestone) => m.id !== id)
        })),
        loading: false
      }));
      notify('Milestone deleted', 'success');
    } catch (error) {
      handleApiError(error, 'Delete Milestone');
      set({ loading: false });
    }
  },

  createScopeChange: async (scopeData) => {
    try {
      await wrapApiCall(getApi().createScopeChange(scopeData));
      // We still re-fetch for scope changes as they affect multiple fields (actuals/baseline)
      // but we can do it in the background
      get().fetchProjects();
      notify('Scope change request created', 'success');
    } catch (error) {
      handleApiError(error, 'Create Scope Change');
      throw error;
    }
  },

  approveScopeChange: async (scopeChangeId) => {
    set({ loading: true });
    try {
      await wrapApiCall(getApi().approveScopeChange(scopeChangeId));
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
      await wrapApiCall(getApi().deleteScopeChange(id));
      await get().fetchProjects();
      notify('Scope change deleted', 'success');
    } catch (error) {
      handleApiError(error, 'Delete Scope Change');
    } finally {
      set({ loading: false });
    }
  },

  addExpense: async (expense) => {
    set({ loading: true });
    try {
      const newExpense = await wrapApiCall(getApi().addExpense(expense));
      // Update local state instead of full fetch
      set((state) => ({
        expenses: [newExpense, ...state.expenses],
        loading: false
      }));
      // Background fetch projects to update actualCost
      get().fetchProjects();
      notify('Expense added', 'success');
    } catch (error) {
      handleApiError(error, 'Add Expense');
      set({ loading: false });
    }
  },

  deleteExpense: async (id) => {
    set({ loading: true });
    try {
      await wrapApiCall(getApi().deleteExpense(id));
      // Update local state
      set((state) => ({
        expenses: state.expenses.filter(e => e.id !== id),
        loading: false
      }));
      // Background fetch projects to update actualCost
      get().fetchProjects();
      notify('Expense deleted', 'success');
    } catch (error) {
      handleApiError(error, 'Delete Expense');
      set({ loading: false });
    }
  },

  uploadDocument: async (projectId, file) => {
    set({ loading: true });
    try {
      const buffer = await file.arrayBuffer();
      await wrapApiCall(getApi().uploadDocument(
        projectId, 
        file.name, 
        file.type, 
        file.size, 
        buffer 
      ));
      notify('Document uploaded successfully', 'success');
    } catch (error) {
      handleApiError(error, 'Upload Document');
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  downloadDocument: async (documentId) => {
    try {
      const success = await wrapApiCall(getApi().downloadDocument(documentId));
      if (success) {
        notify('Document downloaded', 'success');
      }
    } catch (error) {
      handleApiError(error, 'Download Document');
    }
  },

  deleteDocument: async (documentId) => {
    set({ loading: true });
    try {
      await wrapApiCall(getApi().deleteDocument(documentId));
      await get().fetchProjects();
      notify('Document deleted', 'success');
    } catch (error) {
      handleApiError(error, 'Delete Document');
    } finally {
      set({ loading: false });
    }
  },

  addClient: async (clientData) => {
    try {
      await wrapApiCall(getApi().createClient(clientData));
      await get().fetchClients();
      notify('Client added successfully', 'success');
    } catch (error) {
      handleApiError(error, 'Add Client');
      throw error;
    }
  },

  updateClient: async (clientData) => {
    try {
      await wrapApiCall(getApi().updateClient(clientData));
      set((state) => ({
        clients: state.clients.map((c) => (c.id === clientData.id ? { ...c, ...clientData } : c)),
      }));
      notify('Client updated', 'success');
    } catch (error) {
      handleApiError(error, 'Update Client');
      throw error;
    }
  },

  addProject: async (projectData) => {
    set({ loading: true });
    try {
      await wrapApiCall(getApi().createProject(projectData));
      await get().fetchProjects();
      notify('Project created', 'success');
    } catch (error) {
      handleApiError(error, 'Create Project');
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateProject: async (projectData) => {
    try {
      await wrapApiCall(getApi().updateProject(projectData));
      await get().fetchProjects();
      notify('Project updated', 'success');
    } catch (error) {
      handleApiError(error, 'Update Project');
      throw error;
    }
  },

  createQuote: async (quoteData) => {
    try {
      await wrapApiCall(getApi().createQuote(quoteData));
      await get().fetchQuotes();
      notify('Quote created successfully', 'success');
    } catch (error) {
      handleApiError(error, 'Create Quote');
      throw error;
    }
  },

  updateQuote: async (quoteData) => {
    try {
      await wrapApiCall(getApi().updateQuote(quoteData));
      await get().fetchQuotes();
      notify('Quote updated successfully', 'success');
    } catch (error) {
      handleApiError(error, 'Update Quote');
      throw error;
    }
  },

  duplicateQuote: async (quoteId) => {
    set({ loading: true });
    try {
      await wrapApiCall(getApi().duplicateQuote(quoteId));
      await get().fetchQuotes();
      notify('Quote duplicated successfully', 'success');
    } catch (error) {
      handleApiError(error, 'Duplicate Quote');
    } finally {
      set({ loading: false });
    }
  },

  approveQuote: async (quoteId) => {
    set({ loading: true });
    try {
      await wrapApiCall(getApi().approveQuote(quoteId));
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
      await wrapApiCall(getApi().markInvoicePaid(invoiceId));
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
      await wrapApiCall(getApi().deleteClient(id));
      await get().fetchClients();
      notify('Client deleted successfully', 'success');
    } catch (error) {
      handleApiError(error, 'Delete Client');
    } finally {
      set({ loading: false });
    }
  },

  archiveClient: async (id) => {
    set({ loading: true });
    try {
      await wrapApiCall(getApi().updateClient({ id, status: 'Archived' }));
      await get().fetchClients();
      notify('Client archived', 'success');
    } catch (error) {
      handleApiError(error, 'Archive Client');
    } finally {
      set({ loading: false });
    }
  },

  deleteQuote: async (id) => {
    set({ loading: true });
    try {
      await wrapApiCall(getApi().deleteQuote(id));
      await get().fetchQuotes();
      notify('Quote deleted successfully', 'success');
    } catch (error) {
      handleApiError(error, 'Delete Quote');
    } finally {
      set({ loading: false });
    }
  },

  archiveQuote: async (id) => {
    set({ loading: true });
    try {
      await wrapApiCall(getApi().updateQuote({ id, status: 'Archived' }));
      await get().fetchQuotes();
      notify('Quote archived', 'success');
    } catch (error) {
      handleApiError(error, 'Archive Quote');
    } finally {
      set({ loading: false });
    }
  },

  deleteProject: async (id) => {
    set({ loading: true });
    try {
      await wrapApiCall(getApi().deleteProject(id));
      await Promise.all([get().fetchProjects(), get().fetchInvoices()]);
      notify('Project deleted successfully', 'success');
    } catch (error) {
      handleApiError(error, 'Delete Project');
    } finally {
      set({ loading: false });
    }
  },

  archiveProject: async (id) => {
    set({ loading: true });
    try {
      await wrapApiCall(getApi().updateProject({ id, status: 'Archived' }));
      await get().fetchProjects();
      notify('Project archived', 'success');
    } catch (error) {
      handleApiError(error, 'Archive Project');
    } finally {
      set({ loading: false });
    }
  },

  deleteInvoice: async (id) => {
    set({ loading: true });
    try {
      await wrapApiCall(getApi().deleteInvoice(id));
      await get().fetchInvoices();
      notify('Invoice deleted successfully', 'success');
    } catch (error) {
      handleApiError(error, 'Delete Invoice');
    } finally {
      set({ loading: false });
    }
  },

  archiveInvoice: async (id) => {
    set({ loading: true });
    try {
      await wrapApiCall(getApi().updateInvoice({ id, status: 'Archived' }));
      await get().fetchInvoices();
      notify('Invoice archived', 'success');
    } catch (error) {
      handleApiError(error, 'Archive Invoice');
    } finally {
      set({ loading: false });
    }
  },

  generateInvoice: async (projectId, milestoneIds) => {
    set({ loading: true });
    try {
      const result = await wrapApiCall(getApi().generateInvoice(projectId, milestoneIds));
      // Update local state
      set((state) => ({
        invoices: [result, ...state.invoices],
        loading: false
      }));
      notify('Invoice generated successfully', 'success');
    } catch (error) {
      handleApiError(error, 'Generate Invoice');
      set({ loading: false });
    }
  },

  createManualInvoice: async (invoiceData) => {
    set({ loading: true });
    try {
      const result = await wrapApiCall(getApi().createManualInvoice(invoiceData));
      // Update local state
      set((state) => ({
        invoices: [result, ...state.invoices],
        loading: false
      }));
      notify('Manual invoice created', 'success');
    } catch (error) {
      handleApiError(error, 'Create Manual Invoice');
      set({ loading: false });
    }
  },

  updateSettings: async (key, value) => {
    try {
      await wrapApiCall(getApi().updateSettings(key, value));
      await get().fetchSettings();
    } catch (error) {
      handleApiError(error, 'Update Settings');
    }
  },

  resetDatabase: async () => {
    try {
      await wrapApiCall(getApi().resetDatabase());
      notify('Database reset successful', 'success');
      window.location.reload();
    } catch (error) {
      handleApiError(error, 'Reset Database');
    }
  },
}));
