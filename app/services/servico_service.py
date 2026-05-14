from sqlalchemy.orm import Session
from app.repositories.servico_repository import ServicoRepository
from app.models.servico import Servico
from app.schemas.servico import ServicoCreate, ServicoUpdate
from fastapi import HTTPException, status
from typing import List


class ServicoService:
    def __init__(self, db: Session):
        self.repo = ServicoRepository(db)

    def listar(self, tenant_id: int) -> List[Servico]:
        return self.repo.listar_por_tenant(tenant_id)

    def buscar(self, id: int, tenant_id: int) -> Servico:
        servico = self.repo.buscar_por_id(id)
        if not servico:
            raise HTTPException(status_code=404, detail="Serviço não encontrado")
        if servico.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="Acesso negado a este serviço")
        return servico

    def criar(self, data: ServicoCreate, tenant_id: int) -> Servico:
        servico = Servico(
            tenant_id=tenant_id,
            nome=data.nome,
            descricao=data.descricao,
            duracao_minutos=data.duracao_minutos,
            preco=data.preco
        )
        return self.repo.criar(servico)

    def atualizar(self, id: int, data: ServicoUpdate, tenant_id: int) -> Servico:
        servico = self.buscar(id, tenant_id)

        if data.nome is not None:
            servico.nome = data.nome
        if data.descricao is not None:
            servico.descricao = data.descricao
        if data.duracao_minutos is not None:
            servico.duracao_minutos = data.duracao_minutos
        if data.preco is not None:
            servico.preco = data.preco
        if data.ativo is not None:
            servico.ativo = data.ativo

        return self.repo.atualizar(servico)

    def deletar(self, id: int, tenant_id: int) -> None:
        servico = self.buscar(id, tenant_id)
        self.repo.deletar(servico)
