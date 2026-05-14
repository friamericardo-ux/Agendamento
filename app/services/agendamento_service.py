from sqlalchemy.orm import Session
from app.repositories.agendamento_repository import AgendamentoRepository
from app.repositories.servico_repository import ServicoRepository
from app.repositories.horario_disponivel_repository import HorarioDisponivelRepository
from app.models.agendamento import Agendamento
from app.schemas.agendamento import AgendamentoCreate, AgendamentoUpdate
from fastapi import HTTPException, status
from typing import List, Optional
from datetime import datetime


class AgendamentoService:
    def __init__(self, db: Session):
        self.repo = AgendamentoRepository(db)
        self.servico_repo = ServicoRepository(db)
        self.horario_repo = HorarioDisponivelRepository(db)

    def listar(
        self, 
        tenant_id: int, 
        data_inicio: Optional[datetime] = None, 
        data_fim: Optional[datetime] = None,
        status: Optional[str] = None,
        profissional_id: Optional[int] = None
    ) -> List[Agendamento]:
        return self.repo.listar_por_tenant(tenant_id, data_inicio, data_fim, status, profissional_id)

    def buscar(self, id: int, tenant_id: int) -> Agendamento:
        agendamento = self.repo.buscar_por_id(id)
        if not agendamento:
            raise HTTPException(status_code=404, detail="Agendamento não encontrado")
        if agendamento.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="Acesso negado a este agendamento")
        return agendamento

    def criar(self, data: AgendamentoCreate, tenant_id: int) -> Agendamento:
        # Buscar duração do serviço para verificar conflito (idealmente)
        servico = self.servico_repo.buscar_por_id(data.servico_id)
        if not servico or servico.tenant_id != tenant_id:
            raise HTTPException(status_code=400, detail="Serviço inválido")

        # Verificar conflito de horário
        if self.repo.verificar_conflito(data.profissional_id, data.data_hora, servico.duracao_minutos):
            raise HTTPException(status_code=400, detail="Este profissional já possui um agendamento neste horário")

        agendamento = Agendamento(
            tenant_id=tenant_id,
            cliente_id=data.cliente_id,
            profissional_id=data.profissional_id,
            servico_id=data.servico_id,
            data_hora=data.data_hora,
            status="pendente",
            observacoes=data.observacoes
        )
        return self.repo.criar(agendamento)

    def atualizar(self, id: int, data: AgendamentoUpdate, tenant_id: int) -> Agendamento:
        agendamento = self.buscar(id, tenant_id)

        if data.data_hora is not None and data.data_hora != agendamento.data_hora:
            # Re-verificar conflito se mudar horário
            servico = self.servico_repo.buscar_por_id(agendamento.servico_id)
            if self.repo.verificar_conflito(agendamento.profissional_id, data.data_hora, servico.duracao_minutos, exceto_id=id):
                raise HTTPException(status_code=400, detail="Conflito de horário")
            agendamento.data_hora = data.data_hora

        if data.status is not None:
            agendamento.status = data.status.value
        if data.observacoes is not None:
            agendamento.observacoes = data.observacoes

        return self.repo.atualizar(agendamento)

    def deletar(self, id: int, tenant_id: int) -> None:
        agendamento = self.buscar(id, tenant_id)
        self.repo.deletar(agendamento)

    def listar_disponibilidade(self, profissional_id: int, data: datetime, tenant_id: int) -> List[str]:
        # 1. Buscar horários base do profissional para este dia da semana
        dia_semana = data.weekday() # 0=Segunda, 6=Domingo (mesmo que definimos)
        horarios_base = self.horario_repo.listar_por_profissional(profissional_id)
        horarios_dia = [h for h in horarios_base if h.dia_semana == dia_semana and h.ativo]
        
        if not horarios_dia:
            return []

        # 2. Buscar agendamentos já existentes para este profissional nesta data
        inicio_dia = data.replace(hour=0, minute=0, second=0, microsecond=0)
        fim_dia = data.replace(hour=23, minute=59, second=59, microsecond=999)
        agendamentos_existentes = self.repo.listar_por_tenant(
            tenant_id=tenant_id, 
            data_inicio=inicio_dia, 
            data_fim=fim_dia, 
            profissional_id=profissional_id
        )

        # 3. Gerar slots (ex: a cada 30 min)
        slots_disponiveis = []
        import datetime as dt_module # usar alias para não conflitar com parâmetro 'data'

        for h_base in horarios_dia:
            atual = dt_module.datetime.combine(data.date(), h_base.hora_inicio)
            fim = dt_module.datetime.combine(data.date(), h_base.hora_fim)
            
            while atual < fim:
                # Verificar se este 'atual' conflita com algum agendamento
                conflito = False
                for ag in agendamentos_existentes:
                    # Se o slot inicia durante um agendamento existente
                    # Simplificação: assumimos 30 min de duração se não soubermos
                    if ag.status != 'cancelado' and ag.data_hora <= atual < (ag.data_hora + dt_module.timedelta(minutes=30)):
                        conflito = True
                        break
                
                if not conflito:
                    slots_disponiveis.append(atual.strftime("%H:%M"))
                
                atual += dt_module.timedelta(minutes=30)

        return sorted(list(set(slots_disponiveis)))
