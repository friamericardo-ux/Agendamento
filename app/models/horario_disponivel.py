from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Time
from app.database import Base
from datetime import datetime


class HorarioDisponivel(Base):
    __tablename__ = "horarios_disponiveis"

    id = Column(Integer, primary_key=True, index=True)
    profissional_id = Column(Integer, ForeignKey("profissionais.id"), nullable=False, index=True)
    dia_semana = Column(Integer, nullable=False)  # 0=segunda, 6=domingo
    hora_inicio = Column(Time, nullable=False)
    hora_fim = Column(Time, nullable=False)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<HorarioDisponivel prof:{self.profissional_id} dia:{self.dia_semana}>"
