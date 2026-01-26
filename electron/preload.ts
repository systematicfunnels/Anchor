import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('api', {
  // Client APIs
  getClients: () => ipcRenderer.invoke('get-clients'),
  createClient: (clientData: any) => ipcRenderer.invoke('create-client', clientData),
  updateClient: (clientData: any) => ipcRenderer.invoke('update-client', clientData),
  
  // Project APIs
  getProjects: () => ipcRenderer.invoke('get-projects'),
  getProjectDetails: (projectId: string) => ipcRenderer.invoke('get-project-details', projectId),
  updateMilestone: (milestoneData: any) => ipcRenderer.invoke('update-milestone', milestoneData),
  createScopeChange: (scopeData: any) => ipcRenderer.invoke('create-scope-change', scopeData),
  approveScopeChange: (scopeChangeId: string) => ipcRenderer.invoke('approve-scope-change', scopeChangeId),
  
  // Quote APIs
  getQuotes: () => ipcRenderer.invoke('get-quotes'),
  createQuote: (quoteData: any) => ipcRenderer.invoke('create-quote', quoteData),
  approveQuote: (quoteId: string) => ipcRenderer.invoke('approve-quote', quoteId),
  
  // Invoice APIs
  getInvoices: () => ipcRenderer.invoke('get-invoices'),
  markInvoicePaid: (invoiceId: string) => ipcRenderer.invoke('mark-invoice-paid', invoiceId),
  
  // System
  onMessage: (callback: (message: string) => void) => 
    ipcRenderer.on('main-process-message', (_event, value) => callback(value)),
})
