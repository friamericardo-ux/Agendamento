from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.usuario import Usuario
from app.schemas.tenant import TenantCreate, TenantUpdate, TenantResponse
from app.services.tenant_service import TenantService
from typing import List

router = APIRouter(prefix="/tenants", tags=["Tenants"])


@router.get("/me", response_model=TenantResponse)
def buscar_meu_tenant(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    if not usuario.tenant_id:
        raise HTTPException(status_code=404, detail="Tenant não encontrado")
    service = TenantService(db)
    return service.buscar(usuario.tenant_id)


@router.get("/", response_model=List[TenantResponse])
def listar_tenants(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    # Por enquanto, permitimos que qualquer usuário autenticado liste,
    # mas em produção isso seria restrito ao Super Admin.
    service = TenantService(db)
    return service.listar()


@router.get("/{tenant_id}", response_model=TenantResponse)
def buscar_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = TenantService(db)
    return service.buscar(tenant_id)


@router.post("/", response_model=TenantResponse, status_code=status.HTTP_201_CREATED)
def criar_tenant(
    data: TenantCreate,
    db: Session = Depends(get_db)
):
    service = TenantService(db)
    return service.criar(data)


@router.put("/{tenant_id}", response_model=TenantResponse)
def atualizar_tenant(
    tenant_id: int,
    data: TenantUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = TenantService(db)
    return service.atualizar(tenant_id, data)


@router.delete("/{tenant_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = TenantService(db)
    service.deletar(tenant_id)
