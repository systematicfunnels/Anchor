import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const clients = sqliteTable('clients', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  email: text('email'),
  phone: text('phone'),
  billingAddress: text('billing_address'),
  currency: text('currency', { enum: ['USD', 'EUR', 'GBP', 'INR'] }).notNull().default('USD'),
  taxRate: real('tax_rate').default(0),
  status: text('status', { enum: ['Active', 'Archived'] }).notNull().default('Active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  clientId: text('client_id').notNull().references(() => clients.id),
  name: text('name').notNull(),
  type: text('type', { enum: ['Fixed', 'T&M', 'Retainer'] }).notNull(),
  status: text('status', { enum: ['Planned', 'Active', 'Completed', 'On Hold'] }).notNull().default('Planned'),
  baselineCost: real('baseline_cost').notNull(),
  baselinePrice: real('baseline_price').notNull(),
  baselineMargin: real('baseline_margin').notNull(),
  actualCost: real('actual_cost').notNull().default(0),
  startDate: integer('start_date', { mode: 'timestamp' }),
  endDate: integer('end_date', { mode: 'timestamp' }),
});

export const milestones = sqliteTable('milestones', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  name: text('name').notNull(),
  estimatedHours: real('estimated_hours').notNull(),
  estimatedCost: real('estimated_cost').notNull(),
  price: real('price').notNull(),
  progress: integer('progress').notNull().default(0),
  status: text('status', { enum: ['Planned', 'In Progress', 'Completed'] }).notNull().default('Planned'),
});

export const quotes = sqliteTable('quotes', {
  id: text('id').primaryKey(),
  clientId: text('client_id').notNull().references(() => clients.id),
  version: integer('version').notNull().default(1),
  status: text('status', { enum: ['Draft', 'Sent', 'Approved', 'Rejected'] }).notNull().default('Draft'),
  totalCost: real('total_cost').notNull(),
  totalPrice: real('total_price').notNull(),
  margin: real('margin').notNull(),
  validUntil: integer('valid_until', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const scopeChanges = sqliteTable('scope_changes', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  description: text('description').notNull(),
  costImpact: real('cost_impact').notNull().default(0),
  priceImpact: real('price_impact').notNull().default(0),
  status: text('status', { enum: ['Pending', 'Approved', 'Rejected'] }).notNull().default('Pending'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const auditTrail = sqliteTable('audit_trail', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(), // 'Quote', 'Invoice', 'Project'
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(),
  details: text('details'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  clientId: text('client_id').notNull().references(() => clients.id),
  projectId: text('project_id').references(() => projects.id),
  status: text('status', { enum: ['Draft', 'Sent', 'Paid', 'Overdue'] }).notNull().default('Draft'),
  issueDate: integer('issue_date', { mode: 'timestamp' }).notNull(),
  dueDate: integer('due_date', { mode: 'timestamp' }).notNull(),
  subtotal: real('subtotal').notNull(),
  tax: real('tax').default(0),
  total: real('total').notNull(),
});
