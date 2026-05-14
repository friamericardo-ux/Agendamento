from fastapi import APIRouter, Header, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.config import settings
from app.models.tenant import Tenant

router = APIRouter(tags=["Internal"])


def verify_internal_key(x_internal_key: str = Header(...)):
    if x_internal_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing internal API key")
    return True


@router.get("/tenant/by-instance")
def buscar_tenant_por_instance(
    instance: str = Query(...),
    db: Session = Depends(get_db),
    _=Depends(verify_internal_key),
):
    tenant = db.query(Tenant).filter(Tenant.evolution_instance == instance).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant não encontrado para esta instância")
    return {
        "tenant_id": tenant.id,
        "bot_email": tenant.bot_email,
        "bot_password": tenant.bot_password,
        "nome_negocio": tenant.nome_negocio,
    }
