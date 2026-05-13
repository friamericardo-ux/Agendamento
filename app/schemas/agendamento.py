from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import enum


class StatusAgendamento(str, enum.Enum):
    pendente = "pendente"
    confirmado = "confirmado"
    cancelado = "cancelado"
    concluido = "concluido"


class AgendamentoCreate(BaseModel):
    cliente_id: int
    profissional_id: int
    servico_id: int
    data_hora: datetime
    observacoes: Optional[str] = None


class AgendamentoUpdate(BaseModel):
    status: Optional[StatusAgendamento] = None
    data_hora: Optional[datetime] = None
    observacoes: Optional[str] = None


class AgendamentoResponse(BaseModel):
    id: int
    tenant_id: int
    cliente_id: int
    profissional_id: int
    servico_id: int
    data_hora: datetime
    status: str
    observacoes: Optional[str] = None
    criado_em: datetime
    atualizado_em: datetime

    model_config = {"from_attributes": True}
