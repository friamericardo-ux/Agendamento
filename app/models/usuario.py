from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
import enum
from datetime import datetime

class TipoUsuario(str, enum.Enum):
    admin = "admin"
    profissional = "profissional"
    cliente = "cliente"

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True, index=True)
    
    tenant = relationship("Tenant", backref="usuarios")
    email = Column(String(255), unique=True, nullable=False, index=True)
    senha_hash = Column(String(255), nullable=False)
    nome = Column(String(255), nullable=False)
    whatsapp = Column(String(20), nullable=True)
    tipo = Column(SAEnum(TipoUsuario), default=TipoUsuario.cliente, nullable=False)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Usuario {self.email}>"
