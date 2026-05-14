import { useEffect, useState } from 'react'
import { agendamentoService } from '../../services/agendamentoService'
import { clienteService } from '../../services/clienteService'
import { profissionalService } from '../../services/profissionalService'
import { servicoService } from '../../services/servicoService'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Search, Plus, Filter, Check, X, Clock, User, Briefcase, Calendar as CalendarIcon, List } from 'lucide-react'
import { toast } from 'react-hot-toast'
import AgendamentosCalendar from './AgendamentosCalendar'

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'
  
  // Form state
  const [clientes, setClientes] = useState([])
  const [profissionais, setProfissionais] = useState([])
  const [servicos, setServicos] = useState([])
  const [formData, setFormData] = useState({
    cliente_id: '',
    profissional_id: '',
    servico_id: '',
    data_hora: '',
    observacoes: ''
  })

  const loadAgendamentos = async () => {
    setLoading(true)
    try {
      const data = await agendamentoService.listar(filtroStatus ? { status: filtroStatus } : {})
      setAgendamentos(data)
    } catch (err) {
      toast.error('Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAgendamentos()
  }, [filtroStatus])

  useEffect(() => {
    if (showModal) {
      Promise.all([
        clienteService.listar(),
        profissionalService.listar(),
        servicoService.listar()
      ]).then(([c, p, s]) => {
        setClientes(c)
        setProfissionais(p)
        setServicos(s)
      })
    }
  }, [showModal])

  const handleStatusChange = async (id, novoStatus) => {
    try {
      await agendamentoService.atualizar(id, { status: novoStatus })
      toast.success(`Status atualizado para ${novoStatus}`)
      loadAgendamentos()
    } catch (err) {
      toast.error('Erro ao atualizar status')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await agendamentoService.criar(formData)
      toast.success('Agendamento criado!')
      setShowModal(false)
      setFormData({ cliente_id: '', profissional_id: '', servico_id: '', data_hora: '', observacoes: '' })
      loadAgendamentos()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao criar agendamento')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Agendamentos</h1>
          <p className="text-gray-500 text-sm">Gerencie todos os seus compromissos</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-lg p-1 border border-gray-100 shadow-sm">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Ver em Lista"
            >
              <List size={20} />
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-md transition ${viewMode === 'calendar' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Ver em Calendário"
            >
              <CalendarIcon size={20} />
            </button>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-md shadow-indigo-100"
          >
            <Plus size={20} /> Novo Agendamento
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-gray-500">
          <Filter size={18} />
          <span className="text-sm font-medium">Filtrar por:</span>
        </div>
        <select 
          value={filtroStatus} 
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
        >
          <option value="">Todos os Status</option>
          <option value="pendente">Pendentes</option>
          <option value="confirmado">Confirmados</option>
          <option value="concluido">Concluídos</option>
          <option value="cancelado">Cancelados</option>
        </select>
      </div>

      {/* Tabela / Lista / Calendário */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-24 text-center text-indigo-600 font-bold">
          Carregando agendamentos...
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              {/* ... existing table code ... */}
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Data/Hora</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Profissional</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Serviço</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {agendamentos.map((ag) => (
                  <tr key={ag.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-800 font-medium">
                        <Clock size={16} className="text-indigo-500" />
                        {format(parseISO(ag.data_hora), "dd/MM 'às' HH:mm", { locale: ptBR })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">ID #{ag.cliente_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">ID #{ag.profissional_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">ID #{ag.servico_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full ${
                        ag.status === 'confirmado' ? 'bg-green-100 text-green-700' : 
                        ag.status === 'cancelado' ? 'bg-red-100 text-red-700' :
                        ag.status === 'concluido' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {ag.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {ag.status === 'pendente' && (
                          <button 
                            onClick={() => handleStatusChange(ag.id, 'confirmado')}
                            className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                            title="Confirmar"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        {(ag.status === 'pendente' || ag.status === 'confirmado') && (
                          <button 
                            onClick={() => handleStatusChange(ag.id, 'concluido')}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                            title="Concluir"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        {ag.status !== 'cancelado' && (
                          <button 
                            onClick={() => handleStatusChange(ag.id, 'cancelado')}
                            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                            title="Cancelar"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {agendamentos.length === 0 && (
              <div className="p-12 text-center text-gray-400">Nenhum agendamento encontrado</div>
            )}
          </div>
        </div>
      ) : (
        <AgendamentosCalendar agendamentos={agendamentos} />
      )}

      {/* Modal Novo Agendamento */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Novo Agendamento</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <select 
                    required
                    value={formData.cliente_id}
                    onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                  >
                    <option value="">Selecione...</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profissional</label>
                  <select 
                    required
                    value={formData.profissional_id}
                    onChange={(e) => setFormData({...formData, profissional_id: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                  >
                    <option value="">Selecione...</option>
                    {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serviço</label>
                  <select 
                    required
                    value={formData.servico_id}
                    onChange={(e) => setFormData({...formData, servico_id: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                  >
                    <option value="">Selecione...</option>
                    {servicos.map(s => <option key={s.id} value={s.id}>{s.nome} - R$ {s.preco}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora</label>
                  <input 
                    type="datetime-local"
                    required
                    value={formData.data_hora}
                    onChange={(e) => setFormData({...formData, data_hora: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea 
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm h-24"
                  placeholder="Opcional..."
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-bold hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                >
                  Criar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
