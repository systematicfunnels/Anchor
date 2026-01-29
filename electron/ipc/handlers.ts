import { ipcMain } from 'electron';
import { db, resetDatabase } from '../db';
import { clients, projects, quotes, milestones, scopeChanges, auditTrail, invoices } from '../db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export function setupIpcHandlers() {
  // Client Handlers
  ipcMain.handle('get-clients', async () => {
    return db.query.clients.findMany();
  });

  ipcMain.handle('create-client', async (_, clientData) => {
    const newClient = {
      ...clientData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.insert(clients).values(newClient);
    return newClient;
  });

  ipcMain.handle('update-client', async (_, { id, ...data }) => {
    await db.update(clients)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clients.id, id));
    return true;
  });

  // Quote Handlers
  ipcMain.handle('get-quotes', async () => {
    return db.query.quotes.findMany({
      with: {
        client: true
      }
    });
  });

  ipcMain.handle('create-quote', async (_, quoteData) => {
    const newQuote = {
      ...quoteData,
      id: uuidv4(),
      version: 1,
      status: 'Draft',
      createdAt: new Date(),
    };
    await db.insert(quotes).values(newQuote);
    return newQuote;
  });

  ipcMain.handle('approve-quote', async (_, quoteId) => {
    const quote = await db.query.quotes.findFirst({
      where: eq(quotes.id, quoteId)
    });

    if (!quote) throw new Error('Quote not found');

    // Update quote status
    await db.update(quotes)
      .set({ status: 'Approved' })
      .where(eq(quotes.id, quoteId));

    // Create project from quote
    const newProject = {
      id: uuidv4(),
      clientId: quote.clientId,
      name: `Project for Quote ${quoteId.slice(0, 8)}`,
      type: 'Fixed' as const,
      status: 'Active' as const,
      baselineCost: quote.totalCost,
      baselinePrice: quote.totalPrice,
      baselineMargin: quote.margin,
      actualCost: 0,
      startDate: new Date(),
    };
    await db.insert(projects).values(newProject);

    // Log in audit trail
    await db.insert(auditTrail).values({
      id: uuidv4(),
      entityType: 'Quote',
      entityId: quoteId,
      action: 'Quote Approved',
      details: `Project ${newProject.id} created`,
      timestamp: new Date(),
    });

    return newProject;
  });

  // Project Handlers
  ipcMain.handle('get-projects', async () => {
    return db.query.projects.findMany({
      with: {
        client: true
      }
    });
  });

  ipcMain.handle('get-project-details', async (_, projectId) => {
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

    return { ...project, milestones: projectMilestones, scopeChanges: projectScopeChanges };
  });

  // Milestone Handlers
  ipcMain.handle('update-milestone', async (_, { id, ...data }) => {
    await db.update(milestones)
      .set(data)
      .where(eq(milestones.id, id));
    return true;
  });

  ipcMain.handle('delete-milestone', async (_, id) => {
    await db.delete(milestones).where(eq(milestones.id, id));
    return true;
  });

  // Scope Change Handlers
  ipcMain.handle('create-scope-change', async (_, scopeData) => {
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
  });

  ipcMain.handle('approve-scope-change', async (_, scopeChangeId) => {
    const scopeChange = await db.query.scopeChanges.findFirst({
      where: eq(scopeChanges.id, scopeChangeId)
    });

    if (!scopeChange) throw new Error('Scope change not found');

    await db.update(scopeChanges)
      .set({ status: 'Approved' })
      .where(eq(scopeChanges.id, scopeChangeId));

    // Update project actuals/baseline based on approval
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, scopeChange.projectId)
    });

    if (project) {
      const newBaselineCost = project.baselineCost + scopeChange.costImpact;
      const newBaselinePrice = project.baselinePrice + scopeChange.priceImpact;
      const newMargin = newBaselinePrice > 0 
        ? ((newBaselinePrice - newBaselineCost) / newBaselinePrice) * 100 
        : 0;

      await db.update(projects)
        .set({
          baselineCost: newBaselineCost,
          baselinePrice: newBaselinePrice,
          baselineMargin: newMargin
        })
        .where(eq(projects.id, project.id));

      // Log in audit trail
      await db.insert(auditTrail).values({
        id: uuidv4(),
        entityType: 'Project',
        entityId: project.id,
        action: 'Scope Change Approved',
        details: `Impact: Cost +${scopeChange.costImpact}, Price +${scopeChange.priceImpact}`,
        timestamp: new Date(),
      });
    }

    return true;
  });

  // Invoice Handlers
  ipcMain.handle('get-invoices', async () => {
    return db.query.invoices.findMany({
      with: {
        client: true,
        project: true
      }
    });
  });

  ipcMain.handle('mark-invoice-paid', async (_, invoiceId) => {
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
  });

  // Delete Handlers
  ipcMain.handle('delete-client', async (_, id) => {
    // Leverage database CASCADE constraints defined in schema.ts
    await db.delete(clients).where(eq(clients.id, id));
    return true;
  });

  ipcMain.handle('delete-quote', async (_, id) => {
    await db.delete(quotes).where(eq(quotes.id, id));
    return true;
  });

  ipcMain.handle('delete-project', async (_, id) => {
    // Leverage database CASCADE and SET NULL constraints defined in schema.ts
    await db.delete(projects).where(eq(projects.id, id));
    return true;
  });

  ipcMain.handle('delete-invoice', async (_, id) => {
    await db.delete(invoices).where(eq(invoices.id, id));
    return true;
  });

  ipcMain.handle('delete-scope-change', async (_, id) => {
    await db.delete(scopeChanges).where(eq(scopeChanges.id, id));
    return true;
  });

  // System Handlers
  ipcMain.handle('reset-database', async () => {
    resetDatabase();
    return true;
  });
}
