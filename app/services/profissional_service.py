from sqlalchemy.orm import Session
from app.repositories.profissional_repository import ProfissionalRepository
from app.models.profissional import Profissional
from app.schemas.profissional import ProfissionalCreate, ProfissionalUpdate
from fastapi import HTTPException, status
from typing import List


class ProfissionalService:
    def __init__(self, db: Session):
        self.repo = ProfissionalRepository(db)

    def listar(self, tenant_id: int) -> List[Profissional]:
        return self.repo.listar_por_tenant(tenant_id)

    def buscar(self, id: int, tenant_id: int) -> Profissional:
        profissional = self.repo.buscar_por_id(id)
        if not profissional:
            raise HTTPException(status_code=404, detail="Profissional não encontrado")
        if profissional.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="Acesso negado a este profissional")
        return profissional

    def criar(self, data: ProfissionalCreate, tenant_id: int) -> Profissional:
        profissional = Profissional(
            tenant_id=tenant_id,
            nome=data.nome,
            especialidade=data.especialidade,
            whatsapp=data.whatsapp
        )
        return self.repo.criar(profissional)

    def atualizar(self, id: int, data: ProfissionalUpdate, tenant_id: int) -> Profissional:
        profissional = self.buscar(id, tenant_id)

        if data.nome is not None:
            profissional.nome = data.nome
        if data.especialidade is not None:
            profissional.especialidade = data.especialidade
        if data.whatsapp is not None:
            profissional.whatsapp = data.whatsapp
        if data.ativo is not None:
            profissional.ativo = data.ativo

        return self.repo.atualizar(profissional)

    def deletar(self, id: int, tenant_id: int) -> None:
        profissional = self.buscar(id, tenant_id)
        self.repo.deletar(profissional)
