from sqlalchemy.orm import Session
from app.models.servico import Servico
from typing import List, Optional


class ServicoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_tenant(self, tenant_id: int) -> List[Servico]:
        return self.db.query(Servico).filter(Servico.tenant_id == tenant_id).all()

    def buscar_por_id(self, id: int) -> Optional[Servico]:
        return self.db.query(Servico).filter(Servico.id == id).first()

    def criar(self, servico: Servico) -> Servico:
        self.db.add(servico)
        self.db.commit()
        self.db.refresh(servico)
        return servico

    def atualizar(self, servico: Servico) -> Servico:
        self.db.commit()
        self.db.refresh(servico)
        return servico

    def deletar(self, servico: Servico) -> None:
        self.db.delete(servico)
        self.db.commit()
