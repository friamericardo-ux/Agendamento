from sqlalchemy.orm import Session
from app.repositories.tenant_repository import TenantRepository
from app.models.tenant import Tenant
from app.schemas.tenant import TenantCreate, TenantUpdate
from fastapi import HTTPException, status
from typing import List


class TenantService:
    def __init__(self, db: Session):
        self.repo = TenantRepository(db)

    def listar(self) -> List[Tenant]:
        return self.repo.listar_todos()

    def buscar(self, id: int) -> Tenant:
        tenant = self.repo.buscar_por_id(id)
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant não encontrado")
        return tenant

    def criar(self, data: TenantCreate) -> Tenant:
        tenant = Tenant(
            nome_negocio=data.nome_negocio,
            tipo_negocio=data.tipo_negocio,
            telefone=data.telefone,
            plano=data.plano
        )
        return self.repo.criar(tenant)

    def atualizar(self, id: int, data: TenantUpdate) -> Tenant:
        tenant = self.buscar(id)

        if data.nome_negocio is not None:
            tenant.nome_negocio = data.nome_negocio
        if data.tipo_negocio is not None:
            tenant.tipo_negocio = data.tipo_negocio
        if data.telefone is not None:
            tenant.telefone = data.telefone
        if data.plano is not None:
            tenant.plano = data.plano
        if data.horario_funcionamento is not None:
            tenant.horario_funcionamento = data.horario_funcionamento
        if data.ativo is not None:
            tenant.ativo = data.ativo
        if data.evolution_instance is not None:
            tenant.evolution_instance = data.evolution_instance
        if data.bot_email is not None:
            tenant.bot_email = data.bot_email
        if data.bot_password is not None:
            tenant.bot_password = data.bot_password

        return self.repo.atualizar(tenant)

    def deletar(self, id: int) -> None:
        tenant = self.buscar(id)
        self.repo.deletar(tenant)
