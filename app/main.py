from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import auth, clientes, profissionais, servicos, horarios, agendamentos, tenants, internal

app = FastAPI(title="Agendamentos Automação", version="1.0.0", redirect_slashes=False)

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
app.include_router(profissionais.router, prefix="/api/v1", tags=["Profissionais"])
app.include_router(servicos.router, prefix="/api/v1", tags=["Serviços"])
app.include_router(horarios.router, prefix="/api/v1", tags=["Horários Disponíveis"])
app.include_router(agendamentos.router, prefix="/api/v1", tags=["Agendamentos"])
app.include_router(tenants.router, prefix="/api/v1", tags=["Tenants"])
app.include_router(internal.router, prefix="/internal")

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)