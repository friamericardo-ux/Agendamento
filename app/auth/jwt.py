from jose import JWTError, jwt
from datetime import datetime, timedelta
from app.config import settings

def criar_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=15)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

def criar_refresh_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(days=7)
    return jwt.encode(payload, settings.REFRESH_SECRET_KEY, algorithm="HS256")

def verificar_token(token: str, secret: str) -> dict:
    try:
        return jwt.decode(token, secret, algorithms=["HS256"], options={"verify_sub": False})
    except JWTError:
        raise
