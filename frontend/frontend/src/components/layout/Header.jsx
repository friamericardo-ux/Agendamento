import { useAuthStore } from '../../store/authStore'

export default function Header() {
  const usuario = useAuthStore((s) => s.usuario)

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-end">
      <div className="flex items-center gap-3">
        <span className="text-gray-700">{usuario?.nome}</span>
        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
          {usuario?.nome?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
