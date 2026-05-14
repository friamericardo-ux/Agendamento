# Lógica de Integração - Agente WhatsApp (n8n)

Este documento descreve como o n8n deve interagir com a API do Backend para o fluxo de agendamento automático.

## 1. Listar Serviços
**Endpoint:** `GET /api/v1/servicos`
**Header:** `Authorization: Bearer {{TOKEN_AGENTE}}`
**Resposta esperada:** Lista de objetos com `id`, `nome`, `preco`, `duracao_minutos`.

## 2. Listar Profissionais
**Endpoint:** `GET /api/v1/profissionais`
**Header:** `Authorization: Bearer {{TOKEN_AGENTE}}`
**Resposta esperada:** Lista de objetos com `id`, `nome`, `especialidade`.

## 3. Verificar Disponibilidade
**Endpoint:** `GET /api/v1/horarios/disponibilidade`
**Parâmetros:** `profissional_id`, `data` (YYYY-MM-DD)
**Resposta esperada:** Lista de horários disponíveis (ex: `["09:00", "10:00", ...]`).

## 4. Criar Agendamento
**Endpoint:** `POST /api/v1/agendamentos`
**Header:** `Content-Type: application/json`
**Corpo:**
```json
{
  "cliente_id": 1,
  "servico_id": 1,
  "profissional_id": 1,
  "data_hora": "2024-05-15T10:00:00",
  "observacoes": "Agendado via WhatsApp"
}
```

## 5. Fluxo de Decisão no n8n
- **Trigger**: Webhook da Evolution API (Mensagem recebida).
- **Node IA**: Processa a mensagem usando o `prompt_sistema.md`.
- **Tool Calling**: A IA decide qual endpoint chamar baseado na dúvida do cliente.
- **Resposta**: Envia a mensagem de volta via Evolution API.
