import { Client, Project, Quote, Invoice, Milestone, ScopeChange } from './types';

export interface IElectronAPI {
  getClients: () => Promise<Client[]>;
  createClient: (clientData: Partial<Client>) => Promise<Client>;
  updateClient: (clientData: Partial<Client> & { id: string }) => Promise<boolean>;
  getProjects: () => Promise<Project[]>;
  getProjectDetails: (projectId: string) => Promise<Project & { milestones: Milestone[], scopeChanges: ScopeChange[] }>;
  updateMilestone: (milestoneData: Partial<Milestone> & { id: string }) => Promise<void>;
  createScopeChange: (scopeData: Partial<ScopeChange>) => Promise<void>;
  approveScopeChange: (scopeChangeId: string) => Promise<void>;
  getQuotes: () => Promise<Quote[]>;
  createQuote: (quoteData: Partial<Quote>) => Promise<Quote>;
  approveQuote: (quoteId: string) => Promise<Project>;
  getInvoices: () => Promise<Invoice[]>;
  markInvoicePaid: (invoiceId: string) => Promise<void>;
  onMessage: (callback: (message: string) => void) => void;
}

declare global {
  interface Window {
    api: IElectronAPI;
  }
}
