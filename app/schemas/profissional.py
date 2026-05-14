from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ProfissionalCreate(BaseModel):
    nome: str = Field(..., max_length=255)
    especialidade: Optional[str] = Field(None, max_length=255)
    whatsapp: Optional[str] = Field(None, max_length=20)


class ProfissionalUpdate(BaseModel):
    nome: Optional[str] = Field(None, max_length=255)
    especialidade: Optional[str] = Field(None, max_length=255)
    whatsapp: Optional[str] = Field(None, max_length=20)
    ativo: Optional[bool] = None


class ProfissionalResponse(BaseModel):
    id: int
    tenant_id: int
    nome: str
    especialidade: Optional[str] = None
    whatsapp: Optional[str] = None
    ativo: bool
    criado_em: datetime
    atualizado_em: datetime

    model_config = {"from_attributes": True}
