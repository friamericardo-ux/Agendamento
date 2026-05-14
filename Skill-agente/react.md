# React — Padrões Profissionais

## Estrutura de Projeto
```
src/
├── assets/              # Imagens, fontes, ícones
├── components/          # Componentes reutilizáveis
│   ├── ui/              # Botão, Input, Modal, Card (genéricos)
│   └── layout/          # Header, Footer, Sidebar
├── features/            # Funcionalidades completas
│   └── auth/
│       ├── components/  # Componentes específicos de auth
│       ├── hooks/       # useAuth, useLogin
│       ├── services/    # Chamadas de API de auth
│       └── index.ts     # Exporta tudo da feature
├── hooks/               # Hooks globais reutilizáveis
├── services/            # API calls (axios/fetch)
├── store/               # Estado global (Zustand/Redux)
├── types/               # TypeScript types e interfaces
├── utils/               # Funções auxiliares puras
├── pages/               # Páginas da aplicação
└── router/              # Configuração de rotas
```

## Componentes — Regras Profissionais

### Um componente = uma responsabilidade
```tsx
// ❌ ERRADO — faz tudo junto
function PaginaUsuario() {
    const [usuario, setUsuario] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetch('/api/usuario').then(r => r.json()).then(setUsuario)
    }, [])

    return (
        <div>
            {loading ? <p>Carregando...</p> : <p>{usuario?.nome}</p>}
            <form>...</form>
            <table>...</table>
        </div>
    )
}

// ✅ CORRETO — separado por responsabilidade
function PaginaUsuario() {
    return (
        <PageLayout>
            <PerfilUsuario />
            <FormularioEdicao />
            <TabelaAtividades />
        </PageLayout>
    )
}
```

### Props com TypeScript — Sempre
```tsx
// types/usuario.ts
export interface Usuario {
    id: number
    nome: string
    email: string
    avatar?: string
    criadoEm: string
}

// components/ui/CartaoUsuario.tsx
interface CartaoUsuarioProps {
    usuario: Usuario
    onEditar?: (id: number) => void
    onDeletar?: (id: number) => void
    className?: string
}

export function CartaoUsuario({
    usuario,
    onEditar,
    onDeletar,
    className = ""
}: CartaoUsuarioProps) {
    return (
        <div className={`card ${className}`}>
            <img
                src={usuario.avatar ?? "/avatar-default.png"}
                alt={`Avatar de ${usuario.nome}`}
            />
            <h3>{usuario.nome}</h3>
            <p>{usuario.email}</p>
            {onEditar && (
                <button onClick={() => onEditar(usuario.id)}>
                    Editar
                </button>
            )}
        </div>
    )
}
```

## Hooks Customizados — Isolar lógica
```tsx
// hooks/useUsuario.ts
import { useState, useEffect, useCallback } from 'react'
import { usuarioService } from '../services/usuarioService'
import type { Usuario } from '../types/usuario'

interface UseUsuarioReturn {
    usuario: Usuario | null
    loading: boolean
    erro: string | null
    atualizar: (dados: Partial<Usuario>) => Promise<void>
    refetch: () => void
}

export function useUsuario(id: number): UseUsuarioReturn {
    const [usuario, setUsuario] = useState<Usuario | null>(null)
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState<string | null>(null)

    const buscar = useCallback(async () => {
        try {
            setLoading(true)
            setErro(null)
            const dados = await usuarioService.buscarPorId(id)
            setUsuario(dados)
        } catch (e) {
            setErro("Erro ao carregar usuário")
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => { buscar() }, [buscar])

    const atualizar = async (dados: Partial<Usuario>) => {
        const atualizado = await usuarioService.atualizar(id, dados)
        setUsuario(atualizado)
    }

    return { usuario, loading, erro, atualizar, refetch: buscar }
}
```

## Serviços de API — Centralizado
```tsx
// services/api.ts
import axios from 'axios'

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
})

// Injeta token automaticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Trata erros globalmente
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// services/usuarioService.ts
import { api } from './api'
import type { Usuario } from '../types/usuario'

export const usuarioService = {
    buscarPorId: async (id: number): Promise<Usuario> => {
        const { data } = await api.get(`/usuarios/${id}`)
        return data.dados
    },

    atualizar: async (id: number, dados: Partial<Usuario>): Promise<Usuario> => {
        const { data } = await api.put(`/usuarios/${id}`, dados)
        return data.dados
    },

    deletar: async (id: number): Promise<void> => {
        await api.delete(`/usuarios/${id}`)
    }
}
```

## Estado Global — Zustand (simples e escalável)
```tsx
// store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario } from '../types/usuario'

interface AuthState {
    usuario: Usuario | null
    token: string | null
    estaLogado: boolean
    login: (usuario: Usuario, token: string) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            usuario: null,
            token: null,
            estaLogado: false,

            login: (usuario, token) => set({
                usuario,
                token,
                estaLogado: true
            }),

            logout: () => set({
                usuario: null,
                token: null,
                estaLogado: false
            })
        }),
        { name: 'auth-storage' }
    )
)
```

## Segurança no Frontend

### Sanitizar dados antes de exibir
```tsx
import DOMPurify from 'dompurify'

// ❌ ERRADO — XSS vulnerável
<div dangerouslySetInnerHTML={{ __html: conteudoUsuario }} />

// ✅ CORRETO — sanitizado
<div dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(conteudoUsuario)
}} />
```

### Rotas protegidas
```tsx
// components/RotaProtegida.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function RotaProtegida() {
    const { estaLogado } = useAuthStore()

    if (!estaLogado) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}

// router/index.tsx
<Routes>
    <Route path="/login" element={<PaginaLogin />} />
    <Route element={<RotaProtegida />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/perfil" element={<Perfil />} />
    </Route>
</Routes>
```

### Variáveis de ambiente — Nunca expor segredos
```
# .env
VITE_API_URL=https://api.meusite.com
# NUNCA coloque chaves secretas aqui — frontend é público!
```

## Performance

### Lazy loading de páginas
```tsx
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Relatorios = lazy(() => import('./pages/Relatorios'))

function App() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/relatorios" element={<Relatorios />} />
            </Routes>
        </Suspense>
    )
}
```

### Memo para componentes pesados
```tsx
import { memo, useMemo, useCallback } from 'react'

// Evita re-render desnecessário
const TabelaPesada = memo(function TabelaPesada({ dados }: Props) {
    return <table>...</table>
})

function PaginaPai() {
    // Evita recriar função a cada render
    const handleClick = useCallback((id: number) => {
        console.log(id)
    }, [])

    // Evita recalcular a cada render
    const dadosFiltrados = useMemo(() =>
        dados.filter(d => d.ativo),
        [dados]
    )

    return <TabelaPesada dados={dadosFiltrados} onClick={handleClick} />
}
```

## Acessibilidade — Obrigatório
```tsx
// ✅ Sempre use labels, aria e roles corretos
<button
    onClick={handleDeletar}
    aria-label="Deletar usuário João"
    disabled={loading}
>
    {loading ? <Spinner aria-hidden /> : <IconeLixeira aria-hidden />}
</button>

<input
    id="email"
    type="email"
    aria-describedby="email-erro"
    aria-invalid={!!erroEmail}
/>
<label htmlFor="email">Email</label>
{erroEmail && (
    <span id="email-erro" role="alert">{erroEmail}</span>
)}
```

## Checklist antes de entregar
- [ ] TypeScript em todos os componentes e hooks
- [ ] Sem any — tipar corretamente
- [ ] Tratamento de loading e erro em todas as chamadas de API
- [ ] Rotas privadas protegidas
- [ ] Sem secrets no .env do frontend
- [ ] Lazy loading nas páginas
- [ ] Componentes com no máximo 150 linhas
- [ ] Lógica nos hooks, não nos componentes
- [ ] Acessibilidade básica (labels, aria)
- [ ] Responsivo (mobile-first)
