from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.usuario import Usuario
from app.schemas.horario_disponivel import HorarioDisponivelCreate, HorarioDisponivelUpdate, HorarioDisponivelResponse
from app.services.horario_disponivel_service import HorarioDisponivelService
from typing import List

router = APIRouter(prefix="/horarios", tags=["Horários Disponíveis"])


@router.get("/profissional/{profissional_id}", response_model=List[HorarioDisponivelResponse])
def listar_horarios_profissional(
    profissional_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = HorarioDisponivelService(db)
    return service.listar_por_profissional(profissional_id, usuario.tenant_id)


@router.get("/{horario_id}", response_model=HorarioDisponivelResponse)
def buscar_horario(
    horario_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = HorarioDisponivelService(db)
    return service.buscar(horario_id, usuario.tenant_id)


@router.post("/", response_model=HorarioDisponivelResponse, status_code=status.HTTP_201_CREATED)
def criar_horario(
    data: HorarioDisponivelCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = HorarioDisponivelService(db)
    return service.criar(data, usuario.tenant_id)


@router.put("/{horario_id}", response_model=HorarioDisponivelResponse)
def atualizar_horario(
    horario_id: int,
    data: HorarioDisponivelUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = HorarioDisponivelService(db)
    return service.atualizar(horario_id, data, usuario.tenant_id)


@router.delete("/{horario_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_horario(
    horario_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = HorarioDisponivelService(db)
    service.deletar(horario_id, usuario.tenant_id)
