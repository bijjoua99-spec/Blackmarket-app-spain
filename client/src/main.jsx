import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import Terminos from './pages/Terminos'
import './styles.css'

function Router() {
  const path = window.location.pathname;
  if (path === '/terminos') {
    return <Terminos />;
  }
  return <App />;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
)
