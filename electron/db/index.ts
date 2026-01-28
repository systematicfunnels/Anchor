import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'node:path';
import { app } from 'electron';
import * as schema from './schema';

const isDev = !app.isPackaged;
const dbPath = isDev 
  ? path.join(process.cwd(), 'serviceops.db')
  : path.join(app.getPath('userData'), 'serviceops.db');

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Run migrations manually or use drizzle-kit for production
// For v1, we'll ensure tables exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    email TEXT,
    phone TEXT,
    billing_address TEXT,
    currency TEXT NOT NULL DEFAULT 'USD',
    tax_rate REAL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Planned',
    baseline_cost REAL NOT NULL,
    baseline_price REAL NOT NULL,
    baseline_margin REAL NOT NULL,
    actual_cost REAL NOT NULL DEFAULT 0,
    start_date INTEGER,
    end_date INTEGER
  );

  CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id),
    name TEXT NOT NULL,
    estimated_hours REAL NOT NULL,
    estimated_cost REAL NOT NULL,
    price REAL NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Planned'
  );

  CREATE TABLE IF NOT EXISTS quotes (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id),
    version INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'Draft',
    total_cost REAL NOT NULL,
    total_price REAL NOT NULL,
    margin REAL NOT NULL,
    valid_until INTEGER,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT NOT NULL UNIQUE,
    client_id TEXT NOT NULL REFERENCES clients(id),
    project_id TEXT REFERENCES projects(id),
    status TEXT NOT NULL DEFAULT 'Draft',
    issue_date INTEGER NOT NULL,
    due_date INTEGER NOT NULL,
    subtotal REAL NOT NULL,
    tax REAL DEFAULT 0,
    total REAL NOT NULL
  );
`);

// Add sample data if empty
const clientCount = (db.select().from(schema.clients).all()).length;
if (clientCount === 0) {
  const clientId = 'sample-client-1';
  sqlite.prepare(`
    INSERT INTO clients (id, name, email, phone, billing_address, currency, tax_rate, status, created_at, updated_at)
    VALUES (?, 'Acme Corp', 'billing@acme.com', '+1-555-0123', '123 Business Way, Tech City', 'USD', 0, 'Active', ?, ?)
  `).run(clientId, Date.now(), Date.now());

  const projectId = 'sample-project-1';
  sqlite.prepare(`
    INSERT INTO projects (id, client_id, name, type, status, baseline_cost, baseline_price, baseline_margin, actual_cost)
    VALUES (?, ?, 'Mobile App Redesign', 'Fixed', 'Active', 5000, 7500, 33.3, 5200)
  `).run(projectId, clientId);

  sqlite.prepare(`
    INSERT INTO milestones (id, project_id, name, estimated_hours, estimated_cost, price, progress, status)
    VALUES ('sample-milestone-1', ?, 'Initial Discovery', 20, 1000, 1500, 100, 'Completed')
  `).run(projectId);

  sqlite.prepare(`
    INSERT INTO milestones (id, project_id, name, estimated_hours, estimated_cost, price, progress, status)
    VALUES ('sample-milestone-2', ?, 'UI/UX Design', 40, 2000, 3000, 65, 'In Progress')
  `).run(projectId);

  sqlite.prepare(`
    INSERT INTO quotes (id, client_id, version, status, total_cost, total_price, margin, created_at)
    VALUES ('sample-quote-1', ?, 1, 'Approved', 5000, 7500, 33.3, ?)
  `).run(clientId, Date.now());

  sqlite.prepare(`
    INSERT INTO invoices (id, invoice_number, client_id, project_id, status, issue_date, due_date, subtotal, tax, total)
    VALUES ('sample-invoice-1', 'INV-2024-001', ?, ?, 'Paid', ?, ?, 1500, 0, 1500)
  `).run(clientId, projectId, Date.now() - 86400000 * 7, Date.now() - 86400000 * 3);

  sqlite.prepare(`
    INSERT INTO invoices (id, invoice_number, client_id, project_id, status, issue_date, due_date, subtotal, tax, total)
    VALUES ('sample-invoice-2', 'INV-2024-002', ?, ?, 'Sent', ?, ?, 3000, 0, 3000)
  `).run(clientId, projectId, Date.now(), Date.now() + 86400000 * 14);
}
}
