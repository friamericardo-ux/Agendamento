from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ServicoCreate(BaseModel):
    nome: str = Field(..., max_length=255)
    descricao: Optional[str] = Field(None, max_length=500)
    duracao_minutos: int = Field(..., gt=0)
    preco: Optional[float] = Field(None, ge=0)


class ServicoUpdate(BaseModel):
    nome: Optional[str] = Field(None, max_length=255)
    descricao: Optional[str] = Field(None, max_length=500)
    duracao_minutos: Optional[int] = Field(None, gt=0)
    preco: Optional[float] = Field(None, ge=0)
    ativo: Optional[bool] = None


class ServicoResponse(BaseModel):
    id: int
    tenant_id: int
    nome: str
    descricao: Optional[str] = None
    duracao_minutos: int
    preco: Optional[float] = None
    ativo: bool
    criado_em: datetime
    atualizado_em: datetime

    model_config = {"from_attributes": True}
