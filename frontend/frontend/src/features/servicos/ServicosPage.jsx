import { useEffect, useState } from 'react'
import { servicoService } from '../../services/servicoService'
import { Plus, Edit2, Trash2, Clock, DollarSign, X, Scissors } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ServicosPage() {
  const [servicos, setServicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingServ, setEditingServ] = useState(null)
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    duracao_minutos: 30,
    preco: 0,
    ativo: true
  })

  const loadServicos = async () => {
    setLoading(true)
    try {
      const data = await servicoService.listar()
      setServicos(data)
    } catch (err) {
      toast.error('Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServicos()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingServ) {
        await servicoService.atualizar(editingServ.id, formData)
        toast.success('Serviço atualizado!')
      } else {
        await servicoService.criar(formData)
        toast.success('Serviço cadastrado!')
      }
      setShowModal(false)
      setEditingServ(null)
      setFormData({ nome: '', descricao: '', duracao_minutos: 30, preco: 0, ativo: true })
      loadServicos()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao salvar serviço')
    }
  }

  const handleEdit = (serv) => {
    setEditingServ(serv)
    setFormData({
      nome: serv.nome,
      descricao: serv.descricao || '',
      duracao_minutos: serv.duracao_minutos,
      preco: serv.preco,
      ativo: serv.ativo
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) return
    try {
      await servicoService.deletar(id)
      toast.success('Serviço excluído')
      loadServicos()
    } catch (err) {
      toast.error('Erro ao excluir serviço')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Serviços</h1>
          <p className="text-gray-500 text-sm">Configure os serviços oferecidos</p>
        </div>
        <button 
          onClick={() => {
            setEditingServ(null)
            setFormData({ nome: '', descricao: '', duracao_minutos: 30, preco: 0, ativo: true })
            setShowModal(true)
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-md shadow-indigo-100"
        >
          <Plus size={20} /> Novo Serviço
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
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Serviço</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Duração</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Preço</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {servicos.map((serv) => (
                  <tr key={serv.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                          <Scissors size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{serv.nome}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[200px]">{serv.descricao}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock size={14} className="text-gray-400" /> {serv.duracao_minutos} min
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm font-bold text-gray-800">
                        <DollarSign size={14} className="text-green-500" /> {serv.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full ${
                        serv.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {serv.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(serv)}
                          className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(serv.id)}
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && servicos.length === 0 && (
              <div className="p-12 text-center text-gray-400">Nenhum serviço cadastrado</div>
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
                {editingServ ? 'Editar Serviço' : 'Novo Serviço'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Serviço</label>
                <input 
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                  placeholder="Ex: Corte de Cabelo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea 
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm h-20"
                  placeholder="Opcional..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duração (min)</label>
                  <input 
                    type="number"
                    required
                    value={formData.duracao_minutos}
                    onChange={(e) => setFormData({...formData, duracao_minutos: parseInt(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    value={formData.preco}
                    onChange={(e) => setFormData({...formData, preco: parseFloat(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="ativo_serv"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="ativo_serv" className="text-sm font-medium text-gray-700">Serviço Ativo</label>
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
                  {editingServ ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
