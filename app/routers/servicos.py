from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.usuario import Usuario
from app.schemas.servico import ServicoCreate, ServicoUpdate, ServicoResponse
from app.services.servico_service import ServicoService
from typing import List

router = APIRouter(prefix="/servicos", tags=["Serviços"])


@router.get("/", response_model=List[ServicoResponse])
def listar_servicos(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ServicoService(db)
    return service.listar(usuario.tenant_id)


@router.get("/{servico_id}", response_model=ServicoResponse)
def buscar_servico(
    servico_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ServicoService(db)
    return service.buscar(servico_id, usuario.tenant_id)


@router.post("/", response_model=ServicoResponse, status_code=status.HTTP_201_CREATED)
def criar_servico(
    data: ServicoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ServicoService(db)
    return service.criar(data, usuario.tenant_id)


@router.put("/{servico_id}", response_model=ServicoResponse)
def atualizar_servico(
    servico_id: int,
    data: ServicoUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ServicoService(db)
    return service.atualizar(servico_id, data, usuario.tenant_id)


@router.delete("/{servico_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_servico(
    servico_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ServicoService(db)
    service.deletar(servico_id, usuario.tenant_id)
