from fastapi import Depends, Header, HTTPException, status
from jose import JWTError, ExpiredSignatureError
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.auth.jwt import verificar_token
from app.config import settings
from app.repositories.usuario_repository import UsuarioRepository

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    try:
        token = authorization.replace("Bearer ", "")
        payload = verificar_token(token, settings.SECRET_KEY)
    except (JWTError, ExpiredSignatureError, Exception):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido ou expirado")
    usuario_repo = UsuarioRepository(db)
    user = usuario_repo.buscar_por_id(int(payload.get("sub")))
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    return user

def get_tenant(current_user=Depends(get_current_user)):
    return current_user.tenant