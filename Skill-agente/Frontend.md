# Skill: Frontend React — Moderno, Modular e Fácil de Manter

## Quando usar esta skill
Use sempre que a tarefa envolver criação ou manutenção de interfaces com React. Isso inclui: dashboards, painéis SaaS, telas de login, formulários, listagens, componentes reutilizáveis. O foco é código limpo, modulável e com visual moderno.

---

## Stack Padrão

| Camada | Tecnologia |
|---|---|
| Framework | React 18+ |
| Build | Vite |
| Estilo | Tailwind CSS |
| Estado global | Zustand |
| Chamadas API | Axios com interceptors |
| Roteamento | React Router v6 |
| Formulários | React Hook Form + Zod |
| Ícones | Lucide React |
| Notificações | React Hot Toast |
| Datas | date-fns |

---

## Estrutura de Pastas Obrigatória

```
frontend/
├── public/
├── src/
│   ├── assets/               # Imagens, fontes, SVGs
│   ├── components/           # Componentes reutilizáveis globais
│   │   ├── ui/               # Átomos: Button, Input, Modal, Badge, etc.
│   │   └── layout/           # AppShell, Sidebar, Header, PageWrapper
│   ├── features/             # Módulos por domínio (pasta por feature)
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── useAuth.js
│   │   ├── agendamentos/
│   │   │   ├── AgendamentosPage.jsx
│   │   │   ├── AgendamentoCard.jsx
│   │   │   └── useAgendamentos.js
│   │   └── clientes/
│   │       ├── ClientesPage.jsx
│   │       └── useClientes.js
│   ├── hooks/                # Hooks globais reutilizáveis
│   │   ├── useApi.js
│   │   └── useDebounce.js
│   ├── services/             # Chamadas à API (um arquivo por domínio)
│   │   ├── api.js            # Instância do axios com interceptors
│   │   ├── authService.js
│   │   └── agendamentoService.js
│   ├── store/                # Zustand stores
│   │   ├── authStore.js
│   │   └── uiStore.js
│   ├── utils/                # Funções utilitárias puras
│   │   └── formatters.js
│   ├── routes/               # Definição de rotas
│   │   └── AppRoutes.jsx
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── tailwind.config.js
└── .env
```

---

## Regra de Ouro: Feature-First

**Cada domínio fica junto.** Não separe por tipo de arquivo.

```
# ✅ CORRETO — tudo de agendamentos junto
features/agendamentos/
├── AgendamentosPage.jsx
├── AgendamentoCard.jsx
├── AgendamentoModal.jsx
└── useAgendamentos.js

# ❌ ERRADO — espalhado por tipo
pages/AgendamentosPage.jsx
components/AgendamentoCard.jsx
hooks/useAgendamentos.js
```

---

## Instância do Axios com Interceptors

```javascript
// src/services/api.js
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Injeta token automaticamente
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Trata expiração de token
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

---

## Zustand Store

```javascript
// src/store/authStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      tenant: null,
      login: (token, usuario, tenant) => set({ token, usuario, tenant }),
      logout: () => set({ token: null, usuario: null, tenant: null }),
    }),
    { name: 'auth-storage' }
  )
)
```

---

## Chamadas à API (Service)

```javascript
// src/services/agendamentoService.js
import api from './api'

export const agendamentoService = {
  listar: (params) => api.get('/agendamentos', { params }).then(r => r.data),
  buscarPorId: (id) => api.get(`/agendamentos/${id}`).then(r => r.data),
  criar: (data) => api.post('/agendamentos', data).then(r => r.data),
  atualizar: (id, data) => api.put(`/agendamentos/${id}`, data).then(r => r.data),
  cancelar: (id) => api.patch(`/agendamentos/${id}/cancelar`).then(r => r.data),
}
```

---

## Hook de Dados por Feature

```javascript
// src/features/agendamentos/useAgendamentos.js
import { useState, useEffect } from 'react'
import { agendamentoService } from '../../services/agendamentoService'
import toast from 'react-hot-toast'

export function useAgendamentos(filtros = {}) {
  const [agendamentos, setAgendamentos] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    setCarregando(true)
    agendamentoService.listar(filtros)
      .then(setAgendamentos)
      .catch(() => toast.error('Erro ao carregar agendamentos'))
      .finally(() => setCarregando(false))
  }, [JSON.stringify(filtros)])

  return { agendamentos, carregando }
}
```

---

## Componentes UI Reutilizáveis

```jsx
// src/components/ui/Button.jsx
export function Button({ children, variant = 'primary', loading, ...props }) {
  const base = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50'
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-gray-600 hover:bg-gray-100',
  }
  return (
    <button className={`${base} ${variants[variant]}`} disabled={loading} {...props}>
      {loading ? <span className="animate-spin mr-2">⏳</span> : null}
      {children}
    </button>
  )
}
```

---

## Layout AppShell

```jsx
// src/components/layout/AppShell.jsx
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppShell({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

## Rotas com Proteção

```jsx
// src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LoginPage } from '../features/auth/LoginPage'
import { AppShell } from '../components/layout/AppShell'
import { DashboardPage } from '../features/dashboard/DashboardPage'

function RotaProtegida({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? <AppShell>{children}</AppShell> : <Navigate to="/login" />
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RotaProtegida><DashboardPage /></RotaProtegida>} />
        <Route path="/agendamentos" element={<RotaProtegida><AgendamentosPage /></RotaProtegida>} />
      </Routes>
    </BrowserRouter>
  )
}
```

---

## Formulários com React Hook Form + Zod

```jsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  nome: z.string().min(2, 'Nome muito curto'),
  whatsapp: z.string().min(11, 'WhatsApp inválido'),
})

export function ClienteForm({ onSubmit }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input {...register('nome')} placeholder="Nome completo"
          className="w-full border rounded-lg px-3 py-2" />
        {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
      </div>
      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
        Salvar
      </button>
    </form>
  )
}
```

---

## Design Visual — Padrão SaaS Moderno

### Paleta recomendada (Tailwind)
- **Primária:** `indigo-600` / `indigo-700`
- **Fundo:** `gray-50` (página) / `white` (cards)
- **Bordas:** `gray-200`
- **Texto:** `gray-900` (títulos) / `gray-600` (subtextos)
- **Sucesso:** `green-500` | **Erro:** `red-500` | **Aviso:** `yellow-500`

### Cards
```jsx
<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
```

### Badges de status
```jsx
const statusConfig = {
  agendado: 'bg-blue-100 text-blue-700',
  confirmado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
  concluido: 'bg-gray-100 text-gray-700',
}
<span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status]}`}>
  {status}
</span>
```

---

## Variáveis de Ambiente

```env
# .env
VITE_API_URL=https://api.agendazap.com.br/api/v1
```

```javascript
// Acessar no código
import.meta.env.VITE_API_URL
```

---

## Boas Práticas — Checklist

- [ ] Comentar componentes complexos em **português**
- [ ] Nunca colocar chamadas de API direto no componente — sempre via service + hook
- [ ] Nunca usar `useState` para estado que precisa persistir — usar Zustand
- [ ] Componentes com mais de 150 linhas devem ser divididos
- [ ] Loading state em toda chamada assíncrona
- [ ] Toast de erro em todo `catch`
- [ ] Formulários sempre com validação via Zod
- [ ] Variáveis sensíveis sempre em `.env` com prefixo `VITE_`
- [ ] Nunca hardcodar URLs de API no código

---

## vite.config.js Base

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

Com o alias `@` você importa assim:
```javascript
import { Button } from '@/components/ui/Button'
```
