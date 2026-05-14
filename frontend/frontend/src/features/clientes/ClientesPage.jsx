import { useEffect, useState } from 'react'
import { clienteService } from '../../services/clienteService'
import { agendamentoService } from '../../services/agendamentoService'
import { User, Plus, Edit2, Trash2, Mail, Phone, X, History, Calendar, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [editingCliente, setEditingCliente] = useState(null)
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [historico, setHistorico] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    observacoes: ''
  })

  const loadClientes = async () => {
    setLoading(true)
    try {
      const data = await clienteService.listar()
      setClientes(data)
    } catch (err) {
      toast.error('Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClientes()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCliente) {
        await clienteService.atualizar(editingCliente.id, formData)
        toast.success('Cliente atualizado!')
      } else {
        await clienteService.criar(formData)
        toast.success('Cliente cadastrado!')
      }
      setShowModal(false)
      setEditingCliente(null)
      setFormData({ nome: '', email: '', whatsapp: '', observacoes: '' })
      loadClientes()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao salvar cliente')
    }
  }

  const handleEdit = (cliente) => {
    setEditingCliente(cliente)
    setFormData({
      nome: cliente.nome,
      email: cliente.email || '',
      whatsapp: cliente.whatsapp || '',
      observacoes: cliente.observacoes || ''
    })
    setShowModal(true)
  }

  const handleHistory = async (cliente) => {
    setSelectedCliente(cliente)
    setShowHistoryModal(true)
    setLoadingHistory(true)
    try {
      // Usando o filtro de cliente_id no serviço de agendamento
      // Assumindo que o serviço aceite filtros ou que possamos filtrar o resultado
      const todos = await agendamentoService.listar()
      const filtrados = todos.filter(a => a.cliente_id === cliente.id)
      setHistorico(filtrados.sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora)))
    } catch (err) {
      toast.error('Erro ao carregar histórico')
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return
    try {
      await clienteService.deletar(id)
      toast.success('Cliente excluído')
      loadClientes()
    } catch (err) {
      toast.error('Erro ao excluir cliente')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
          <p className="text-gray-500 text-sm">Gerencie seu banco de dados de clientes</p>
        </div>
        <button 
          onClick={() => {
            setEditingCliente(null)
            setFormData({ nome: '', email: '', whatsapp: '', observacoes: '' })
            setShowModal(true)
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-md shadow-indigo-100"
        >
          <Plus size={20} /> Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-indigo-600">Carregando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contato</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Observações</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                          <User size={18} />
                        </div>
                        <span className="font-medium text-gray-800">{cliente.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm space-y-1">
                        {cliente.email && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Mail size={14} /> {cliente.email}
                          </div>
                        )}
                        {cliente.whatsapp && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Phone size={14} /> {cliente.whatsapp}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {cliente.observacoes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleHistory(cliente)}
                          className="p-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                          title="Ver Histórico"
                        >
                          <History size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(cliente)}
                          className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cliente.id)}
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {clientes.length === 0 && (
              <div className="p-12 text-center text-gray-400">Nenhum cliente cadastrado</div>
            )}
          </div>
        )}
      </div>

      {/* Modal Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input 
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input 
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea 
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm h-24"
                  placeholder="Informações adicionais..."
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
                  {editingCliente ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Histórico */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Histórico de Agendamentos</h2>
                <p className="text-sm text-indigo-600 font-medium">{selectedCliente?.nome}</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {loadingHistory ? (
                <div className="text-center py-12 text-indigo-600 font-medium">Carregando histórico...</div>
              ) : historico.length > 0 ? (
                <div className="space-y-4">
                  {historico.map(ag => (
                    <div key={ag.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition">
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-lg shadow-sm text-indigo-600 border border-indigo-50">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">
                            {new Date(ag.data_hora).toLocaleDateString('pt-BR')} às {new Date(ag.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-xs text-indigo-500 font-bold tracking-wider">{ag.servico_nome || 'Serviço'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                          ag.status === 'concluido' ? 'bg-green-100 text-green-700' :
                          ag.status === 'cancelado' ? 'bg-red-100 text-red-700' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          {ag.status}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1 font-medium">{ag.profissional_nome || 'Profissional'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 italic">Nenhum agendamento encontrado para este cliente.</div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="w-full py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-100 transition shadow-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
