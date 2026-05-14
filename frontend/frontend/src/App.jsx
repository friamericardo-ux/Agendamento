import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import LoginPage from './features/auth/LoginPage'
import DashboardPage from './features/dashboard/DashboardPage'
import AgendamentosPage from './features/agendamentos/AgendamentosPage'
import ClientesPage from './features/clientes/ClientesPage'
import ProfissionaisPage from './features/profissionais/ProfissionaisPage'
import ServicosPage from './features/servicos/ServicosPage'
import SettingsPage from './features/settings/SettingsPage'
import AppShell from './components/layout/AppShell'

function RotaProtegida({ children }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <AppShell>{children}</AppShell>
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RotaProtegida><DashboardPage /></RotaProtegida>} />
        <Route path="/agendamentos" element={<RotaProtegida><AgendamentosPage /></RotaProtegida>} />
        <Route path="/clientes" element={<RotaProtegida><ClientesPage /></RotaProtegida>} />
        <Route path="/profissionais" element={<RotaProtegida><ProfissionaisPage /></RotaProtegida>} />
        <Route path="/servicos" element={<RotaProtegida><ServicosPage /></RotaProtegida>} />
        <Route path="/configuracoes" element={<RotaProtegida><SettingsPage /></RotaProtegida>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
