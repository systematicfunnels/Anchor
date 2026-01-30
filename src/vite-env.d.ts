import { Client, Project, Quote, Invoice, Milestone, ScopeChange, Document, Expense, AuditLog } from './types';

export interface IElectronAPI {
  getClients: () => Promise<Client[]>;
  createClient: (clientData: Partial<Client>) => Promise<Client>;
  updateClient: (clientData: Partial<Client> & { id: string }) => Promise<boolean>;
  getProjects: () => Promise<Project[]>;
  getProjectDetails: (projectId: string) => Promise<Project & { 
    milestones: Milestone[], 
    scopeChanges: ScopeChange[], 
    documents: Document[],
    expenses: Expense[]
  }>;
  createProject: (projectData: Partial<Project>) => Promise<Project>;
  updateProject: (projectData: Partial<Project> & { id: string }) => Promise<void>;
  updateMilestone: (milestoneData: Partial<Milestone> & { id: string }) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  createScopeChange: (scopeData: Partial<ScopeChange>) => Promise<void>;
  approveScopeChange: (scopeChangeId: string) => Promise<void>;
  deleteScopeChange: (id: string) => Promise<void>;
  
  // Document APIs
  getDocuments: (projectId: string) => Promise<Document[]>;
  uploadDocument: (projectId: string, name: string, type: string, size: number, buffer: ArrayBuffer) => Promise<void>;
  downloadDocument: (documentId: string) => Promise<boolean>;
  deleteDocument: (documentId: string) => Promise<void>;

  // Expense APIs
  getExpenses: (projectId?: string) => Promise<Expense[]>;
  addExpense: (expenseData: Partial<Expense>) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;

  getQuotes: () => Promise<Quote[]>;
  createQuote: (quoteData: Partial<Quote>) => Promise<Quote>;
  updateQuote: (quoteData: Partial<Quote> & { id: string }) => Promise<void>;
  duplicateQuote: (quoteId: string) => Promise<Quote>;
  approveQuote: (quoteId: string) => Promise<Project>;
  getInvoices: () => Promise<Invoice[]>;
  updateInvoice: (invoiceData: Partial<Invoice> & { id: string }) => Promise<void>;
  markInvoicePaid: (id: string) => Promise<boolean>;
  createManualInvoice: (invoiceData: { 
    clientId: string, 
    projectId?: string, 
    subtotal: number, 
    taxRate?: number 
  }) => Promise<Invoice>;
  deleteClient: (id: string) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  deleteInvoice: (id: string) => Promise<boolean>;
  generateInvoice: (projectId: string, milestoneIds?: string[]) => Promise<Invoice>;
  getSettings: () => Promise<Record<string, string>>;
  updateSettings: (key: string, value: string) => Promise<boolean>;
  resetDatabase: () => Promise<boolean>;
  exportDatabase: () => Promise<boolean>;
  getAuditTrail: () => Promise<AuditLog[]>;
  onMessage: (callback: (message: string) => void) => void;
}

declare global {
  interface Window {
    api: IElectronAPI;
  }
}
