from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.usuario import Usuario
from app.schemas.profissional import ProfissionalCreate, ProfissionalUpdate, ProfissionalResponse
from app.services.profissional_service import ProfissionalService
from typing import List

router = APIRouter(prefix="/profissionais", tags=["Profissionais"])


@router.get("/", response_model=List[ProfissionalResponse])
def listar_profissionais(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ProfissionalService(db)
    return service.listar(usuario.tenant_id)


@router.get("/{profissional_id}", response_model=ProfissionalResponse)
def buscar_profissional(
    profissional_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ProfissionalService(db)
    return service.buscar(profissional_id, usuario.tenant_id)


@router.post("/", response_model=ProfissionalResponse, status_code=status.HTTP_201_CREATED)
def criar_profissional(
    data: ProfissionalCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ProfissionalService(db)
    return service.criar(data, usuario.tenant_id)


@router.put("/{profissional_id}", response_model=ProfissionalResponse)
def atualizar_profissional(
    profissional_id: int,
    data: ProfissionalUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ProfissionalService(db)
    return service.atualizar(profissional_id, data, usuario.tenant_id)


@router.delete("/{profissional_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_profissional(
    profissional_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ProfissionalService(db)
    service.deletar(profissional_id, usuario.tenant_id)
