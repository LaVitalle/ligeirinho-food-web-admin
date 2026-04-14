import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PrivateRoute } from './components/auth/PrivateRoute'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './pages/Login/LoginPage'
import { Dashboard } from './pages/Dashboard'
import { Institutions } from './pages/Institutions'
import { Pedidos } from './pages/Pedidos'
import { Unauthorized } from './pages/Unauthorized'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        gutter={12}
        containerClassName="!font-sans"
        toastOptions={{
          style: {
            borderRadius: '0.75rem',
            boxShadow:
              '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)',
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          },
          success: {
            duration: 3000,
            style: {
              background: '#f0fdf4',
              color: '#14532d',
              border: '1px solid #bbf7d0',
            },
            iconTheme: {
              primary: '#22c55e',
              secondary: '#f0fdf4',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#fef2f2',
              color: '#7f1d1d',
              border: '1px solid #fecaca',
            },
            iconTheme: {
              primary: '#ea1d2c',
              secondary: '#fef2f2',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="instituicoes" element={<Institutions />} />
            <Route path="pedidos" element={<Pedidos />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
