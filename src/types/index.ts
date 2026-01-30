export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR';
export type ClientStatus = 'Active' | 'Archived';
export type ProjectType = 'Fixed' | 'T&M' | 'Retainer';
export type ProjectStatus = 'Planned' | 'Active' | 'Completed' | 'On Hold' | 'Archived';
export type MilestoneStatus = 'Planned' | 'In Progress' | 'Completed';
export type QuoteStatus = 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Archived';
export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Archived';

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
  description?: string;
  progress: number;
  startDate?: Date;
  endDate?: Date;
  client?: Client;
  milestones?: Milestone[];
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

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface Quote {
  id: string;
  clientId: string;
  name: string;
  version: number;
  status: QuoteStatus;
  items?: QuoteItem[];
  notes?: string;
  terms?: string;
  taxRate?: number;
  cgstRate?: number;
  sgstRate?: number;
  discountRate?: number;
  gstin?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  quotationNumber?: string;
  issueDate?: Date;
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

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  details?: string;
  timestamp: Date;
}

export interface Document {
  id: string;
  projectId: string;
  name: string;
  type: string;
  size: number;
  path: string;
  createdAt: Date;
}

export interface Expense {
  id: string;
  projectId: string;
  category: string;
  description: string;
  amount: number;
  date: Date;
  createdAt: Date;
}

export type ErrorCode = 
  | 'DATABASE_ERROR' 
  | 'VALIDATION_ERROR' 
  | 'NOT_FOUND' 
  | 'FILE_SYSTEM_ERROR' 
  | 'UNKNOWN_ERROR';

export interface AppError {
  __isAppError: true;
  code: ErrorCode;
  message: string;
  details?: any;
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
