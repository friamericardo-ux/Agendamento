from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from app.database import Base
from datetime import datetime


class Servico(Base):
    __tablename__ = "servicos"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    nome = Column(String(255), nullable=False)
    descricao = Column(String(500), nullable=True)
    duracao_minutos = Column(Integer, nullable=False)
    preco = Column(Float, nullable=True)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Servico {self.nome}>"
