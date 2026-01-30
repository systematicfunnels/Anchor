import { ipcRenderer, contextBridge } from 'electron'
import { Client, Quote, Milestone, ScopeChange, Invoice } from '../src/types'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('api', {
  // Client APIs
  getClients: () => ipcRenderer.invoke('get-clients'),
  createClient: (clientData: Partial<Client>) => ipcRenderer.invoke('create-client', clientData),
  updateClient: (clientData: Partial<Client> & { id: string }) => ipcRenderer.invoke('update-client', clientData),
  
  // Project APIs
  getProjects: () => ipcRenderer.invoke('get-projects'),
  getProjectDetails: (projectId: string) => ipcRenderer.invoke('get-project-details', projectId),
  createProject: (projectData: any) => ipcRenderer.invoke('create-project', projectData),
  updateProject: (projectData: any) => ipcRenderer.invoke('update-project', projectData),
  updateMilestone: (milestoneData: Partial<Milestone> & { id: string }) => ipcRenderer.invoke('update-milestone', milestoneData),
  deleteMilestone: (id: string) => ipcRenderer.invoke('delete-milestone', id),
  createScopeChange: (scopeData: Partial<ScopeChange>) => ipcRenderer.invoke('create-scope-change', scopeData),
  approveScopeChange: (scopeChangeId: string) => ipcRenderer.invoke('approve-scope-change', scopeChangeId),
  deleteScopeChange: (id: string) => ipcRenderer.invoke('delete-scope-change', id),
  
  // Document APIs
  getDocuments: (projectId: string) => ipcRenderer.invoke('get-documents', projectId),
  uploadDocument: (projectId: string, name: string, type: string, size: number, buffer: ArrayBuffer) => 
    ipcRenderer.invoke('upload-document', { projectId, name, type, size, buffer }),
  downloadDocument: (documentId: string) => ipcRenderer.invoke('download-document', documentId),
  deleteDocument: (documentId: string) => ipcRenderer.invoke('delete-document', documentId),
  
  // Expense APIs
  getExpenses: (projectId: string) => ipcRenderer.invoke('get-expenses', projectId),
  addExpense: (expenseData: any) => ipcRenderer.invoke('add-expense', expenseData),
  deleteExpense: (id: string) => ipcRenderer.invoke('delete-expense', id),
  
  // Quote APIs
  getQuotes: () => ipcRenderer.invoke('get-quotes'),
  createQuote: (quoteData: Partial<Quote>) => ipcRenderer.invoke('create-quote', quoteData),
  updateQuote: (quoteData: Partial<Quote> & { id: string }) => ipcRenderer.invoke('update-quote', quoteData),
  duplicateQuote: (quoteId: string) => ipcRenderer.invoke('duplicate-quote', quoteId),
  approveQuote: (quoteId: string) => ipcRenderer.invoke('approve-quote', quoteId),
  
  // Invoice APIs
  getInvoices: () => ipcRenderer.invoke('get-invoices'),
  updateInvoice: (invoiceData: Partial<Invoice> & { id: string }) => ipcRenderer.invoke('update-invoice', invoiceData),
  markInvoicePaid: (invoiceId: string) => ipcRenderer.invoke('mark-invoice-paid', invoiceId),
  generateInvoice: (projectId: string, milestoneIds?: string[]) => ipcRenderer.invoke('generate-invoice', projectId, milestoneIds),
  createManualInvoice: (invoiceData: any) => ipcRenderer.invoke('create-manual-invoice', invoiceData),
  
  // Delete APIs
  deleteClient: (id: string) => ipcRenderer.invoke('delete-client', id),
  deleteQuote: (id: string) => ipcRenderer.invoke('delete-quote', id),
  deleteProject: (id: string) => ipcRenderer.invoke('delete-project', id),
  deleteInvoice: (id: string) => ipcRenderer.invoke('delete-invoice', id),
  
  // System
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (key: string, value: string) => ipcRenderer.invoke('update-settings', key, value),
  resetDatabase: () => ipcRenderer.invoke('reset-database'),
  exportDatabase: () => ipcRenderer.invoke('export-database'),
  getAuditTrail: () => ipcRenderer.invoke('get-audit-trail'),
  onMessage: (callback: (message: string) => void) => {
    const subscription = (_event: any, value: string) => callback(value);
    ipcRenderer.on('main-process-message', subscription);
    return () => ipcRenderer.removeListener('main-process-message', subscription);
  },
})
