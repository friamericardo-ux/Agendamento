from sqlalchemy.orm import Session
from app.repositories.cliente_repository import ClienteRepository
from app.models.cliente import Cliente
from app.schemas.cliente import ClienteCreate, ClienteUpdate
from fastapi import HTTPException, status
from typing import List


class ClienteService:
    def __init__(self, db: Session):
        self.repo = ClienteRepository(db)

    def listar(self, tenant_id: int) -> List[Cliente]:
        return self.repo.listar_por_tenant(tenant_id)

    def buscar(self, id: int, tenant_id: int) -> Cliente:
        cliente = self.repo.buscar_por_id(id)
        if not cliente:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")
        if cliente.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="Acesso negado a este cliente")
        return cliente

    def criar(self, data: ClienteCreate, tenant_id: int) -> Cliente:
        if data.email:
            existente = self.repo.buscar_por_email_tenant(data.email, tenant_id)
            if existente:
                raise HTTPException(status_code=400, detail="Email já cadastrado para este tenant")

        cliente = Cliente(
            tenant_id=tenant_id,
            nome=data.nome,
            email=data.email,
            whatsapp=data.whatsapp,
            observacoes=data.observacoes
        )
        return self.repo.criar(cliente)

    def atualizar(self, id: int, data: ClienteUpdate, tenant_id: int) -> Cliente:
        cliente = self.buscar(id, tenant_id)

        if data.nome is not None:
            cliente.nome = data.nome
        if data.email is not None:
            if data.email != cliente.email:
                existente = self.repo.buscar_por_email_tenant(data.email, tenant_id)
                if existente:
                    raise HTTPException(status_code=400, detail="Email já cadastrado para este tenant")
            cliente.email = data.email
        if data.whatsapp is not None:
            cliente.whatsapp = data.whatsapp
        if data.observacoes is not None:
            cliente.observacoes = data.observacoes

        return self.repo.atualizar(cliente)

    def deletar(self, id: int, tenant_id: int) -> None:
        cliente = self.buscar(id, tenant_id)
        self.repo.deletar(cliente)
