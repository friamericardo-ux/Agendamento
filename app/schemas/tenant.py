from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TenantCreate(BaseModel):
    nome_negocio: str = Field(..., max_length=255)
    tipo_negocio: Optional[str] = Field(None, max_length=100)
    telefone: Optional[str] = Field(None, max_length=20)
    plano: Optional[str] = Field("basico", max_length=50)


class TenantUpdate(BaseModel):
    nome_negocio: Optional[str] = Field(None, max_length=255)
    tipo_negocio: Optional[str] = Field(None, max_length=100)
    telefone: Optional[str] = Field(None, max_length=20)
    plano: Optional[str] = Field(None, max_length=50)
    horario_funcionamento: Optional[str] = Field(None, max_length=500)
    ativo: Optional[bool] = None
    evolution_instance: Optional[str] = None
    bot_email: Optional[str] = None
    bot_password: Optional[str] = None


class TenantResponse(BaseModel):
    id: int
    nome_negocio: str
    tipo_negocio: Optional[str] = None
    telefone: Optional[str] = None
    plano: str
    horario_funcionamento: Optional[str] = None
    ativo: bool
    criado_em: datetime
    atualizado_em: datetime

    model_config = {"from_attributes": True}
