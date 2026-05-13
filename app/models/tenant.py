from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database import Base
from datetime import datetime


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    nome_negocio = Column(String(255), nullable=False)
    tipo_negocio = Column(String(100), nullable=True)
    telefone = Column(String(20), nullable=True)
    plano = Column(String(50), default="basico")  # basico, profissional, premium
    horario_funcionamento = Column(String(500), nullable=True) # JSON ou texto
    ativo = Column(Boolean, default=True)
    evolution_instance = Column(String(100), nullable=True, unique=True)
    bot_email = Column(String(255), nullable=True)
    bot_password = Column(String(255), nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Tenant {self.nome_negocio}>"
