# Skill: FastAPI — Backend Moderno com Python

## Quando usar esta skill
Use sempre que a tarefa envolver criação ou manutenção de um backend com FastAPI. Isso inclui: criar APIs REST, autenticação JWT, integração com banco de dados MySQL via SQLAlchemy, validação de dados com Pydantic, e deploy com Coolify/Gunicorn.

---

## Stack Padrão

| Camada | Tecnologia |
|---|---|
| Framework | FastAPI |
| ORM | SQLAlchemy 2.x (async ou sync) |
| Banco | MySQL 8.4 via PyMySQL |
| Validação | Pydantic v2 |
| Autenticação | JWT (python-jose) + bcrypt (passlib) |
| Variáveis de ambiente | python-dotenv |
| Servidor | Uvicorn (dev) / Gunicorn + Uvicorn workers (prod) |
| Migrações | Scripts SQL versionados (001_, 002_, etc.) |

---

## Estrutura de Pastas Obrigatória

```
backend/
├── app/
│   ├── main.py               # Instância do FastAPI, routers, middlewares
│   ├── database.py           # Conexão SQLAlchemy, SessionLocal, Base
│   ├── config.py             # Configurações via .env
│   ├── dependencies.py       # get_db, get_current_user, get_tenant, etc.
│   ├── models/               # Models SQLAlchemy (um arquivo por entidade)
│   │   ├── __init__.py
│   │   ├── tenant.py
│   │   ├── usuario.py
│   │   └── ...
│   ├── schemas/              # Pydantic schemas (Request/Response)
│   │   ├── __init__.py
│   │   ├── usuario.py
│   │   └── ...
│   ├── routers/              # Endpoints HTTP (um arquivo por domínio)
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── agendamentos.py
│   │   └── ...
│   ├── services/             # Regras de negócio (chamado pelos routers)
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   └── ...
│   ├── repositories/         # Acesso ao banco (chamado pelos services)
│   │   ├── __init__.py
│   │   └── ...
│   └── migrations/           # SQLs versionados
│       └── 001_initial.sql
├── .env
├── .env.example
├── requirements.txt
└── Procfile
```

---

## Regra de Ouro: Router → Service → Repository

**NUNCA coloque lógica de negócio no router.**

```python
# ✅ CORRETO
# router/agendamentos.py
@router.post("/agendamentos")
def criar(data: AgendamentoCreate, db: Session = Depends(get_db), tenant=Depends(get_tenant)):
    return agendamento_service.criar(db, data, tenant.id)

# service/agendamento_service.py
def criar(db, data, tenant_id):
    if _tem_conflito(db, data, tenant_id):
        raise HTTPException(400, "Horário indisponível")
    return agendamento_repo.inserir(db, data, tenant_id)

# repository/agendamento_repo.py
def inserir(db, data, tenant_id):
    obj = Agendamento(**data.model_dump(), tenant_id=tenant_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
```

---

## Models SQLAlchemy

```python
# app/models/agendamento.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from app.database import Base
import enum

class StatusAgendamento(str, enum.Enum):
    agendado = "agendado"
    confirmado = "confirmado"
    concluido = "concluido"
    cancelado = "cancelado"

class Agendamento(Base):
    __tablename__ = "agendamentos"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    servico_id = Column(Integer, ForeignKey("servicos.id"), nullable=False)
    profissional_id = Column(Integer, ForeignKey("profissionais.id"), nullable=True)
    data_hora = Column(DateTime, nullable=False)
    status = Column(Enum(StatusAgendamento), default=StatusAgendamento.agendado)
    observacoes = Column(String(500), nullable=True)
    criado_em = Column(DateTime, server_default="CURRENT_TIMESTAMP")
```

---

## Schemas Pydantic v2

```python
# app/schemas/agendamento.py
from pydantic import BaseModel
from datetime import datetime
from app.models.agendamento import StatusAgendamento

class AgendamentoCreate(BaseModel):
    cliente_id: int
    servico_id: int
    profissional_id: int | None = None
    data_hora: datetime
    observacoes: str | None = None

class AgendamentoResponse(AgendamentoCreate):
    id: int
    tenant_id: int
    status: StatusAgendamento
    criado_em: datetime

    model_config = {"from_attributes": True}
```

---

## Autenticação JWT

```python
# app/auth/jwt.py
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
        return jwt.decode(token, secret, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(401, "Token inválido ou expirado")
```

---

## Dependências Reutilizáveis

```python
# app/dependencies.py
from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.auth.jwt import verificar_token
from app.config import settings

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    token = authorization.replace("Bearer ", "")
    payload = verificar_token(token, settings.SECRET_KEY)
    user = usuario_repo.buscar_por_id(db, payload["sub"])
    if not user:
        raise HTTPException(401, "Usuário não encontrado")
    return user

def get_tenant(current_user=Depends(get_current_user)):
    return current_user.tenant
```

---

## Conexão com MySQL

```python
# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"ssl_disabled": True},  # necessário em algumas VPS
    pool_pre_ping=True,
    pool_recycle=3600,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

---

## Configuração via .env

```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    REFRESH_SECRET_KEY: str
    ALLOWED_ORIGINS: str = "*"

    class Config:
        env_file = ".env"

settings = Settings()
```

```env
# .env.example
DATABASE_URL=mysql+pymysql://user:senha@10.0.1.9:3306/agendazap
SECRET_KEY=troque-por-uma-chave-secreta-forte
REFRESH_SECRET_KEY=troque-por-outra-chave-secreta
ALLOWED_ORIGINS=https://seudominio.com.br
```

---

## Segurança — Checklist Obrigatório

- [ ] Senhas sempre com `bcrypt` via `passlib`
- [ ] JWT com expiração curta (15 min) + refresh token (7 dias)
- [ ] Rate limiting com `slowapi` nas rotas públicas e de login
- [ ] CORS configurado com origins explícitas (nunca `*` em produção)
- [ ] Validação de todos os inputs via Pydantic
- [ ] API Keys separadas do JWT para integrações externas (agente WhatsApp)
- [ ] Nunca expor stack trace em produção (`debug=False`)
- [ ] Variáveis sensíveis sempre em `.env`, nunca no código

---

## Migrações Versionadas

```
migrations/
├── 001_initial.sql
├── 002_add_historico.sql
└── runner.py         # Executa migrações pendentes no startup
```

```python
# migrations/runner.py
def executar_migracoes(db):
    db.execute("CREATE TABLE IF NOT EXISTS schema_migrations (versao VARCHAR(50) PRIMARY KEY, executado_em DATETIME DEFAULT NOW())")
    for arquivo in sorted(os.listdir("app/migrations")):
        if arquivo.endswith(".sql"):
            versao = arquivo.replace(".sql", "")
            existe = db.execute("SELECT 1 FROM schema_migrations WHERE versao = %s", (versao,)).fetchone()
            if not existe:
                with open(f"app/migrations/{arquivo}") as f:
                    db.execute(f.read())
                db.execute("INSERT IGNORE INTO schema_migrations (versao) VALUES (%s)", (versao,))
    db.commit()
```

---

## Procfile para Deploy (Coolify)

```
web: gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker --timeout 120 --bind 0.0.0.0:8000
```

---

## requirements.txt Base

```
fastapi
uvicorn[standard]
gunicorn
sqlalchemy
pymysql
pydantic[email]
pydantic-settings
python-jose[cryptography]
passlib[bcrypt]
python-dotenv
slowapi
```

---

## Boas Práticas Gerais

- Comentar código em **português**
- Um arquivo por entidade em `models/`, `schemas/`, `routers/`, `services/`, `repositories/`
- Nunca retornar senha ou dados sensíveis nos schemas de Response
- Sempre usar `model_config = {"from_attributes": True}` nos schemas de resposta
- Tratar erros com `HTTPException` com mensagens claras
- Usar `status_code` correto: 200, 201, 400, 401, 403, 404, 422, 500
