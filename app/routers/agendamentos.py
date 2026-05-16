from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.usuario import Usuario
from app.schemas.agendamento import AgendamentoCreate, AgendamentoUpdate, AgendamentoResponse
from app.services.agendamento_service import AgendamentoService
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/agendamentos", tags=["Agendamentos"])


@router.get("/", response_model=List[AgendamentoResponse])
def listar_agendamentos(
    data_inicio: Optional[datetime] = Query(None),
    data_fim: Optional[datetime] = Query(None),
    status: Optional[str] = Query(None),
    profissional_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = AgendamentoService(db)
    return service.listar(usuario.tenant_id, data_inicio, data_fim, status, profissional_id)



@router.get("/disponibilidade", response_model=List[str])
def listar_disponibilidade(
    profissional_id: int = Query(...),
    data: datetime = Query(...),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = AgendamentoService(db)
    return service.listar_disponibilidade(profissional_id, data, usuario.tenant_id)


@router.get("/{agendamento_id}", response_model=AgendamentoResponse)
def buscar_agendamento(
    agendamento_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = AgendamentoService(db)
    return service.buscar(agendamento_id, usuario.tenant_id)

@router.post("/", response_model=AgendamentoResponse, status_code=status.HTTP_201_CREATED)
def criar_agendamento(
    data: AgendamentoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = AgendamentoService(db)
    return service.criar(data, usuario.tenant_id)


@router.put("/{agendamento_id}", response_model=AgendamentoResponse)
def atualizar_agendamento(
    agendamento_id: int,
    data: AgendamentoUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = AgendamentoService(db)
    return service.atualizar(agendamento_id, data, usuario.tenant_id)


@router.delete("/{agendamento_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_agendamento(
    agendamento_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = AgendamentoService(db)
    service.deletar(agendamento_id, usuario.tenant_id)
