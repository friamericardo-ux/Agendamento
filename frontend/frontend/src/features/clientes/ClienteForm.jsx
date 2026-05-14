import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'

const schema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido').or(z.literal('')).optional(),
  whatsapp: z.string().optional(),
  observacoes: z.string().max(500, 'Máximo 500 caracteres').optional(),
})

export function ClienteForm({ cliente, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      email: '',
      whatsapp: '',
      observacoes: '',
    }
  })

  useEffect(() => {
    if (cliente) {
      reset({
        nome: cliente.nome || '',
        email: cliente.email || '',
        whatsapp: cliente.whatsapp || '',
        observacoes: cliente.observacoes || '',
      })
    }
  }, [cliente, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
        <input
          {...register('nome')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Nome completo"
        />
        {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          {...register('email')}
          type="email"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="cliente@email.com"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
        <input
          {...register('whatsapp')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="11999999999"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
        <textarea
          {...register('observacoes')}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Observações..."
        />
        {errors.observacoes && <p className="text-red-500 text-sm mt-1">{errors.observacoes.message}</p>}
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
