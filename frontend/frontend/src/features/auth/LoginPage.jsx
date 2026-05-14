import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Mínimo 6 caracteres'),
})

const registerSchema = z.object({
  nome: z.string().min(2, 'Nome muito curto'),
  nome_negocio: z.string().min(2, 'Nome do negócio muito curto'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Mínimo 6 caracteres'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [loading, setLoading] = useState(false)
  const [modoRegistro, setModoRegistro] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(modoRegistro ? registerSchema : loginSchema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (modoRegistro) {
        const res = await authService.register({
          nome: data.nome,
          nome_negocio: data.nome_negocio,
          email: data.email,
          senha: data.senha,
          tipo: 'admin'
        })
        login(res.access_token, res.usuario)
        toast.success('Conta criada com sucesso!')
      } else {
        const res = await authService.login(data.email, data.senha)
        login(res.access_token, res.usuario)
        toast.success('Login realizado!')
      }
      navigate('/')
    } catch (err) {
    const detail = err.response?.data?.detail
    const msg = Array.isArray(detail)
    ? detail[0]?.msg || 'Erro ao processar'
    : typeof detail === 'string'
    ? detail
    : 'Erro ao processar'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const toggleModo = () => {
    setModoRegistro(!modoRegistro)
    reset()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Agendamentos</h1>
        <p className="text-gray-500 text-center mb-6">
          {modoRegistro ? 'Crie sua conta' : 'Faça login para continuar'}
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {modoRegistro && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  {...register('nome')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Seu nome"
                />
                {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Negócio</label>
                <input
                  {...register('nome_negocio')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Barbearia do João"
                />
                {errors.nome_negocio && <p className="text-red-500 text-sm mt-1">{errors.nome_negocio.message}</p>}
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              {...register('email')}
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="seu@email.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              {...register('senha')}
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="********"
            />
            {errors.senha && <p className="text-red-500 text-sm mt-1">{errors.senha.message}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Processando...' : modoRegistro ? 'Criar Conta' : 'Entrar'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          {modoRegistro ? 'Já tem conta?' : 'Não tem conta?'}{' '}
          <button
            onClick={toggleModo}
            className="text-indigo-600 hover:underline font-medium"
          >
            {modoRegistro ? 'Faça login' : 'Cadastre-se'}
          </button>
        </p>
      </div>
    </div>
  )
}
