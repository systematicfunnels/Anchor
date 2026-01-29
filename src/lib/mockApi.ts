import type { IElectronAPI } from '../vite-env.d.ts';
import { Client, Project, Quote, Invoice } from '../types';

const mockClients: Client[] = [
  {
    id: 'mock-client-1',
    name: 'Acme Corp',
    email: 'billing@acme.com',
    phone: '+1-555-0123',
    billingAddress: '123 Business Way, Tech City',
    currency: 'USD',
    taxRate: 0,
    status: 'Active',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const mockProjects: Project[] = [
  {
    id: 'mock-project-1',
    clientId: 'mock-client-1',
    name: 'Mobile App Redesign',
    type: 'Fixed',
    status: 'Active',
    baselineCost: 5000,
    baselinePrice: 7500,
    baselineMargin: 33.3,
    actualCost: 5200,
    client: mockClients[0],
  }
];

const mockInvoices: Invoice[] = [
  {
    id: 'mock-invoice-1',
    invoiceNumber: 'INV-2024-001',
    clientId: 'mock-client-1',
    projectId: 'mock-project-1',
    status: 'Paid',
    issueDate: new Date(Date.now() - 86400000 * 7),
    dueDate: new Date(Date.now() - 86400000 * 3),
    subtotal: 1500,
    tax: 0,
    total: 1500,
    client: mockClients[0],
  },
  {
    id: 'mock-invoice-2',
    invoiceNumber: 'INV-2024-002',
    clientId: 'mock-client-1',
    projectId: 'mock-project-1',
    status: 'Sent',
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 86400000 * 14),
    subtotal: 3000,
    tax: 0,
    total: 3000,
    client: mockClients[0],
  }
];

export const mockApi: IElectronAPI = {
  getClients: async () => mockClients,
  createClient: async (data) => ({ ...data, id: Math.random().toString(), createdAt: new Date(), updatedAt: new Date() } as Client),
  updateClient: async () => true,
  getProjects: async () => mockProjects,
  getProjectDetails: async (id) => ({
    ...mockProjects.find(p => p.id === id)!,
    milestones: [],
    scopeChanges: [],
  }),
  updateMilestone: async () => {},
  deleteMilestone: async () => {},
  createScopeChange: async () => {},
  approveScopeChange: async () => {},
  deleteScopeChange: async () => {},
  getQuotes: async () => [],
  createQuote: async (data) => ({ ...data, id: Math.random().toString() } as Quote),
  approveQuote: async () => mockProjects[0],
  getInvoices: async () => mockInvoices,
  markInvoicePaid: async () => {},
  deleteClient: async () => {},
  deleteQuote: async () => {},
  deleteProject: async () => {},
  deleteInvoice: async () => {},
  resetDatabase: async () => {},
  onMessage: () => {},
};
