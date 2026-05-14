from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, TokenResponse
from app.services.auth_service import AuthService

router = APIRouter()

@router.post("/register", response_model=TokenResponse, status_code=201)
def register(data: UsuarioCreate, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.register(data)

@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.login(form_data.username, form_data.password)

@router.post("/refresh", response_model=dict)
def refresh(refresh_token: str, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.refresh(refresh_token)

@router.get("/me", response_model=UsuarioResponse)
def me(current_user=Depends(get_current_user)):
    return UsuarioResponse.model_validate(current_user)
