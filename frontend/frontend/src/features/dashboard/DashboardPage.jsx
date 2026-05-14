import { useEffect, useState } from 'react'
import { agendamentoService } from '../../services/agendamentoService'
import { Calendar, CheckCircle, Clock, XCircle, User } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, confirmados: 0, pendentes: 0, cancelados: 0 })
  const [proximos, setProximos] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const agendamentos = await agendamentoService.listar()
        
        // Stats
        const total = agendamentos.length
        const confirmados = agendamentos.filter(a => a.status === 'confirmado' || a.status === 'concluido').length
        const pendentes = agendamentos.filter(a => a.status === 'pendente' || a.status === 'agendado').length
        const cancelados = agendamentos.filter(a => a.status === 'cancelado').length
        setStats({ total, confirmados, pendentes, cancelados })

        // Próximos do dia
        const hoje = new Date()
        const agendamentosHoje = agendamentos
          .filter(a => isSameDay(parseISO(a.data_hora), hoje) && a.status !== 'cancelado')
          .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora))
        setProximos(agendamentosHoje)

        // Dados do gráfico (últimos 7 dias)
        const inicioSemana = startOfWeek(hoje, { weekStartsOn: 1 })
        const dataSemanal = Array.from({ length: 7 }).map((_, i) => {
          const dia = addDays(inicioSemana, i)
          const count = agendamentos.filter(a => isSameDay(parseISO(a.data_hora), dia)).length
          return {
            name: format(dia, 'EEE', { locale: ptBR }),
            count
          }
        })
        setChartData(dataSemanal)

      } catch (err) {
        console.error('Erro ao buscar dados do dashboard', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const cards = [
    { title: 'Total', value: stats.total, icon: Calendar, color: 'bg-blue-500' },
    { title: 'Confirmados', value: stats.confirmados, icon: CheckCircle, color: 'bg-green-500' },
    { title: 'Pendentes', value: stats.pendentes, icon: Clock, color: 'bg-yellow-500' },
    { title: 'Cancelados', value: stats.cancelados, icon: XCircle, color: 'bg-red-500' },
  ]

  if (loading) return <div className="flex items-center justify-center h-full text-indigo-600 font-medium">Carregando...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Painel de Controle</h1>
        <p className="text-gray-500">Bem-vindo ao seu sistema de agendamentos</p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition cursor-default">
            <div className={`p-4 rounded-xl ${card.color} shadow-lg shadow-${card.color.split('-')[1]}-200`}>
              <card.icon size={24} className="text-white" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{card.title}</p>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Agendamentos */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Agendamentos da Semana</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#6366f1' : '#e5e7eb'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lista de Próximos Agendamentos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Próximos de Hoje</h2>
          <div className="space-y-4">
            {proximos.length > 0 ? (
              proximos.slice(0, 5).map((agendamento) => (
                <div key={agendamento.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                  <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                    <Clock size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {format(parseISO(agendamento.data_hora), 'HH:mm')}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <User size={12} /> Cliente #{agendamento.cliente_id}
                    </p>
                  </div>
                  <div className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                    agendamento.status === 'confirmado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {agendamento.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar size={48} className="mx-auto text-gray-200 mb-2" />
                <p className="text-gray-400 text-sm">Nenhum agendamento para hoje</p>
              </div>
            )}
            
            {proximos.length > 5 && (
              <button className="w-full text-indigo-600 text-sm font-bold pt-2 hover:underline">
                Ver todos os {proximos.length} de hoje
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
