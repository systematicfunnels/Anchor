import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  category: text('category').notNull(), // 'Software', 'Contractor', 'Hardware', 'Travel', 'Other'
  description: text('description').notNull(),
  amount: real('amount').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  size: integer('size').notNull(),
  path: text('path').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

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

export const clientsRelations = relations(clients, ({ many }) => ({
  projects: many(projects),
  quotes: many(quotes),
  invoices: many(invoices),
  documents: many(documents),
}));

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  clientId: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type', { enum: ['Fixed', 'T&M', 'Retainer'] }).notNull(),
  status: text('status', { enum: ['Planned', 'Active', 'Completed', 'On Hold', 'Archived'] }).notNull().default('Planned'),
  baselineCost: real('baseline_cost').notNull(),
  baselinePrice: real('baseline_price').notNull(),
  baselineMargin: real('baseline_margin').notNull(),
  description: text('description'),
  actualCost: real('actual_cost').notNull().default(0),
  progress: integer('progress').notNull().default(0),
  startDate: integer('start_date', { mode: 'timestamp' }),
  endDate: integer('end_date', { mode: 'timestamp' }),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  milestones: many(milestones),
  scopeChanges: many(scopeChanges),
  invoices: many(invoices),
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  project: one(projects, {
    fields: [documents.projectId],
    references: [projects.id],
  }),
}));

export const milestones = sqliteTable('milestones', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  estimatedHours: real('estimated_hours').default(0),
  estimatedCost: real('estimated_cost').notNull(),
  price: real('price').notNull(),
  progress: integer('progress').notNull().default(0),
  status: text('status', { enum: ['Planned', 'In Progress', 'Completed'] }).notNull().default('Planned'),
});

export const milestonesRelations = relations(milestones, ({ one }) => ({
  project: one(projects, {
    fields: [milestones.projectId],
    references: [projects.id],
  }),
}));

export const quotes = sqliteTable('quotes', {
  id: text('id').primaryKey(),
  clientId: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  name: text('name').notNull().default('New Quote'),
  version: integer('version').notNull().default(1),
  status: text('status', { enum: ['Draft', 'Sent', 'Approved', 'Rejected', 'Archived'] }).notNull().default('Draft'),
  totalCost: real('total_cost').notNull(),
  totalPrice: real('total_price').notNull(),
  margin: real('margin').notNull(),
  notes: text('notes'),
  terms: text('terms'),
  taxRate: real('tax_rate'),
  cgstRate: real('cgst_rate'),
  sgstRate: real('sgst_rate'),
  discountRate: real('discount_rate'),
  gstin: text('gstin'),
  businessEmail: text('business_email'),
  businessPhone: text('business_phone'),
  businessAddress: text('business_address'),
  quotationNumber: text('quotation_number'),
  issueDate: integer('issue_date', { mode: 'timestamp' }),
  validUntil: integer('valid_until', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const quoteItems = sqliteTable('quote_items', {
  id: text('id').primaryKey(),
  quoteId: text('quote_id').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
  name: text('name'),
  description: text('description').notNull(),
  quantity: real('quantity').notNull().default(1),
  rate: real('rate').notNull().default(0),
  total: real('total').notNull().default(0),
});

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  client: one(clients, {
    fields: [quotes.clientId],
    references: [clients.id],
  }),
  items: many(quoteItems),
}));

export const quoteItemsRelations = relations(quoteItems, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteItems.quoteId],
    references: [quotes.id],
  }),
}));

export const scopeChanges = sqliteTable('scope_changes', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  costImpact: real('cost_impact').notNull().default(0),
  priceImpact: real('price_impact').notNull().default(0),
  status: text('status', { enum: ['Pending', 'Approved', 'Rejected'] }).notNull().default('Pending'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const scopeChangesRelations = relations(scopeChanges, ({ one }) => ({
  project: one(projects, {
    fields: [scopeChanges.projectId],
    references: [projects.id],
  }),
}));

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
  clientId: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
  status: text('status', { enum: ['Draft', 'Sent', 'Paid', 'Overdue', 'Archived'] }).notNull().default('Draft'),
  issueDate: integer('issue_date', { mode: 'timestamp' }).notNull(),
  dueDate: integer('due_date', { mode: 'timestamp' }).notNull(),
  subtotal: real('subtotal').notNull(),
  tax: real('tax').default(0),
  total: real('total').notNull(),
});

export const invoicesRelations = relations(invoices, ({ one }) => ({
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  project: one(projects, {
    fields: [invoices.projectId],
    references: [projects.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  project: one(projects, {
    fields: [expenses.projectId],
    references: [projects.id],
  }),
}));

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
