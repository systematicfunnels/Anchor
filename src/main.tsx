import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { browserApi } from './lib/browserApi'

// Fallback for browser mode (previews, development)
if (!window.api) {
  console.info('Running in browser mode: using clean in-memory API fallback.');
  window.api = browserApi;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Use contextBridge via window.api
if (window.api) {
  window.api.onMessage((message) => {
    console.log(message)
  })
}
