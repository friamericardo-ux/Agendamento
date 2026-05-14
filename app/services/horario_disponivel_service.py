from sqlalchemy.orm import Session
from app.repositories.horario_disponivel_repository import HorarioDisponivelRepository
from app.repositories.profissional_repository import ProfissionalRepository
from app.models.horario_disponivel import HorarioDisponivel
from app.schemas.horario_disponivel import HorarioDisponivelCreate, HorarioDisponivelUpdate
from fastapi import HTTPException, status
from typing import List


class HorarioDisponivelService:
    def __init__(self, db: Session):
        self.repo = HorarioDisponivelRepository(db)
        self.prof_repo = ProfissionalRepository(db)

    def listar_por_profissional(self, profissional_id: int, tenant_id: int) -> List[HorarioDisponivel]:
        # Verificar se o profissional pertence ao tenant
        prof = self.prof_repo.buscar_por_id(profissional_id)
        if not prof or prof.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="Acesso negado aos horários deste profissional")
        
        return self.repo.listar_por_profissional(profissional_id)

    def buscar(self, id: int, tenant_id: int) -> HorarioDisponivel:
        horario = self.repo.buscar_por_id(id)
        if not horario:
            raise HTTPException(status_code=404, detail="Horário não encontrado")
        
        # Verificar se o profissional dono do horário pertence ao tenant
        prof = self.prof_repo.buscar_por_id(horario.profissional_id)
        if not prof or prof.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="Acesso negado a este horário")
            
        return horario

    def criar(self, data: HorarioDisponivelCreate, tenant_id: int) -> HorarioDisponivel:
        # Verificar se o profissional pertence ao tenant
        prof = self.prof_repo.buscar_por_id(data.profissional_id)
        if not prof or prof.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="Acesso negado para criar horário para este profissional")

        horario = HorarioDisponivel(
            profissional_id=data.profissional_id,
            dia_semana=data.dia_semana,
            hora_inicio=data.hora_inicio,
            hora_fim=data.hora_fim
        )
        return self.repo.criar(horario)

    def atualizar(self, id: int, data: HorarioDisponivelUpdate, tenant_id: int) -> HorarioDisponivel:
        horario = self.buscar(id, tenant_id)

        if data.dia_semana is not None:
            horario.dia_semana = data.dia_semana
        if data.hora_inicio is not None:
            horario.hora_inicio = data.hora_inicio
        if data.hora_fim is not None:
            horario.hora_fim = data.hora_fim
        if data.ativo is not None:
            horario.ativo = data.ativo

        return self.repo.atualizar(horario)

    def deletar(self, id: int, tenant_id: int) -> None:
        horario = self.buscar(id, tenant_id)
        self.repo.deletar(horario)
