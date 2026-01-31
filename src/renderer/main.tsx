// src/renderer/main.tsx
// React application entry point

import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ScriptPage from './pages/ScriptPage'
import './styles/tailwind.css'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/script/:id" element={<ScriptPage />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
)
