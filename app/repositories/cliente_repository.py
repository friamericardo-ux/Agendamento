from sqlalchemy.orm import Session
from app.models.cliente import Cliente
from typing import List, Optional


class ClienteRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_tenant(self, tenant_id: int) -> List[Cliente]:
        return self.db.query(Cliente).filter(Cliente.tenant_id == tenant_id).all()

    def buscar_por_id(self, id: int) -> Optional[Cliente]:
        return self.db.query(Cliente).filter(Cliente.id == id).first()

    def buscar_por_email_tenant(self, email: str, tenant_id: int) -> Optional[Cliente]:
        return self.db.query(Cliente).filter(
            Cliente.email == email,
            Cliente.tenant_id == tenant_id
        ).first()

    def criar(self, cliente: Cliente) -> Cliente:
        self.db.add(cliente)
        self.db.commit()
        self.db.refresh(cliente)
        return cliente

    def atualizar(self, cliente: Cliente) -> Cliente:
        self.db.commit()
        self.db.refresh(cliente)
        return cliente

    def deletar(self, cliente: Cliente) -> None:
        self.db.delete(cliente)
        self.db.commit()
