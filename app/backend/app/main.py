from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import auth, clientes

app = FastAPI(title="Agendamentos Automação", version="1.0.0")

Base.metadata.create_all(bind=engine)

origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in origins else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Autenticação"])
app.include_router(clientes.router, prefix="/api/v1", tags=["Clientes"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
