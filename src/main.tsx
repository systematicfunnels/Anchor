import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { mockApi } from './lib/mockApi'

// Fallback for browser mode
if (!window.api) {
  console.info('Running in browser mode: using mock API fallback.');
  window.api = mockApi;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Use contextBridge via window.api
window.api.onMessage((message) => {
  console.log(message)
})
