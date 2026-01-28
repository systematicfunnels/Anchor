import { create } from 'zustand';
import { Client, Project, Quote, Invoice, Milestone, ScopeChange } from '../types';

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
  updateMilestone: (milestone: Partial<Milestone> & { id: string }) => Promise<void>;
  createScopeChange: (scopeChange: Partial<ScopeChange>) => Promise<void>;
  approveScopeChange: (scopeChangeId: string) => Promise<void>;
  
  addClient: (client: Partial<Client>) => Promise<void>;
  updateClient: (client: Partial<Client> & { id: string }) => Promise<void>;
  
  createQuote: (quote: Partial<Quote>) => Promise<void>;
  approveQuote: (quoteId: string) => Promise<void>;
  
  markInvoicePaid: (invoiceId: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  clients: [],
  projects: [],
  quotes: [],
  invoices: [],
  loading: false,

  fetchClients: async () => {
    set({ loading: true });
    try {
      if (!window.api) {
        throw new Error('window.api is undefined. This store method must be called within an Electron environment.');
      }
      const clients = await window.api.getClients();
      set({ clients, loading: false });
    } catch (error) {
      console.error('Failed to fetch clients', error);
      set({ loading: false });
    }
  },

  fetchProjects: async () => {
    set({ loading: true });
    try {
      if (!window.api) {
        throw new Error('window.api is undefined. This store method must be called within an Electron environment.');
      }
      const projects = await window.api.getProjects();
      set({ projects, loading: false });
    } catch (error) {
      console.error('Failed to fetch projects', error);
      set({ loading: false });
    }
  },

  fetchQuotes: async () => {
    set({ loading: true });
    try {
      if (!window.api) {
        throw new Error('window.api is undefined. This store method must be called within an Electron environment.');
      }
      const quotes = await window.api.getQuotes();
      set({ quotes, loading: false });
    } catch (error) {
      console.error('Failed to fetch quotes', error);
      set({ loading: false });
    }
  },

  fetchInvoices: async () => {
    set({ loading: true });
    try {
      if (!window.api) {
        throw new Error('window.api is undefined. This store method must be called within an Electron environment.');
      }
      const invoices = await window.api.getInvoices();
      set({ invoices, loading: false });
    } catch (error) {
      console.error('Failed to fetch invoices', error);
      set({ loading: false });
    }
  },

  getProjectDetails: async (projectId) => {
    if (!window.api) {
      throw new Error('window.api is undefined');
    }
    return window.api.getProjectDetails(projectId);
  },

  updateMilestone: async (milestoneData) => {
    if (!window.api) {
      throw new Error('window.api is undefined');
    }
    await window.api.updateMilestone(milestoneData);
  },

  createScopeChange: async (scopeData) => {
    if (!window.api) {
      throw new Error('window.api is undefined');
    }
    await window.api.createScopeChange(scopeData);
  },

  approveScopeChange: async (scopeChangeId) => {
    if (!window.api) {
      throw new Error('window.api is undefined');
    }
    set({ loading: true });
    try {
      await window.api.approveScopeChange(scopeChangeId);
      const { fetchProjects } = get();
      await fetchProjects();
    } finally {
      set({ loading: false });
    }
  },

  addClient: async (clientData) => {
    if (!window.api) {
      throw new Error('window.api is undefined');
    }
    await window.api.createClient(clientData);
    const { fetchClients } = get();
    await fetchClients();
  },

  updateClient: async (clientData) => {
    if (!window.api) {
      throw new Error('window.api is undefined');
    }
    await window.api.updateClient(clientData);
    const { fetchClients } = get();
    await fetchClients();
  },

  createQuote: async (quoteData) => {
    if (!window.api) {
      throw new Error('window.api is undefined');
    }
    await window.api.createQuote(quoteData);
    const { fetchQuotes } = get();
    await fetchQuotes();
  },

  approveQuote: async (quoteId) => {
    if (!window.api) {
      throw new Error('window.api is undefined');
    }
    set({ loading: true });
    try {
      await window.api.approveQuote(quoteId);
      const { fetchProjects, fetchQuotes } = get();
      await fetchProjects();
      await fetchQuotes();
    } finally {
      set({ loading: false });
    }
  },

  markInvoicePaid: async (invoiceId) => {
    if (!window.api) {
      throw new Error('window.api is undefined');
    }
    set({ loading: true });
    try {
      await window.api.markInvoicePaid(invoiceId);
      const { fetchInvoices } = get();
      await fetchInvoices();
    } finally {
      set({ loading: false });
    }
  },
}));
