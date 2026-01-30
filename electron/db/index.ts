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
    estimated_hours REAL DEFAULT 0,
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
    notes TEXT,
    terms TEXT,
    tax_rate REAL,
    cgst_rate REAL,
    sgst_rate REAL,
    discount_rate REAL,
    gstin TEXT,
    business_email TEXT,
    business_phone TEXT,
    business_address TEXT,
    quotation_number TEXT,
    issue_date INTEGER,
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
    name TEXT,
    description TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 1,
    rate REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0
  );
`);

// Migration helpers for existing databases
try {
  sqlite.exec("ALTER TABLE quotes ADD COLUMN name TEXT NOT NULL DEFAULT 'New Quote'");
} catch (e) { /* Column already exists */ }

try {
  sqlite.exec("ALTER TABLE quotes ADD COLUMN margin REAL NOT NULL DEFAULT 0");
} catch (e) { /* Column already exists */ }

try { sqlite.exec("ALTER TABLE quotes ADD COLUMN notes TEXT"); } catch (e) {}
try { sqlite.exec("ALTER TABLE quotes ADD COLUMN terms TEXT"); } catch (e) {}
try { sqlite.exec("ALTER TABLE quotes ADD COLUMN tax_rate REAL"); } catch (e) {}
try { sqlite.exec("ALTER TABLE quotes ADD COLUMN cgst_rate REAL"); } catch (e) {}
try { sqlite.exec("ALTER TABLE quotes ADD COLUMN sgst_rate REAL"); } catch (e) {}
try { sqlite.exec("ALTER TABLE quotes ADD COLUMN discount_rate REAL"); } catch (e) {}
try { sqlite.exec("ALTER TABLE quotes ADD COLUMN gstin TEXT"); } catch (e) {}
try { sqlite.exec("ALTER TABLE quotes ADD COLUMN business_email TEXT"); } catch (e) {}
try { sqlite.exec("ALTER TABLE quotes ADD COLUMN business_phone TEXT"); } catch (e) {}
try { sqlite.exec("ALTER TABLE quotes ADD COLUMN business_address TEXT"); } catch (e) {}
try { sqlite.exec("ALTER TABLE quotes ADD COLUMN quotation_number TEXT"); } catch (e) {}
try { sqlite.exec("ALTER TABLE quotes ADD COLUMN issue_date INTEGER"); } catch (e) {}

// Migrate quote_items columns if necessary
try { sqlite.exec("ALTER TABLE quote_items ADD COLUMN name TEXT"); } catch (e) {}
try { sqlite.exec("ALTER TABLE quote_items ADD COLUMN quantity REAL NOT NULL DEFAULT 1"); } catch (e) {}
try { sqlite.exec("ALTER TABLE quote_items ADD COLUMN rate REAL NOT NULL DEFAULT 0"); } catch (e) {}
try { sqlite.exec("ALTER TABLE quote_items ADD COLUMN total REAL NOT NULL DEFAULT 0"); } catch (e) {}

// FORCE FIX: milestones table estimated_hours constraint
try {
  // Check if estimated_hours is NOT NULL
  const info = sqlite.prepare("PRAGMA table_info(milestones)").all() as any[];
  const hoursCol = info.find(c => c.name === 'estimated_hours');
  
  if (hoursCol && hoursCol.notnull === 1) {
    console.log('Detected STALE NOT NULL constraint on milestones.estimated_hours. Reconstructing table...');
    sqlite.transaction(() => {
      // 1. Create temporary table
      sqlite.exec(`
        CREATE TABLE milestones_new (
          id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          estimated_hours REAL DEFAULT 0,
          estimated_cost REAL NOT NULL,
          price REAL NOT NULL,
          progress INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'Planned'
        )
      `);
      // 2. Copy data
      sqlite.exec(`INSERT INTO milestones_new SELECT * FROM milestones`);
      // 3. Drop old table
      sqlite.exec(`DROP TABLE milestones`);
      // 4. Rename new table
      sqlite.exec(`ALTER TABLE milestones_new RENAME TO milestones`);
    })();
    console.log('Table milestones reconstructed successfully.');
  }
} catch (e) {
  console.error('Failed to reconstruct milestones table:', e);
}

// FORCE FIX: quote_items table estimated_hours constraint
try {
  // Check if estimated_hours exists and is NOT NULL
  const info = sqlite.prepare("PRAGMA table_info(quote_items)").all() as any[];
  const hoursCol = info.find(c => c.name === 'estimated_hours');
  
  if (hoursCol && hoursCol.notnull === 1) {
    console.log('Detected STALE NOT NULL constraint on quote_items.estimated_hours. Reconstructing table...');
    sqlite.transaction(() => {
      // 1. Create temporary table with correct schema
      sqlite.exec(`
        CREATE TABLE quote_items_new (
          id TEXT PRIMARY KEY,
          quote_id TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
          name TEXT,
          description TEXT NOT NULL,
          quantity REAL NOT NULL DEFAULT 1,
          rate REAL NOT NULL DEFAULT 0,
          total REAL NOT NULL DEFAULT 0
        )
      `);
      // 2. Copy data (excluding estimated_hours)
      sqlite.exec(`
        INSERT INTO quote_items_new (id, quote_id, name, description, quantity, rate, total)
        SELECT id, quote_id, name, description, quantity, rate, total FROM quote_items
      `);
      // 3. Drop old table
      sqlite.exec(`DROP TABLE quote_items`);
      // 4. Rename new table
      sqlite.exec(`ALTER TABLE quote_items_new RENAME TO quote_items`);
    })();
    console.log('Table quote_items reconstructed successfully.');
  }
} catch (e) {
  console.error('Failed to reconstruct quote_items table:', e);
}

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
