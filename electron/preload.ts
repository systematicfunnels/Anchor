import { ipcRenderer, contextBridge } from 'electron'
import { Client, Quote, Milestone, ScopeChange } from '../src/types'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('api', {
  // Client APIs
  getClients: () => ipcRenderer.invoke('get-clients'),
  createClient: (clientData: Partial<Client>) => ipcRenderer.invoke('create-client', clientData),
  updateClient: (clientData: Partial<Client> & { id: string }) => ipcRenderer.invoke('update-client', clientData),
  
  // Project APIs
  getProjects: () => ipcRenderer.invoke('get-projects'),
  getProjectDetails: (projectId: string) => ipcRenderer.invoke('get-project-details', projectId),
  updateMilestone: (milestoneData: Partial<Milestone> & { id: string }) => ipcRenderer.invoke('update-milestone', milestoneData),
  deleteMilestone: (id: string) => ipcRenderer.invoke('delete-milestone', id),
  createScopeChange: (scopeData: Partial<ScopeChange>) => ipcRenderer.invoke('create-scope-change', scopeData),
  approveScopeChange: (scopeChangeId: string) => ipcRenderer.invoke('approve-scope-change', scopeChangeId),
  deleteScopeChange: (id: string) => ipcRenderer.invoke('delete-scope-change', id),
  
  // Quote APIs
  getQuotes: () => ipcRenderer.invoke('get-quotes'),
  createQuote: (quoteData: Partial<Quote>) => ipcRenderer.invoke('create-quote', quoteData),
  approveQuote: (quoteId: string) => ipcRenderer.invoke('approve-quote', quoteId),
  
  // Invoice APIs
  getInvoices: () => ipcRenderer.invoke('get-invoices'),
  markInvoicePaid: (invoiceId: string) => ipcRenderer.invoke('mark-invoice-paid', invoiceId),
  
  // Delete APIs
  deleteClient: (id: string) => ipcRenderer.invoke('delete-client', id),
  deleteQuote: (id: string) => ipcRenderer.invoke('delete-quote', id),
  deleteProject: (id: string) => ipcRenderer.invoke('delete-project', id),
  deleteInvoice: (id: string) => ipcRenderer.invoke('delete-invoice', id),
  
  // System
  resetDatabase: () => ipcRenderer.invoke('reset-database'),
  onMessage: (callback: (message: string) => void) => {
    const subscription = (_event: any, value: string) => callback(value);
    ipcRenderer.on('main-process-message', subscription);
    return () => ipcRenderer.removeListener('main-process-message', subscription);
  },
})
