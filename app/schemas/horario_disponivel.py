from pydantic import BaseModel, Field
from typing import Optional
from datetime import time, datetime


class HorarioDisponivelCreate(BaseModel):
    profissional_id: int
    dia_semana: int = Field(..., ge=0, le=6)  # 0=segunda, 6=domingo
    hora_inicio: time
    hora_fim: time


class HorarioDisponivelUpdate(BaseModel):
    dia_semana: Optional[int] = Field(None, ge=0, le=6)
    hora_inicio: Optional[time] = None
    hora_fim: Optional[time] = None
    ativo: Optional[bool] = None


class HorarioDisponivelResponse(BaseModel):
    id: int
    profissional_id: int
    dia_semana: int
    hora_inicio: time
    hora_fim: time
    ativo: bool
    criado_em: datetime
    atualizado_em: datetime

    model_config = {"from_attributes": True}
