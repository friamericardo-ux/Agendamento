# TASKS - Agendamentos_Automação
> Agente executor: Sheckyra 2.0 | Modelo: DeepSeek Coder
> Regra: Execute UMA tarefa por vez. Marque como ✅ CONCLUÍDO antes de avançar.

---

## 📦 FASE 1 — FUNDAÇÃO DO BACKEND
> Objetivo: Backend estável, banco criado, autenticação funcionando.

- [x] ✅ CONCLUÍDO — Estrutura de pastas do projeto (models, schemas, repositories, services, routers, auth)
- [x] ✅ CONCLUÍDO — Configuração do banco SQLite (agendazap.db) + database.py
- [x] ✅ CONCLUÍDO — Model Usuario com TipoUsuario (admin, profissional, cliente)
- [x] ✅ CONCLUÍDO — Autenticação JWT (login, token, get_current_user)
- [x] ✅ CONCLUÍDO — Model Cliente criado (schemas, repository, service, router)
- [x] ✅ CONCLUÍDO — Router de clientes registrado em /api/v1/clientes
- [x] ✅ CONCLUÍDO — Servidor uvicorn rodando sem erros

---

## 📦 FASE 2 — MÓDULOS CORE DO BACKEND
> Objetivo: Todos os módulos principais criados e funcionando.

### 2.1 — Módulo Profissional
- [x] ✅ CONCLUÍDO — Model Profissional (nome, especialidade, whatsapp, tenant_id, ativo)
- [x] ✅ CONCLUÍDO — Schema ProfissionalCreate / ProfissionalResponse
- [x] ✅ CONCLUÍDO — Repository + Service do Profissional
- [x] ✅ CONCLUÍDO — Router /api/v1/profissionais (CRUD completo)
- [x] ✅ CONCLUÍDO — Registrar router no main.py

### 2.2 — Módulo Serviço
- [x] ✅ CONCLUÍDO — Model Servico (nome, descricao, duracao_minutos, preco, tenant_id, ativo)
- [x] ✅ CONCLUÍDO — Schema ServicoCreate / ServicoResponse
- [x] ✅ CONCLUÍDO — Repository + Service do Servico
- [x] ✅ CONCLUÍDO — Router /api/v1/servicos (CRUD completo)
- [x] ✅ CONCLUÍDO — Registrar router no main.py

### 2.3 — Módulo Horário Disponível
- [x] ✅ CONCLUÍDO — Model HorarioDisponivel (profissional_id, dia_semana, hora_inicio, hora_fim, ativo)
- [x] ✅ CONCLUÍDO — Schema + Repository + Service
- [x] ✅ CONCLUÍDO — Router /api/v1/horarios
- [x] ✅ CONCLUÍDO — Registrar router no main.py

### 2.4 — Módulo Agendamento ⭐ (principal)
- [x] ✅ CONCLUÍDO — Model Agendamento (cliente_id, profissional_id, servico_id, tenant_id, data_hora, status, observacoes)
- [x] ✅ CONCLUÍDO — Enum StatusAgendamento (pendente, confirmado, cancelado, concluido)
- [x] ✅ CONCLUÍDO — Schema AgendamentoCreate / AgendamentoResponse
- [x] ✅ CONCLUÍDO — Repository com filtros por data, status, profissional
- [x] ✅ CONCLUÍDO — Service com validação de conflito de horário
- [x] ✅ CONCLUÍDO — Router /api/v1/agendamentos (CRUD + filtros)
- [x] ✅ CONCLUÍDO — Registrar router no main.py

### 2.5 — Módulo Tenant (multi-tenant)
- [x] ✅ CONCLUÍDO — Model Tenant (nome_negocio, tipo_negocio, telefone, plano, ativo)
- [x] ✅ CONCLUÍDO — Schema + Repository + Service
- [x] ✅ CONCLUÍDO — Router /api/v1/tenants
- [x] ✅ CONCLUÍDO — Associar tenant_id em todos os módulos

---

## 📦 FASE 3 — PAINEL FRONTEND (React + Vite)
> Objetivo: Painel funcional para o dono do negócio gerenciar tudo.

### 3.1 — Autenticação Frontend
- [x] ✅ CONCLUÍDO — Tela de Login
- [x] ✅ CONCLUÍDO — Tela de Cadastro (registro de novo tenant)
- [x] ✅ CONCLUÍDO — Proteção de rotas (redirecionar se não autenticado)
- [x] ✅ CONCLUÍDO — Armazenar token JWT no localStorage
- [x] ✅ CONCLUÍDO — Logout funcional

### 3.2 — Dashboard
- [x] ✅ CONCLUÍDO — Cards de métricas (Total, Confirmados, Pendentes, Cancelados)
- [x] ✅ CONCLUÍDO — Conectar cards com dados reais da API
- [x] ✅ CONCLUÍDO — Lista dos próximos agendamentos do dia
- [x] ✅ CONCLUÍDO — Gráfico simples de agendamentos por semana

### 3.3 — Tela de Agendamentos
- [x] ✅ CONCLUÍDO — Listagem de todos os agendamentos com filtros (data, status)
- [x] ✅ CONCLUÍDO — Botões de ação: Confirmar / Cancelar / Concluir
- [x] ✅ CONCLUÍDO — Modal para criar agendamento manual
- [x] ✅ CONCLUÍDO — Calendário visual dos agendamentos

### 3.4 — Tela de Clientes
- [x] ✅ CONCLUÍDO — Listagem de clientes cadastrados
- [x] ✅ CONCLUÍDO — Formulário de cadastro/edição de cliente
- [x] ✅ CONCLUÍDO — Histórico de agendamentos por cliente

### 3.5 — Tela de Profissionais
- [x] ✅ CONCLUÍDO — Listagem de profissionais
- [x] ✅ CONCLUÍDO — Cadastro/Edição de profissionais
- [x] ✅ CONCLUÍDO — Configuração de horários (disponibilidade) do profissional

### 3.6 — Tela de Serviços
- [x] ✅ CONCLUÍDO — Listagem de serviços
- [x] ✅ CONCLUÍDO — Cadastro/Edição de serviço (nome, preço, duração)
- [x] ✅ CONCLUÍDO — Ativar/desativar serviço

### 3.7 — Tela de Configurações
- [x] ✅ CONCLUÍDO — Dados do negócio (nome, tipo, telefone, endereço)
- [x] ✅ CONCLUÍDO — Horário de funcionamento
- [x] ✅ CONCLUÍDO — Integração WhatsApp (número conectado, status)

---

## 📦 FASE 4 — AGENTE WHATSAPP
> Objetivo: Bot no WhatsApp que agenda automaticamente via conversa.

### 4.1 — Infraestrutura WhatsApp
- [ ] ⏳ PENDENTE — Criar nova instância Evolution API para o projeto
- [ ] ⏳ PENDENTE — Configurar webhook da instância apontando para n8n
- [ ] ⏳ PENDENTE — Testar recebimento de mensagem no n8n

### 4.2 — Fluxo do Agente n8n
- [x] ✅ CONCLUÍDO — Nó de entrada: receber mensagem WhatsApp
- [x] ✅ CONCLUÍDO — Nó de memória: salvar histórico por número do cliente
- [x] ✅ CONCLUÍDO — Nó IA (Groq/OpenAI): processar intenção do cliente
- [x] ✅ CONCLUÍDO — Nó de verificação: consultar horários disponíveis via API
- [x] ✅ CONCLUÍDO — Nó de criação: criar agendamento via POST /api/v1/agendamentos
- [x] ✅ CONCLUÍDO — Nó de resposta: confirmar agendamento para o cliente

### 4.3 — Funcionalidades do Bot
- [x] ✅ CONCLUÍDO — Saudação inicial + menu de opções
- [x] ✅ CONCLUÍDO — Listar serviços disponíveis
- [x] ✅ CONCLUÍDO — Listar profissionais disponíveis
- [x] ✅ CONCLUÍDO — Mostrar horários livres por data
- [x] ✅ CONCLUÍDO — Confirmar e criar agendamento
- [x] ✅ CONCLUÍDO — Cancelar agendamento existente
- [ ] ⏳ PENDENTE — Resposta fora do horário de atendimento

### 4.4 — Notificações Automáticas
- [ ] ⏳ PENDENTE — Lembrete 24h antes do agendamento (via n8n scheduled)
- [ ] ⏳ PENDENTE — Lembrete 1h antes do agendamento
- [ ] ⏳ PENDENTE — Notificar profissional quando novo agendamento chegar

---

## 📦 FASE 5 — TESTES E AJUSTES
> Objetivo: Sistema testado ponta a ponta antes de subir pro servidor.

- [ ] ⏳ PENDENTE — Testar fluxo completo: cliente manda mensagem → bot agenda → aparece no painel
- [ ] ⏳ PENDENTE — Testar conflito de horário (não permitir duplo agendamento)
- [ ] ⏳ PENDENTE — Testar login/logout no painel
- [ ] ⏳ PENDENTE — Testar CRUD de profissionais, serviços, clientes
- [ ] ⏳ PENDENTE — Testar notificações de lembrete
- [ ] ⏳ PENDENTE — Testar responsividade do frontend (mobile)

---

## 📦 FASE 6 — DEPLOY NO SERVIDOR
> Objetivo: Sistema rodando em produção no servidor Hetzner.

- [ ] ⏳ PENDENTE — Configurar variáveis de ambiente (.env produção)
- [ ] ⏳ PENDENTE — Migrar banco de SQLite para MySQL/PostgreSQL
- [ ] ⏳ PENDENTE — Deploy do backend via Coolify
- [ ] ⏳ PENDENTE — Deploy do frontend via Coolify
- [ ] ⏳ PENDENTE — Configurar domínio + SSL (HTTPS)
- [ ] ⏳ PENDENTE — Configurar Evolution API instância de produção
- [ ] ⏳ PENDENTE — Teste final em produção

---

## 📦 FASE 7 — PRODUTO SaaS (multi-tenant)
> Objetivo: Vender o sistema para múltiplos clientes.

- [ ] ⏳ PENDENTE — Tela de cadastro público (novo cliente se registra)
- [ ] ⏳ PENDENTE — Planos de assinatura (básico, profissional, premium)
- [ ] ⏳ PENDENTE — Onboarding automático: criar tenant + instância WhatsApp
- [ ] ⏳ PENDENTE — Painel Super Admin (ver todos os tenants, status, planos)
- [ ] ⏳ PENDENTE — Cobrança recorrente (integração Stripe ou Mercado Pago)
- [ ] ⏳ PENDENTE — Landing page do produto

---

## 📋 RESUMO DE PROGRESSO

| Fase | Status | Progresso |
|------|--------|-----------|
| Fase 1 — Fundação Backend | ✅ Concluído | 7/7 |
| Fase 2 — Módulos Core | ✅ Concluído | 26/26 |
| Fase 3 — Frontend Painel | ✅ Concluído | 25/25 |
| Fase 4 — Agente WhatsApp | ⏳ Em andamento | 12/20 |
| Fase 5 — Testes | ⏳ Pendente | 0/6 |
| Fase 6 — Deploy | ⏳ Pendente | 0/7 |
| Fase 7 — SaaS Multi-tenant | ⏳ Pendente | 0/6 |

---

> 💡 **Instrução para Sheckyra:** Leia este arquivo, identifique a primeira tarefa com status ⏳ PENDENTE, execute apenas ela, e ao concluir altere para ✅ CONCLUÍDO antes de parar.
