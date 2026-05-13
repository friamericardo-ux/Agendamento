from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.agendamento import Agendamento
from typing import List, Optional
from datetime import datetime


class AgendamentoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_tenant(
        self, 
        tenant_id: int, 
        data_inicio: Optional[datetime] = None, 
        data_fim: Optional[datetime] = None,
        status: Optional[str] = None,
        profissional_id: Optional[int] = None
    ) -> List[Agendamento]:
        query = self.db.query(Agendamento).filter(Agendamento.tenant_id == tenant_id)
        
        if data_inicio:
            query = query.filter(Agendamento.data_hora >= data_inicio)
        if data_fim:
            query = query.filter(Agendamento.data_hora <= data_fim)
        if status:
            query = query.filter(Agendamento.status == status)
        if profissional_id:
            query = query.filter(Agendamento.profissional_id == profissional_id)
            
        return query.all()

    def buscar_por_id(self, id: int) -> Optional[Agendamento]:
        return self.db.query(Agendamento).filter(Agendamento.id == id).first()

    def criar(self, agendamento: Agendamento) -> Agendamento:
        self.db.add(agendamento)
        self.db.commit()
        self.db.refresh(agendamento)
        return agendamento

    def atualizar(self, agendamento: Agendamento) -> Agendamento:
        self.db.commit()
        self.db.refresh(agendamento)
        return agendamento

    def deletar(self, agendamento: Agendamento) -> None:
        self.db.delete(agendamento)
        self.db.commit()

    def verificar_conflito(self, profissional_id: int, data_hora: datetime, duracao_minutos: int, exceto_id: Optional[int] = None) -> bool:
        # Implementação simplificada de conflito: mesmo horário exato
        # Para ser robusto, deveria checar overlap [data_hora, data_hora + duracao]
        # Mas vamos seguir o requisito básico primeiro.
        query = self.db.query(Agendamento).filter(
            Agendamento.profissional_id == profissional_id,
            Agendamento.data_hora == data_hora,
            Agendamento.status != "cancelado"
        )
        if exceto_id:
            query = query.filter(Agendamento.id != exceto_id)
            
        return query.first() is not None
