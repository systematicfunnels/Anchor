import { ipcMain, app, dialog } from 'electron';
import { db, resetDatabase } from '../db';
import { clients, projects, quotes, milestones, scopeChanges, auditTrail, invoices, expenses, documents, settings, quoteItems } from '../db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

const handleIpc = (handler: (...args: any[]) => Promise<any>) => {
  return async (event: any, ...args: any[]) => {
    try {
      const result = await handler(event, ...args);
      return { success: true, data: result };
    } catch (error: any) {
      console.error('IPC Error:', error);
      return { 
        success: false, 
        error: {
          code: error.code || 'DATABASE_ERROR',
          message: error.message || 'An unexpected error occurred',
          details: error.stack
        } 
      };
    }
  };
};

export function setupIpcHandlers() {
  // Document storage directory
  const getDocsDir = () => {
    const dir = path.join(app.getPath('userData'), 'project_documents');
    return dir;
  };

  // Ensure directory exists
  const ensureDocsDir = async () => {
    const dir = getDocsDir();
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
    return dir;
  };

  // Client Handlers
  ipcMain.handle('get-clients', handleIpc(async () => {
    return db.query.clients.findMany();
  }));

  ipcMain.handle('create-client', handleIpc(async (_, clientData) => {
    const newClient = {
      ...clientData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.insert(clients).values(newClient);
    return newClient;
  }));

  ipcMain.handle('update-client', handleIpc(async (_, { id, ...data }) => {
    await db.update(clients)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clients.id, id));
    return true;
  }));

  // Quote Handlers
  ipcMain.handle('get-quotes', handleIpc(async () => {
    return db.query.quotes.findMany({
      with: {
        client: true,
        items: true
      }
    });
  }));

  ipcMain.handle('create-quote', handleIpc(async (_, { items, ...quoteData }) => {
    const quoteId = uuidv4();
    const newQuote = {
      ...quoteData,
      id: quoteId,
      version: 1,
      status: quoteData.status || 'Draft',
      createdAt: new Date(),
    };

    return db.transaction((tx) => {
      tx.insert(quotes).values(newQuote).run();
      
      if (items && items.length > 0) {
        for (const item of items) {
          tx.insert(quoteItems).values({
            ...item,
            name: item.description || '', // Satisfy NOT NULL constraint if it exists in local DB
            id: item.id || uuidv4(),
            quoteId: quoteId,
          }).run();
        }
      }
      
      return { ...newQuote, items: items || [] };
    });
  }));

  ipcMain.handle('update-quote', handleIpc(async (_, { id, items, ...data }) => {
    return db.transaction((tx) => {
      // Update quote header
      tx.update(quotes)
        .set(data)
        .where(eq(quotes.id, id))
        .run();

      // Update items: delete existing and insert new
      if (items) {
        tx.delete(quoteItems).where(eq(quoteItems.quoteId, id)).run();
        if (items.length > 0) {
          for (const item of items) {
            tx.insert(quoteItems).values({
              ...item,
              name: item.description || '', // Satisfy NOT NULL constraint if it exists in local DB
              id: item.id || uuidv4(),
              quoteId: id,
            }).run();
          }
        }
      }
      return true;
    });
  }));

  ipcMain.handle('duplicate-quote', handleIpc(async (_, quoteId) => {
    return db.transaction((tx) => {
      const quote = tx.select().from(quotes).where(eq(quotes.id, quoteId)).get();

      if (!quote) throw new Error('Quote not found');

      const items = tx.select().from(quoteItems).where(eq(quoteItems.quoteId, quoteId)).all();

      const newQuoteId = uuidv4();
      const newQuote = {
        ...quote,
        name: `${quote.name} (Copy)`,
        version: 1,
        status: 'Draft' as const,
        id: newQuoteId,
        createdAt: new Date(),
      };

      tx.insert(quotes).values(newQuote).run();

      if (items && items.length > 0) {
        for (const item of items) {
          tx.insert(quoteItems).values({
            ...item,
            name: item.description || '', // Satisfy NOT NULL constraint if it exists in local DB
            id: uuidv4(),
            quoteId: newQuoteId,
          }).run();
        }
      }

      return newQuote;
    });
  }));

  ipcMain.handle('approve-quote', handleIpc(async (_, quoteId) => {
    return db.transaction((tx) => {
      const quote = tx.select().from(quotes).where(eq(quotes.id, quoteId)).get();

      if (!quote) throw new Error('Quote not found');

      const items = tx.select().from(quoteItems).where(eq(quoteItems.quoteId, quoteId)).all();

      // Update quote status
      tx.update(quotes)
        .set({ status: 'Approved' })
        .where(eq(quotes.id, quoteId))
        .run();

      // Create project from quote
      const newProject = {
        id: uuidv4(),
        clientId: quote.clientId,
        name: quote.name || `Project for Quote ${quoteId.slice(0, 8)}`,
        type: 'Fixed' as const,
        status: 'Active' as const,
        baselineCost: quote.totalCost,
        baselinePrice: quote.totalPrice,
        baselineMargin: quote.margin,
        actualCost: 0,
        startDate: new Date(),
      };
      tx.insert(projects).values(newProject).run();

      // Clone quote items to project milestones
      if (items && items.length > 0) {
        console.log(`Cloning ${items.length} items to milestones for project ${newProject.id}`);
        for (const item of items) {
          const milestoneData = {
            id: uuidv4(),
            projectId: newProject.id,
            name: item.description || 'Unnamed Milestone',
            estimatedHours: Number(item.quantity) || 0,
            estimatedCost: Number(item.rate) || 0,
            price: Number(item.total) || 0,
            progress: 0,
            status: 'Planned' as const,
          };
          
          console.log('Inserting milestone:', milestoneData);
          tx.insert(milestones).values(milestoneData).run();
        }
      }

      // Log in audit trail
      tx.insert(auditTrail).values({
        id: uuidv4(),
        entityType: 'Quote',
        entityId: quoteId,
        action: 'Quote Approved',
        details: `Project ${newProject.id} created with ${items?.length || 0} milestones`,
        timestamp: new Date(),
      }).run();

      return newProject;
    });
  }));

  // Project Handlers
  ipcMain.handle('get-projects', handleIpc(async () => {
    return db.query.projects.findMany({
      with: {
        client: true
      }
    });
  }));

  ipcMain.handle('create-project', handleIpc(async (_, projectData) => {
    const newProject = {
      ...projectData,
      id: uuidv4(),
      startDate: new Date(),
    };
    await db.insert(projects).values(newProject);
    return newProject;
  }));

  ipcMain.handle('update-project', handleIpc(async (_, { id, ...data }) => {
    await db.update(projects)
      .set(data)
      .where(eq(projects.id, id));
    return true;
  }));

  ipcMain.handle('get-project-details', handleIpc(async (_, projectId) => {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: {
        client: true
      }
    });
    
    const projectMilestones = await db.query.milestones.findMany({
      where: eq(milestones.projectId, projectId)
    });

    const projectScopeChanges = await db.query.scopeChanges.findMany({
      where: eq(scopeChanges.projectId, projectId)
    });

    const projectDocuments = await db.query.documents.findMany({
      where: eq(documents.projectId, projectId)
    });

    const projectExpenses = await db.query.expenses.findMany({
      where: eq(expenses.projectId, projectId)
    });

    return { 
      ...project, 
      milestones: projectMilestones, 
      scopeChanges: projectScopeChanges,
      documents: projectDocuments,
      expenses: projectExpenses
    };
  }));

  // Document Handlers
  ipcMain.handle('get-documents', handleIpc(async (_, projectId) => {
    return db.query.documents.findMany({
      where: eq(documents.projectId, projectId),
      orderBy: (documents, { desc }) => [desc(documents.createdAt)]
    });
  }));

  ipcMain.handle('upload-document', handleIpc(async (_, { projectId, name, type, size, buffer }) => {
    await ensureDocsDir();
    const id = uuidv4();
    const fileExtension = path.extname(name);
    const fileName = `${id}${fileExtension}`;
    const filePath = path.join(getDocsDir(), fileName);

    await fs.writeFile(filePath, Buffer.from(buffer));

    const newDoc = {
      id,
      projectId,
      name,
      type,
      size,
      path: filePath,
      createdAt: new Date(),
    };

    await db.insert(documents).values(newDoc);
    return newDoc;
  }));

  ipcMain.handle('download-document', handleIpc(async (_, documentId) => {
    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, documentId)
    });

    if (!doc) throw new Error('Document not found');

    const { filePath, canceled } = await dialog.showSaveDialog({
      defaultPath: doc.name,
      title: 'Download Document'
    });

    if (canceled || !filePath) return false;

    await fs.copyFile(doc.path, filePath);
    return true;
  }));

  ipcMain.handle('delete-document', handleIpc(async (_, documentId) => {
    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, documentId)
    });

    if (doc) {
      try {
        await fs.unlink(doc.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
      await db.delete(documents).where(eq(documents.id, documentId));
    }
    return true;
  }));

  // Milestone Handlers
  ipcMain.handle('update-milestone', handleIpc(async (_, { id, ...data }) => {
    await db.update(milestones)
      .set(data)
      .where(eq(milestones.id, id));
    return true;
  }));

  ipcMain.handle('delete-milestone', handleIpc(async (_, id) => {
    await db.delete(milestones).where(eq(milestones.id, id));
    return true;
  }));

  // Scope Change Handlers
  ipcMain.handle('create-scope-change', handleIpc(async (_, scopeData) => {
    const newScopeChange = {
      ...scopeData,
      id: uuidv4(),
      status: 'Pending',
      createdAt: new Date(),
    };
    await db.insert(scopeChanges).values(newScopeChange);
    
    // Log in audit trail
    await db.insert(auditTrail).values({
      id: uuidv4(),
      entityType: 'Project',
      entityId: scopeData.projectId,
      action: 'Scope Change Created',
      details: JSON.stringify(newScopeChange),
      timestamp: new Date(),
    });

    return newScopeChange;
  }));

  ipcMain.handle('approve-scope-change', handleIpc(async (_, scopeChangeId) => {
    return db.transaction((tx) => {
      const scopeChange = tx.select().from(scopeChanges).where(eq(scopeChanges.id, scopeChangeId)).get();

      if (!scopeChange) throw new Error('Scope change not found');

      tx.update(scopeChanges)
        .set({ status: 'Approved' })
        .where(eq(scopeChanges.id, scopeChangeId))
        .run();

      // Update project actuals/baseline based on approval
      const project = tx.select().from(projects).where(eq(projects.id, scopeChange.projectId)).get();

      if (project) {
        const newBaselineCost = project.baselineCost + scopeChange.costImpact;
        const newBaselinePrice = project.baselinePrice + scopeChange.priceImpact;
        const newMargin = newBaselinePrice > 0 
          ? ((newBaselinePrice - newBaselineCost) / newBaselinePrice) * 100 
          : 0;

        tx.update(projects)
          .set({
            baselineCost: newBaselineCost,
            baselinePrice: newBaselinePrice,
            baselineMargin: newMargin
          })
          .where(eq(projects.id, project.id))
          .run();

        // Log in audit trail
        tx.insert(auditTrail).values({
          id: uuidv4(),
          entityType: 'Project',
          entityId: project.id,
          action: 'Scope Change Approved',
          details: `Impact: Cost +${scopeChange.costImpact}, Price +${scopeChange.priceImpact}`,
          timestamp: new Date(),
        }).run();
      }

      return true;
    });
  }));

  // Invoice Handlers
  ipcMain.handle('get-invoices', handleIpc(async () => {
    return db.query.invoices.findMany({
      with: {
        client: true,
        project: true
      }
    });
  }));

  ipcMain.handle('update-invoice', handleIpc(async (_, { id, ...data }) => {
    await db.update(invoices)
      .set(data)
      .where(eq(invoices.id, id));
    return true;
  }));

  ipcMain.handle('mark-invoice-paid', handleIpc(async (_, invoiceId) => {
    await db.update(invoices)
      .set({ status: 'Paid' })
      .where(eq(invoices.id, invoiceId));
    
    // Log in audit trail
    await db.insert(auditTrail).values({
      id: uuidv4(),
      entityType: 'Invoice',
      entityId: invoiceId,
      action: 'Invoice Paid',
      timestamp: new Date(),
    });

    return true;
  }));

  // Delete Handlers
  ipcMain.handle('delete-client', handleIpc(async (_, id) => {
    // Leverage database CASCADE constraints defined in schema.ts
    await db.delete(clients).where(eq(clients.id, id));
    return true;
  }));

  ipcMain.handle('delete-quote', handleIpc(async (_, id) => {
    await db.delete(quotes).where(eq(quotes.id, id));
    return true;
  }));

  ipcMain.handle('delete-project', handleIpc(async (_, id) => {
    // 1. Get all documents for this project
    const projectDocs = await db.query.documents.findMany({
      where: eq(documents.projectId, id)
    });

    // 2. Delete physical files
    for (const doc of projectDocs) {
      try {
        await fs.unlink(doc.path);
      } catch (err) {
        console.error(`Error deleting file for project ${id}:`, err);
      }
    }

    // 3. Delete database records (Cascades to documents, milestones, etc.)
    await db.delete(projects).where(eq(projects.id, id));
    return true;
  }));

  ipcMain.handle('delete-invoice', handleIpc(async (_, id) => {
    await db.delete(invoices).where(eq(invoices.id, id));
    return true;
  }));

  // Expense Handlers
  ipcMain.handle('get-expenses', handleIpc(async (_, projectId) => {
    if (projectId) {
      return db.query.expenses.findMany({
        where: eq(expenses.projectId, projectId),
        orderBy: (expenses, { desc }) => [desc(expenses.date)]
      });
    }
    return db.query.expenses.findMany({
      orderBy: (expenses, { desc }) => [desc(expenses.date)]
    });
  }));

  ipcMain.handle('add-expense', handleIpc(async (_, expenseData) => {
    return db.transaction((tx) => {
      const newExpense = {
        ...expenseData,
        id: uuidv4(),
        date: new Date(expenseData.date || Date.now()),
        createdAt: new Date(),
      };
      tx.insert(expenses).values(newExpense).run();

      // Update project actual cost
      const project = tx.select().from(projects).where(eq(projects.id, expenseData.projectId)).get();

      if (project) {
        tx.update(projects)
          .set({ actualCost: project.actualCost + expenseData.amount })
          .where(eq(projects.id, project.id))
          .run();
      }

      return newExpense;
    });
  }));

  ipcMain.handle('delete-expense', handleIpc(async (_, id) => {
    return db.transaction((tx) => {
      const expense = tx.select().from(expenses).where(eq(expenses.id, id)).get();

      if (expense) {
        const project = tx.select().from(projects).where(eq(projects.id, expense.projectId)).get();

        if (project) {
          tx.update(projects)
            .set({ actualCost: Math.max(0, project.actualCost - expense.amount) })
            .where(eq(projects.id, project.id))
            .run();
        }

        tx.delete(expenses).where(eq(expenses.id, id)).run();
      }
      return true;
    });
  }));

  ipcMain.handle('delete-scope-change', handleIpc(async (_, id) => {
    await db.delete(scopeChanges).where(eq(scopeChanges.id, id));
    return true;
  }));

  ipcMain.handle('generate-invoice', handleIpc(async (_, projectId, milestoneIds) => {
    return db.transaction((tx) => {
      const project = tx.select().from(projects).where(eq(projects.id, projectId)).get();

      if (!project) throw new Error('Project not found');

      const client = tx.select().from(clients).where(eq(clients.id, project.clientId)).get();
      const projectMilestones = tx.select().from(milestones).where(eq(milestones.projectId, projectId)).all();

      // Get settings
      const allSettings = tx.select().from(settings).all();
      const settingsMap = allSettings.reduce((acc: any, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});

      let subtotal = 0;
      if (milestoneIds && milestoneIds.length > 0) {
        const selectedMilestones = projectMilestones.filter((m) => milestoneIds.includes(m.id));
        subtotal = selectedMilestones.reduce((sum, m) => sum + m.price, 0);
      } else {
        subtotal = project.baselinePrice;
      }

      const taxRate = client?.taxRate || parseFloat(settingsMap.taxRate || '0');
      const tax = subtotal * (taxRate / 100);
      const total = subtotal + tax;

      const prefix = settingsMap.invoicePrefix || 'INV-';
      const nextNum = parseInt(settingsMap.invoiceNextNumber || '1001');
      const invoiceNumber = `${prefix}${nextNum}`;

      // Update next number in settings
      tx.insert(settings)
        .values({ id: uuidv4(), key: 'invoiceNextNumber', value: (nextNum + 1).toString(), updatedAt: new Date() })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: (nextNum + 1).toString(), updatedAt: new Date() }
        }).run();

      const paymentTerms = parseInt(settingsMap.paymentTerms || '30');
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + paymentTerms);

      const invoiceId = uuidv4();

      const newInvoice = {
        id: invoiceId,
        invoiceNumber,
        clientId: project.clientId,
        projectId: project.id,
        status: 'Draft' as const,
        issueDate: new Date(),
        dueDate: dueDate,
        subtotal,
        tax,
        total,
      };

      tx.insert(invoices).values(newInvoice).run();
      return newInvoice;
    });
  }));

  ipcMain.handle('create-manual-invoice', handleIpc(async (_, invoiceData) => {
    return db.transaction((tx) => {
      // Get settings
      const allSettings = tx.select().from(settings).all();
      const settingsMap = allSettings.reduce((acc: any, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});

      const subtotal = invoiceData.subtotal;
      const taxRate = invoiceData.taxRate || parseFloat(settingsMap.taxRate || '0');
      const tax = subtotal * (taxRate / 100);
      const total = subtotal + tax;

      const prefix = settingsMap.invoicePrefix || 'INV-';
      const nextNum = parseInt(settingsMap.invoiceNextNumber || '1001');
      const invoiceNumber = `${prefix}${nextNum}`;

      // Update next number in settings
      tx.insert(settings)
        .values({ id: uuidv4(), key: 'invoiceNextNumber', value: (nextNum + 1).toString(), updatedAt: new Date() })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: (nextNum + 1).toString(), updatedAt: new Date() }
        }).run();

      const paymentTerms = parseInt(settingsMap.paymentTerms || '30');
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + paymentTerms);

      const invoiceId = uuidv4();

      const newInvoice = {
        id: invoiceId,
        invoiceNumber,
        clientId: invoiceData.clientId,
        projectId: invoiceData.projectId || null,
        status: 'Draft' as const,
        issueDate: new Date(),
        dueDate: dueDate,
        subtotal,
        tax,
        total,
      };

      tx.insert(invoices).values(newInvoice).run();
      return newInvoice;
    });
  }));

  // System Handlers
  ipcMain.handle('get-settings', handleIpc(async () => {
    const allSettings = await db.select().from(settings);
    return allSettings.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
  }));

  ipcMain.handle('update-settings', handleIpc(async (_, key, value) => {
    const id = uuidv4();
    await db.insert(settings)
      .values({ id, key, value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() }
      });
    return true;
  }));

  ipcMain.handle('reset-database', handleIpc(async () => {
    resetDatabase();
    return true;
  }));

  ipcMain.handle('get-audit-trail', handleIpc(async () => {
    return db.query.auditTrail.findMany({
      orderBy: (audit, { desc }) => [desc(audit.timestamp)],
      limit: 50
    });
  }));

  ipcMain.handle('export-database', handleIpc(async () => {
    const isDev = !app.isPackaged;
    const dbPath = isDev 
      ? path.join(process.cwd(), 'serviceops.db')
      : path.join(app.getPath('userData'), 'serviceops.db');

    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Export Database Backup',
      defaultPath: `anchor_backup_${new Date().toISOString().split('T')[0]}.db`,
      filters: [{ name: 'SQLite Database', extensions: ['db'] }]
    });

    if (canceled || !filePath) return false;

    await fs.copyFile(dbPath, filePath);
    return true;
  }));
}
