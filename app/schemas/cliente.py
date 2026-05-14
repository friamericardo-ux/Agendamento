from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class ClienteCreate(BaseModel):
    nome: str
    email: Optional[EmailStr] = None
    whatsapp: Optional[str] = None
    observacoes: Optional[str] = None


class ClienteUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    whatsapp: Optional[str] = None
    observacoes: Optional[str] = None


class ClienteResponse(BaseModel):
    id: int
    tenant_id: int
    nome: str
    email: Optional[str] = None
    whatsapp: Optional[str] = None
    observacoes: Optional[str] = None
    criado_em: Optional[datetime] = None
    atualizado_em: Optional[datetime] = None

    model_config = {"from_attributes": True}
