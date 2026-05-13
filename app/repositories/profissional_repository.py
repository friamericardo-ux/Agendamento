from sqlalchemy.orm import Session
from app.models.profissional import Profissional
from typing import List, Optional


class ProfissionalRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_tenant(self, tenant_id: int) -> List[Profissional]:
        return self.db.query(Profissional).filter(Profissional.tenant_id == tenant_id).all()

    def buscar_por_id(self, id: int) -> Optional[Profissional]:
        return self.db.query(Profissional).filter(Profissional.id == id).first()

    def criar(self, profissional: Profissional) -> Profissional:
        self.db.add(profissional)
        self.db.commit()
        self.db.refresh(profissional)
        return profissional

    def atualizar(self, profissional: Profissional) -> Profissional:
        self.db.commit()
        self.db.refresh(profissional)
        return profissional

    def deletar(self, profissional: Profissional) -> None:
        self.db.delete(profissional)
        self.db.commit()
