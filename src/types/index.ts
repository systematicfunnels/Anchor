export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR';
export type ClientStatus = 'Active' | 'Archived';
export type ProjectType = 'Fixed' | 'T&M' | 'Retainer';
export type ProjectStatus = 'Planned' | 'Active' | 'Completed' | 'On Hold';
export type MilestoneStatus = 'Planned' | 'In Progress' | 'Completed';
export type QuoteStatus = 'Draft' | 'Sent' | 'Approved' | 'Rejected';
export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  billingAddress?: string;
  currency: Currency;
  taxRate: number;
  status: ClientStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  baselineCost: number;
  baselinePrice: number;
  baselineMargin: number;
  actualCost: number;
  startDate?: Date;
  endDate?: Date;
  client?: Client;
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  estimatedHours: number;
  estimatedCost: number;
  price: number;
  progress: number;
  status: MilestoneStatus;
}

export interface Quote {
  id: string;
  clientId: string;
  version: number;
  status: QuoteStatus;
  totalCost: number;
  totalPrice: number;
  margin: number;
  validUntil?: Date;
  createdAt: Date;
  client?: Client;
}

export interface ScopeChange {
  id: string;
  projectId: string;
  description: string;
  costImpact: number;
  priceImpact: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
}

export interface AuditTrail {
  id: string;
  entityType: 'Quote' | 'Invoice' | 'Project';
  entityId: string;
  action: string;
  details?: string;
  timestamp: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId?: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  subtotal: number;
  tax: number;
  total: number;
  client?: Client;
  project?: Project;
}
