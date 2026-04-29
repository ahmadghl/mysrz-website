import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'

import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import Pages from './pages/Pages'
import Domains from './pages/Domains'
import NewJob from './pages/NewJob'
import Targets from './pages/Targets'
import Chat from './pages/Chat'
import Login from './pages/Login'
import { useAuthStore } from './store/auth'

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 10_000, retry: 1 } } })

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/new" element={<NewJob />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="pages" element={<Pages />} />
            <Route path="domains" element={<Domains />} />
            <Route path="targets" element={<Targets />} />
            <Route path="chat" element={<Chat />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
