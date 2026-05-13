from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.usuario import Usuario
from app.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteResponse
from app.services.cliente_service import ClienteService
from typing import List

router = APIRouter(prefix="/clientes", tags=["Clientes"])


@router.get("/", response_model=List[ClienteResponse])
def listar_clientes(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ClienteService(db)
    return service.listar(usuario.tenant_id)


@router.get("/{cliente_id}", response_model=ClienteResponse)
def buscar_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ClienteService(db)
    return service.buscar(cliente_id, usuario.tenant_id)


@router.post("/", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED)
def criar_cliente(
    data: ClienteCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ClienteService(db)
    return service.criar(data, usuario.tenant_id)


@router.put("/{cliente_id}", response_model=ClienteResponse)
def atualizar_cliente(
    cliente_id: int,
    data: ClienteUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ClienteService(db)
    return service.atualizar(cliente_id, data, usuario.tenant_id)


@router.delete("/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ClienteService(db)
    service.deletar(cliente_id, usuario.tenant_id)
