from sqlalchemy.orm import Session
from app.models.tenant import Tenant
from typing import List, Optional


class TenantRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_todos(self) -> List[Tenant]:
        return self.db.query(Tenant).all()

    def buscar_por_id(self, id: int) -> Optional[Tenant]:
        return self.db.query(Tenant).filter(Tenant.id == id).first()

    def criar(self, tenant: Tenant) -> Tenant:
        self.db.add(tenant)
        self.db.commit()
        self.db.refresh(tenant)
        return tenant

    def atualizar(self, tenant: Tenant) -> Tenant:
        self.db.commit()
        self.db.refresh(tenant)
        return tenant

    def deletar(self, tenant: Tenant) -> None:
        self.db.delete(tenant)
        self.db.commit()
