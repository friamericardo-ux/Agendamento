from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.usuario import UsuarioCreate, TokenResponse, UsuarioResponse
from app.auth.jwt import criar_access_token, criar_refresh_token, verificar_token
from app.config import settings
from passlib.context import CryptContext

from app.repositories.tenant_repository import TenantRepository
from app.models.tenant import Tenant

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = UsuarioRepository(db)
        self.tenant_repo = TenantRepository(db)

    def register(self, data: UsuarioCreate) -> TokenResponse:
        existing = self.repo.buscar_por_email(data.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email já cadastrado")

        # Criar Tenant se nome_negocio for fornecido
        tenant_id = None
        if data.nome_negocio:
            tenant = Tenant(nome_negocio=data.nome_negocio)
            self.db.add(tenant)
            self.db.commit()
            self.db.refresh(tenant)
            tenant_id = tenant.id

        senha_hash = pwd_context.hash(data.senha)
        usuario = self.repo.criar(
            email=data.email,
            senha_hash=senha_hash,
            nome=data.nome,
            whatsapp=data.whatsapp,
            tipo=data.tipo,
            tenant_id=tenant_id
        )

        access_token = criar_access_token({"sub": str(usuario.id), "tenant": str(usuario.tenant_id)})
        refresh_token = criar_refresh_token({"sub": str(usuario.id), "tenant": str(usuario.tenant_id)})

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            usuario=UsuarioResponse.model_validate(usuario)
        )

    def login(self, email: str, senha: str) -> TokenResponse:
        usuario = self.repo.buscar_por_email(email)
        if not usuario or not pwd_context.verify(senha, usuario.senha_hash):
            raise HTTPException(status_code=401, detail="Email ou senha inválidos")

        if not usuario.ativo:
            raise HTTPException(status_code=403, detail="Usuário desativado")

        access_token = criar_access_token({"sub": str(usuario.id), "tenant": str(usuario.tenant_id)})
        refresh_token = criar_refresh_token({"sub": str(usuario.id), "tenant": str(usuario.tenant_id)})

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            usuario=UsuarioResponse.model_validate(usuario)
        )

    def refresh(self, refresh_token: str) -> dict:
        payload = verificar_token(refresh_token, settings.REFRESH_SECRET_KEY)
        usuario_id = int(payload.get("sub"))
        usuario = self.repo.buscar_por_id(usuario_id)

        if not usuario or not usuario.ativo:
            raise HTTPException(status_code=401, detail="Token inválido ou usuário inativo")

        new_access = criar_access_token({"sub": str(usuario.id), "tenant": str(usuario.tenant_id)})
        new_refresh = criar_refresh_token({"sub": str(usuario.id), "tenant": str(usuario.tenant_id)})

        return {"access_token": new_access, "refresh_token": new_refresh, "token_type": "bearer"}
