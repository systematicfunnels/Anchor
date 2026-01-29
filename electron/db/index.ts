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
sqlite.pragma('foreign_keys = ON');

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
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Planned',
    baseline_cost REAL NOT NULL,
    baseline_price REAL NOT NULL,
    baseline_margin REAL NOT NULL,
    description TEXT,
    progress INTEGER NOT NULL DEFAULT 0,
    actual_cost REAL NOT NULL DEFAULT 0,
    start_date INTEGER,
    end_date INTEGER
  );

  CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    estimated_hours REAL NOT NULL,
    estimated_cost REAL NOT NULL,
    price REAL NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Planned'
  );

  CREATE TABLE IF NOT EXISTS quotes (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'New Quote',
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
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'Draft',
    issue_date INTEGER NOT NULL,
    due_date INTEGER NOT NULL,
    subtotal REAL NOT NULL,
    tax REAL DEFAULT 0,
    total REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS scope_changes (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    cost_impact REAL NOT NULL DEFAULT 0,
    price_impact REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_trail (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    timestamp INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    date INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER NOT NULL,
    path TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS quote_items (
    id TEXT PRIMARY KEY,
    quote_id TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    estimated_hours REAL NOT NULL,
    estimated_cost REAL NOT NULL,
    price REAL NOT NULL
  );
`);

// Migration helpers for existing databases
try {
  sqlite.exec("ALTER TABLE quotes ADD COLUMN name TEXT NOT NULL DEFAULT 'New Quote'");
} catch (e) { /* Column already exists */ }

try {
  sqlite.exec("ALTER TABLE quotes ADD COLUMN margin REAL NOT NULL DEFAULT 0");
} catch (e) { /* Column already exists */ }

try {
  sqlite.exec("ALTER TABLE projects ADD COLUMN description TEXT");
} catch (e) { /* Column already exists */ }

try {
  sqlite.exec("ALTER TABLE projects ADD COLUMN progress INTEGER NOT NULL DEFAULT 0");
} catch (e) { /* Column already exists */ }

export function resetDatabase() {
  sqlite.exec(`
    DELETE FROM quote_items;
    DELETE FROM audit_trail;
    DELETE FROM scope_changes;
    DELETE FROM milestones;
    DELETE FROM invoices;
    DELETE FROM expenses;
    DELETE FROM documents;
    DELETE FROM settings;
    DELETE FROM projects;
    DELETE FROM quotes;
    DELETE FROM clients;
  `);
}
