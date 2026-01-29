import type { IElectronAPI } from '../vite-env.d.ts';
import { v4 as uuidv4 } from 'uuid';

// This is a clean, in-memory fallback for browser-based previews (e.g., Trae Preview).
// It starts with zero data to satisfy the "no dummy data" requirement.
// Data will NOT persist across refreshes in the browser.

const store: any = {
  clients: [],
  projects: [],
  quotes: [],
  invoices: [],
  expenses: [],
  documents: [],
  settings: {
    currency: 'USD',
    taxRate: '0',
    invoicePrefix: 'INV-',
    invoiceNextNumber: '1001',
    paymentTerms: '30'
  },
  milestones: [],
  scopeChanges: []
};

export const browserApi: IElectronAPI = {
  getClients: async () => store.clients,
  createClient: async (data) => {
    const client = { ...data, id: uuidv4(), createdAt: new Date(), updatedAt: new Date() } as any;
    store.clients.push(client);
    return client;
  },
  updateClient: async ({ id, ...data }) => {
    const index = store.clients.findIndex((c: any) => c.id === id);
    if (index !== -1) store.clients[index] = { ...store.clients[index], ...data, updatedAt: new Date() };
    return true;
  },
  deleteClient: async (id) => {
    store.clients = store.clients.filter((c: any) => c.id !== id);
  },

  getProjects: async () => store.projects,
  getProjectDetails: async (projectId) => {
    const project = store.projects.find((p: any) => p.id === projectId);
    if (!project) throw new Error('Project not found');
    return {
      ...project,
      milestones: store.milestones.filter((m: any) => m.projectId === projectId),
      scopeChanges: store.scopeChanges.filter((s: any) => s.projectId === projectId),
      documents: store.documents.filter((d: any) => d.projectId === projectId),
      expenses: store.expenses.filter((e: any) => e.projectId === projectId),
    };
  },
  createProject: async (data) => {
    const project = { 
      ...data, 
      id: uuidv4(), 
      status: data.status || 'Planned',
      progress: data.progress || 0,
      startDate: new Date(),
      actualCost: data.actualCost || 0
    } as any;
    store.projects.push(project);
    return project;
  },
  updateProject: async ({ id, ...data }) => {
    const index = store.projects.findIndex((p: any) => p.id === id);
    if (index !== -1) store.projects[index] = { ...store.projects[index], ...data };
  },
  deleteProject: async (id) => {
    store.projects = store.projects.filter((p: any) => p.id !== id);
  },

  getQuotes: async () => store.quotes,
  createQuote: async (data) => {
    const quote = { ...data, id: uuidv4(), createdAt: new Date() } as any;
    store.quotes.push(quote);
    return quote;
  },
  approveQuote: async (quoteId) => {
    const quote = store.quotes.find((q: any) => q.id === quoteId);
    const project = {
      id: uuidv4(),
      clientId: quote.clientId,
      name: quote.name,
      status: 'Planned',
      baselineCost: quote.totalCost,
      baselinePrice: quote.totalPrice,
      baselineMargin: quote.margin,
      actualCost: 0,
      startDate: new Date(),
    } as any;
    store.projects.push(project);
    return project;
  },
  deleteQuote: async (id) => {
    store.quotes = store.quotes.filter((q: any) => q.id !== id);
  },
  duplicateQuote: async (quoteId) => {
    const quote = store.quotes.find((q: any) => q.id === quoteId);
    if (!quote) throw new Error('Quote not found');
    const newQuote = { 
      ...quote, 
      id: uuidv4(), 
      name: `${quote.name} (Copy)`,
      createdAt: new Date(),
      status: 'Draft'
    };
    store.quotes.push(newQuote);
    return newQuote;
  },

  getInvoices: async () => store.invoices,
  markInvoicePaid: async (id) => {
    const invoice = store.invoices.find((i: any) => i.id === id);
    if (invoice) invoice.status = 'Paid';
    return true;
  },
  deleteInvoice: async (id) => {
    store.invoices = store.invoices.filter((i: any) => i.id !== id);
    return true;
  },
  createManualInvoice: async (data) => {
    const invoice = {
      ...data,
      id: uuidv4(),
      invoiceNumber: `${store.settings.invoicePrefix}${store.settings.invoiceNextNumber}`,
      status: 'Draft',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + (parseInt(store.settings.paymentTerms) || 30) * 24 * 60 * 60 * 1000),
      tax: (data.subtotal * (parseFloat(data.taxRate?.toString() || store.settings.taxRate) / 100)) || 0,
      total: data.subtotal * (1 + (parseFloat(data.taxRate?.toString() || store.settings.taxRate) / 100)),
    } as any;
    store.invoices.push(invoice);
    store.settings.invoiceNextNumber = (parseInt(store.settings.invoiceNextNumber) + 1).toString();
    return invoice;
  },
  generateInvoice: async (projectId, _milestoneIds) => {
    const project = store.projects.find((p: any) => p.id === projectId);
    const invoice = {
      id: uuidv4(),
      invoiceNumber: `${store.settings.invoicePrefix}${store.settings.invoiceNextNumber}`,
      clientId: project.clientId,
      projectId: project.id,
      status: 'Draft',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subtotal: project.baselinePrice,
      tax: 0,
      total: project.baselinePrice,
    } as any;
    store.invoices.push(invoice);
    store.settings.invoiceNextNumber = (parseInt(store.settings.invoiceNextNumber) + 1).toString();
    return invoice;
  },

  getExpenses: async (projectId) => {
    if (projectId) return store.expenses.filter((e: any) => e.projectId === projectId);
    return store.expenses;
  },
  addExpense: async (data) => {
    const expense = { ...data, id: uuidv4(), createdAt: new Date() } as any;
    store.expenses.push(expense);
    return expense;
  },
  deleteExpense: async (id) => {
    store.expenses = store.expenses.filter((e: any) => e.id !== id);
  },

  getDocuments: async (projectId) => store.documents.filter((d: any) => d.projectId === projectId),
  uploadDocument: async (projectId, name, type, size, _buffer) => {
    store.documents.push({ id: uuidv4(), projectId, name, type, size, path: '', createdAt: new Date() });
  },
  downloadDocument: async () => true,
  deleteDocument: async (id) => {
    store.documents = store.documents.filter((d: any) => d.id !== id);
  },

  updateMilestone: async ({ id, ...data }) => {
    const index = store.milestones.findIndex((m: any) => m.id === id);
    if (index !== -1) store.milestones[index] = { ...store.milestones[index], ...data };
  },
  deleteMilestone: async (id) => {
    store.milestones = store.milestones.filter((m: any) => m.id !== id);
  },

  createScopeChange: async (data) => {
    store.scopeChanges.push({ ...data, id: uuidv4(), createdAt: new Date(), status: 'Pending' });
  },
  approveScopeChange: async (id) => {
    const sc = store.scopeChanges.find((s: any) => s.id === id);
    if (sc) sc.status = 'Approved';
  },
  deleteScopeChange: async (id) => {
    store.scopeChanges = store.scopeChanges.filter((s: any) => s.id !== id);
  },

  getSettings: async () => store.settings,
  updateSettings: async (key, value) => {
    store.settings[key] = value;
    return true;
  },
  resetDatabase: async () => {
    Object.keys(store).forEach(key => {
      if (Array.isArray(store[key])) store[key] = [];
    });
    return true;
  },
  onMessage: () => {}
};
