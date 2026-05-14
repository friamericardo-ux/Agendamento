import { useEffect, useState } from 'react'
import { profissionalService } from '../../services/profissionalService'
import { horarioService } from '../../services/horarioService'
import { User, Plus, Edit2, Trash2, Phone, Briefcase, X, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ProfissionaisPage() {
  const [profissionais, setProfissionais] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showHorariosModal, setShowHorariosModal] = useState(false)
  const [editingProf, setEditingProf] = useState(null)
  const [horarios, setHorarios] = useState([])
  
  const [formData, setFormData] = useState({
    nome: '',
    especialidade: '',
    whatsapp: '',
    ativo: true
  })

  const [novoHorario, setNovoHorario] = useState({
    dia_semana: 1,
    hora_inicio: '08:00',
    hora_fim: '18:00'
  })

  const loadProfissionais = async () => {
    setLoading(true)
    try {
      const data = await profissionalService.listar()
      setProfissionais(data)
    } catch (err) {
      toast.error('Erro ao carregar profissionais')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfissionais()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingProf) {
        await profissionalService.atualizar(editingProf.id, formData)
        toast.success('Profissional atualizado!')
      } else {
        await profissionalService.criar(formData)
        toast.success('Profissional cadastrado!')
      }
      setShowModal(false)
      setEditingProf(null)
      setFormData({ nome: '', especialidade: '', whatsapp: '', ativo: true })
      loadProfissionais()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao salvar profissional')
    }
  }

  const handleEdit = (prof) => {
    setEditingProf(prof)
    setFormData({
      nome: prof.nome,
      especialidade: prof.especialidade || '',
      whatsapp: prof.whatsapp || '',
      ativo: prof.ativo
    })
    setShowModal(true)
  }

  const handleHorarios = async (prof) => {
    setEditingProf(prof)
    setShowHorariosModal(true)
    loadHorarios(prof.id)
  }

  const loadHorarios = async (profId) => {
    try {
      const data = await horarioService.listarPorProfissional(profId)
      setHorarios(data)
    } catch (err) {
      toast.error('Erro ao carregar horários')
    }
  }

  const handleAddHorario = async (e) => {
    e.preventDefault()
    try {
      await horarioService.criar({
        ...novoHorario,
        profissional_id: editingProf.id
      })
      toast.success('Horário adicionado!')
      loadHorarios(editingProf.id)
    } catch (err) {
      toast.error('Erro ao adicionar horário')
    }
  }

  const handleRemoveHorario = async (id) => {
    try {
      await horarioService.deletar(id)
      toast.success('Horário removido')
      loadHorarios(editingProf.id)
    } catch (err) {
      toast.error('Erro ao remover horário')
    }
  }

  const getDiaSemana = (dia) => {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    return dias[dia]
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Profissionais</h1>
          <p className="text-gray-500 text-sm">Gerencie sua equipe</p>
        </div>
        <button 
          onClick={() => {
            setEditingProf(null)
            setFormData({ nome: '', especialidade: '', whatsapp: '', ativo: true })
            setShowModal(true)
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-md shadow-indigo-100"
        >
          <Plus size={20} /> Novo Profissional
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center text-indigo-600">Carregando...</div>
        ) : (
          profissionais.map((prof) => (
            <div key={prof.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
                  <User size={24} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleHorarios(prof)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Horários">
                    <Clock size={18} />
                  </button>
                  <button onClick={() => handleEdit(prof)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Editar">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(prof.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Excluir">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800">{prof.nome}</h3>
              <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                <Briefcase size={14} /> {prof.especialidade || 'Geral'}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Phone size={14} /> {prof.whatsapp || '-'}
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                  prof.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {prof.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          ))
        )}
        {!loading && profissionais.length === 0 && (
          <div className="col-span-full p-12 text-center text-gray-400">Nenhum profissional cadastrado</div>
        )}
      </div>

      {/* Modal Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingProf ? 'Editar Profissional' : 'Novo Profissional'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input 
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
                <input 
                  type="text"
                  value={formData.especialidade}
                  onChange={(e) => setFormData({...formData, especialidade: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                  placeholder="Ex: Cabelo, Barba, Unhas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input 
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="ativo" className="text-sm font-medium text-gray-700">Profissional Ativo</label>
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
                  {editingProf ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Horários Disponíveis */}
      {showHorariosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Horários: {editingProf?.nome}</h2>
                <p className="text-xs text-gray-500">Configure os horários de atendimento deste profissional</p>
              </div>
              <button onClick={() => setShowHorariosModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Formulário Novo Horário */}
              <form onSubmit={handleAddHorario} className="bg-gray-50 p-4 rounded-xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dia</label>
                    <select 
                      value={novoHorario.dia_semana}
                      onChange={(e) => setNovoHorario({...novoHorario, dia_semana: parseInt(e.target.value)})}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm"
                    >
                      {[1,2,3,4,5,6,0].map(d => <option key={d} value={d}>{getDiaSemana(d)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Início</label>
                    <input 
                      type="time"
                      value={novoHorario.hora_inicio}
                      onChange={(e) => setNovoHorario({...novoHorario, hora_inicio: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fim</label>
                    <input 
                      type="time"
                      value={novoHorario.hora_fim}
                      onChange={(e) => setNovoHorario({...novoHorario, hora_fim: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition">
                  Adicionar Horário
                </button>
              </form>

              {/* Lista de Horários */}
              <div className="space-y-2">
                <h3 className="font-bold text-gray-700 text-sm">Horários Configurados</h3>
                {horarios.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {horarios.sort((a,b) => a.dia_semana - b.dia_semana).map((h) => (
                      <div key={h.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-indigo-100 transition">
                        <div className="flex items-center gap-3">
                          <span className="w-20 font-bold text-indigo-600 text-sm">{getDiaSemana(h.dia_semana)}</span>
                          <span className="text-gray-600 text-sm">{h.hora_inicio.substring(0,5)} - {h.hora_fim.substring(0,5)}</span>
                        </div>
                        <button onClick={() => handleRemoveHorario(h.id)} className="text-red-400 hover:text-red-600 p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-4 text-sm italic">Nenhum horário configurado ainda.</p>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button 
                onClick={() => setShowHorariosModal(false)}
                className="w-full py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-100 transition"
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
