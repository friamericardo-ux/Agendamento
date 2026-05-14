import { useEffect, useState } from 'react'
import { tenantService } from '../../services/tenantService'
import { Settings, Save, Globe, Phone, Building, Link as LinkIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function SettingsPage() {
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    nome_negocio: '',
    tipo_negocio: '',
    telefone: '',
    slug: '',
    horario_funcionamento: ''
  })

  useEffect(() => {
    tenantService.me()
      .then(data => {
        setTenant(data)
        setFormData({
          nome_negocio: data.nome_negocio,
          tipo_negocio: data.tipo_negocio || '',
          telefone: data.telefone || '',
          slug: data.slug || '',
          horario_funcionamento: data.horario_funcionamento || ''
        })
      })
      .catch(() => toast.error('Erro ao carregar configurações'))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await tenantService.atualizar(tenant.id, formData)
      toast.success('Configurações salvas!')
    } catch (err) {
      toast.error('Erro ao salvar configurações')
    }
  }

  if (loading) return <div className="p-12 text-center text-indigo-600">Carregando...</div>

  const publicLink = `${window.location.origin}/book/${formData.slug || tenant?.id}`

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
        <p className="text-gray-500 text-sm">Gerencie os dados da sua empresa e links de agendamento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Building size={20} className="text-indigo-500" /> Dados da Empresa
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Negócio</label>
                <input 
                  type="text"
                  value={formData.nome_negocio}
                  onChange={(e) => setFormData({...formData, nome_negocio: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Negócio</label>
                <input 
                  type="text"
                  value={formData.tipo_negocio}
                  onChange={(e) => setFormData({...formData, tipo_negocio: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                  placeholder="Ex: Barbearia, Salão de Beleza"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone de Contato</label>
                <input 
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL Personalizada)</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-200 bg-gray-100 text-gray-500 text-sm">
                    /book/
                  </span>
                  <input 
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                    className="flex-1 min-w-0 block w-full px-3 py-2.5 rounded-none rounded-r-md border border-gray-200 bg-gray-50 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="minha-empresa"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">Este slug será usado no seu link público de agendamento.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horário de Funcionamento</label>
                <textarea 
                  value={formData.horario_funcionamento}
                  onChange={(e) => setFormData({...formData, horario_funcionamento: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm h-24"
                  placeholder="Ex: Seg a Sex: 08:00 - 18:00&#10;Sab: 09:00 - 13:00"
                />
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex justify-end">
              <button 
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
              >
                <Save size={18} /> Salvar Alterações
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <LinkIcon size={18} /> Link de Agendamento
            </h3>
            <p className="text-sm text-indigo-100 mb-4">Compartilhe este link com seus clientes para que eles agendem sozinhos.</p>
            <div className="bg-white/10 p-3 rounded-lg border border-white/20 break-all text-xs font-mono mb-4">
              {publicLink}
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(publicLink)
                toast.success('Link copiado!')
              }}
              className="w-full bg-white text-indigo-600 py-2 rounded-lg font-bold hover:bg-indigo-50 transition"
            >
              Copiar Link
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4">Plano Atual</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Tipo de Plano</span>
              <span className="text-sm font-bold text-indigo-600 uppercase">{tenant?.plano || 'Free'}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
              <div className="bg-indigo-600 h-2 rounded-full w-1/3"></div>
            </div>
            <p className="text-xs text-gray-400">Você está usando 30% da sua cota mensal.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
