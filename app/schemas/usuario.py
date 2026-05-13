from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.usuario import TipoUsuario

class UsuarioCreate(BaseModel):
    email: EmailStr
    senha: str
    nome: str
    whatsapp: Optional[str] = None
    tipo: TipoUsuario = TipoUsuario.cliente
    nome_negocio: Optional[str] = None

class UsuarioResponse(BaseModel):
    id: int
    email: str
    nome: str
    whatsapp: Optional[str]
    tipo: TipoUsuario
    ativo: bool
    criado_em: Optional[datetime] = None

    model_config = {"from_attributes": True}

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    usuario: UsuarioResponse
