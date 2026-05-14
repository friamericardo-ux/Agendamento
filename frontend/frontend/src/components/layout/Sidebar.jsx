import { NavLink } from 'react-router-dom'
import { LayoutDashboard, LogOut, Calendar, Users, Briefcase, Scissors, Settings } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/agendamentos', icon: Calendar, label: 'Agendamentos' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/profissionais', icon: Briefcase, label: 'Profissionais' },
  { to: '/servicos', icon: Scissors, label: 'Serviços' },
  { to: '/configuracoes', icon: Settings, label: 'Configurações' },
]

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout)
  const empresaNome = useAuthStore((s) => s.empresaNome)

  return (
    <aside className="w-64 bg-indigo-800 text-white flex flex-col">
      <div className="p-4 font-bold text-xl border-b border-indigo-700">
        {empresaNome}
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                isActive ? 'bg-indigo-600 text-white' : 'text-indigo-200 hover:bg-indigo-700'
              }`
            }
          >
            <link.icon size={20} />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-indigo-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full text-indigo-200 hover:bg-indigo-700 rounded-lg transition"
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
  )
}
