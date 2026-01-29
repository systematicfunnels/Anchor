import { ipcMain, app, dialog } from 'electron';
import { db, resetDatabase } from '../db';
import { clients, projects, quotes, milestones, scopeChanges, auditTrail, invoices, expenses, documents, settings, quoteItems } from '../db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { AppError } from '../../src/types';

const handleIpc = (handler: (...args: any[]) => Promise<any>) => {
  return async (event: any, ...args: any[]) => {
    try {
      return await handler(event, ...args);
    } catch (error: any) {
      console.error('IPC Error:', error);
      const appError: AppError = {
        __isAppError: true,
        code: error.code || 'DATABASE_ERROR',
        message: error.message || 'An unexpected error occurred',
        details: error.stack
      };
      return appError;
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
        client: true
      }
    });
  }));

  ipcMain.handle('create-quote', handleIpc(async (_, quoteData) => {
    const newQuote = {
      ...quoteData,
      id: uuidv4(),
      version: 1,
      status: 'Draft',
      createdAt: new Date(),
    };
    await db.insert(quotes).values(newQuote);
    return newQuote;
  }));

  ipcMain.handle('duplicate-quote', handleIpc(async (_, quoteId) => {
    return await db.transaction(async (tx) => {
      const quote = await tx.query.quotes.findFirst({
        where: eq(quotes.id, quoteId),
        with: {
          items: true
        }
      });

      if (!quote) throw new Error('Quote not found');

      const newQuoteId = uuidv4();
      const newQuote = {
        clientId: quote.clientId,
        name: `${quote.name} (Copy)`,
        version: 1,
        status: 'Draft' as const,
        totalCost: quote.totalCost,
        totalPrice: quote.totalPrice,
        margin: quote.margin,
        validUntil: quote.validUntil,
        id: newQuoteId,
        createdAt: new Date(),
      };

      await tx.insert(quotes).values(newQuote);

      if (quote.items && quote.items.length > 0) {
        for (const item of quote.items) {
          await tx.insert(quoteItems).values({
            id: uuidv4(),
            quoteId: newQuoteId,
            name: item.name,
            description: item.description,
            estimatedHours: item.estimatedHours,
            estimatedCost: item.estimatedCost,
            price: item.price,
          });
        }
      }

      return newQuote;
    });
  }));

  ipcMain.handle('approve-quote', handleIpc(async (_, quoteId) => {
    return await db.transaction(async (tx) => {
      const quote = await tx.query.quotes.findFirst({
        where: eq(quotes.id, quoteId),
        with: {
          items: true
        }
      });

      if (!quote) throw new Error('Quote not found');

      // Update quote status
      await tx.update(quotes)
        .set({ status: 'Approved' })
        .where(eq(quotes.id, quoteId));

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
      await tx.insert(projects).values(newProject);

      // Clone quote items to project milestones
      if (quote.items && quote.items.length > 0) {
        const newMilestones = quote.items.map(item => ({
          id: uuidv4(),
          projectId: newProject.id,
          name: item.name,
          estimatedHours: item.estimatedHours,
          estimatedCost: item.estimatedCost,
          price: item.price,
          progress: 0,
          status: 'Planned' as const,
        }));
        
        for (const milestone of newMilestones) {
          await tx.insert(milestones).values(milestone);
        }
      }

      // Log in audit trail
      await tx.insert(auditTrail).values({
        id: uuidv4(),
        entityType: 'Quote',
        entityId: quoteId,
        action: 'Quote Approved',
        details: `Project ${newProject.id} created with ${quote.items?.length || 0} milestones`,
        timestamp: new Date(),
      });

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
      const scopeChange = tx.query.scopeChanges.findFirst({
        where: eq(scopeChanges.id, scopeChangeId)
      }).sync();

      if (!scopeChange) throw new Error('Scope change not found');

      tx.update(scopeChanges)
        .set({ status: 'Approved' })
        .where(eq(scopeChanges.id, scopeChangeId))
        .run();

      // Update project actuals/baseline based on approval
      const project = tx.query.projects.findFirst({
        where: eq(projects.id, scopeChange.projectId)
      }).sync();

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
      const project = tx.query.projects.findFirst({
        where: eq(projects.id, expenseData.projectId)
      }).sync();

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
      const expense = tx.query.expenses.findFirst({
        where: eq(expenses.id, id)
      }).sync();

      if (expense) {
        const project = tx.query.projects.findFirst({
          where: eq(projects.id, expense.projectId)
        }).sync();

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
      const project = tx.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: {
          client: true,
          milestones: true,
        }
      }).sync();

      if (!project) throw new Error('Project not found');

      // Get settings
      const allSettings = tx.select().from(settings).all();
      const settingsMap = allSettings.reduce((acc: any, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});

      let subtotal = 0;
      if (milestoneIds && milestoneIds.length > 0) {
        const selectedMilestones = project.milestones.filter(m => milestoneIds.includes(m.id));
        subtotal = selectedMilestones.reduce((sum, m) => sum + m.price, 0);
      } else {
        subtotal = project.baselinePrice;
      }

      const taxRate = project.client?.taxRate || parseFloat(settingsMap.taxRate || '0');
      const tax = subtotal * (taxRate / 100);
      const total = subtotal + tax;

      const prefix = settingsMap.invoicePrefix || 'INV-';
      const nextNum = parseInt(settingsMap.invoiceNextNumber || '1001');
      const invoiceNumber = `${prefix}${nextNum}`;

      // Update next number in settings
      const settingId = uuidv4();
      tx.insert(settings)
        .values({ id: settingId, key: 'invoiceNextNumber', value: (nextNum + 1).toString(), updatedAt: new Date() })
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
}
