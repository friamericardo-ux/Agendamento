from sqlalchemy.orm import Session
from app.models.usuario import Usuario, TipoUsuario
from typing import Optional

class UsuarioRepository:
    def __init__(self, db: Session):
        self.db = db

    def buscar_por_id(self, id: int) -> Optional[Usuario]:
        return self.db.query(Usuario).filter(Usuario.id == id).first()

    def buscar_por_email(self, email: str) -> Optional[Usuario]:
        return self.db.query(Usuario).filter(Usuario.email == email).first()

    def criar(self, email: str, senha_hash: str, nome: str, whatsapp: Optional[str], tipo: TipoUsuario, tenant_id: Optional[int] = None) -> Usuario:
        usuario = Usuario(
            email=email,
            senha_hash=senha_hash,
            nome=nome,
            whatsapp=whatsapp,
            tipo=tipo,
            tenant_id=tenant_id
        )
        self.db.add(usuario)
        self.db.commit()
        self.db.refresh(usuario)
        return usuario
