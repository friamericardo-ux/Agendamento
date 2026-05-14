# Flask — API REST Profissional

## Estrutura Obrigatória
```
api/
├── src/
│   ├── __init__.py
│   ├── config.py
│   ├── extensions.py      # db, jwt, cors, etc
│   ├── exceptions.py      # Exceções customizadas
│   ├── middlewares/
│   │   ├── auth.py        # Verificação de token
│   │   └── rate_limit.py  # Limite de requisições
│   ├── models/
│   │   └── usuario.py
│   ├── schemas/           # Validação entrada/saída (Marshmallow/Pydantic)
│   │   └── usuario_schema.py
│   ├── services/          # Lógica de negócio
│   │   └── usuario_service.py
│   ├── repositories/      # Acesso ao banco
│   │   └── usuario_repository.py
│   └── routes/            # Só roteamento, sem lógica
│       └── usuario_routes.py
├── tests/
├── migrations/
├── .env
├── .env.example
├── requirements.txt
└── run.py
```

## App Factory — Padrão Profissional
```python
# src/__init__.py
from flask import Flask
from .extensions import db, jwt, cors, migrate
from .routes import registrar_rotas
from .config import Config
from .exceptions import registrar_handlers

def criar_app(config=Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config)

    # Inicializa extensões
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={
        r"/api/*": {"origins": config.ORIGENS_PERMITIDAS}
    })
    migrate.init_app(app, db)

    # Registra rotas
    registrar_rotas(app)

    # Registra handlers de erro
    registrar_handlers(app)

    return app
```

## Rotas — Só roteamento, lógica no Service
```python
# routes/usuario_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services.usuario_service import UsuarioService
from ..schemas.usuario_schema import UsuarioSchema, CriarUsuarioSchema

bp = Blueprint("usuarios", __name__, url_prefix="/api/v1/usuarios")
schema = UsuarioSchema()
criar_schema = CriarUsuarioSchema()

@bp.post("/")
def criar_usuario():
    dados = criar_schema.load(request.get_json())  # Valida automaticamente
    usuario = UsuarioService.criar(dados)
    return jsonify(schema.dump(usuario)), 201

@bp.get("/<int:id>")
@jwt_required()
def buscar_usuario(id: int):
    usuario_logado = get_jwt_identity()
    usuario = UsuarioService.buscar(id, solicitante=usuario_logado)
    return jsonify(schema.dump(usuario)), 200

@bp.put("/<int:id>")
@jwt_required()
def atualizar_usuario(id: int):
    dados = criar_schema.load(request.get_json(), partial=True)
    usuario = UsuarioService.atualizar(id, dados)
    return jsonify(schema.dump(usuario)), 200

@bp.delete("/<int:id>")
@jwt_required()
def deletar_usuario(id: int):
    UsuarioService.deletar(id)
    return "", 204
```

## Respostas Padronizadas — Sempre
```python
# utils/response.py
from flask import jsonify
from typing import Any, Optional

def sucesso(dados: Any, mensagem: str = "OK", status: int = 200):
    return jsonify({
        "sucesso": True,
        "mensagem": mensagem,
        "dados": dados
    }), status

def erro(mensagem: str, status: int = 400, detalhes: Optional[dict] = None):
    resposta = {
        "sucesso": False,
        "mensagem": mensagem,
    }
    if detalhes:
        resposta["detalhes"] = detalhes
    return jsonify(resposta), status

# Uso nas rotas:
# return sucesso(schema.dump(usuario), "Usuário criado", 201)
# return erro("Email já cadastrado", 409)
```

## Tratamento de Erros Global
```python
# exceptions.py
from flask import Flask, jsonify
from marshmallow import ValidationError

def registrar_handlers(app: Flask):

    @app.errorhandler(ValidationError)
    def handle_validacao(e):
        return jsonify({
            "sucesso": False,
            "mensagem": "Dados inválidos",
            "erros": e.messages
        }), 400

    @app.errorhandler(404)
    def handle_nao_encontrado(e):
        return jsonify({
            "sucesso": False,
            "mensagem": "Recurso não encontrado"
        }), 404

    @app.errorhandler(401)
    def handle_nao_autorizado(e):
        return jsonify({
            "sucesso": False,
            "mensagem": "Não autorizado"
        }), 401

    @app.errorhandler(500)
    def handle_erro_interno(e):
        app.logger.error(f"Erro interno: {e}", exc_info=True)
        return jsonify({
            "sucesso": False,
            "mensagem": "Erro interno do servidor"
        }), 500
```

## Autenticação JWT — Segura
```python
# services/auth_service.py
from flask_jwt_extended import create_access_token, create_refresh_token
from datetime import timedelta
from ..repositories.usuario_repository import UsuarioRepository
from ..exceptions import AcessoNegadoError
from ..utils.seguranca import verificar_senha

class AuthService:
    @staticmethod
    def login(email: str, senha: str) -> dict:
        usuario = UsuarioRepository.buscar_por_email(email)

        if not usuario or not verificar_senha(senha, usuario.senha_hash):
            # Mesma mensagem pra não revelar se email existe
            raise AcessoNegadoError("Credenciais inválidas")

        access_token = create_access_token(
            identity=str(usuario.id),
            expires_delta=timedelta(hours=1)
        )
        refresh_token = create_refresh_token(
            identity=str(usuario.id),
            expires_delta=timedelta(days=30)
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "tipo": "Bearer"
        }
```

## Segurança — Headers e Proteções
```python
# middlewares/seguranca.py
from flask import Flask

def configurar_seguranca(app: Flask):

    @app.after_request
    def adicionar_headers_seguranca(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'"
        )
        # Remove header que revela tecnologia
        response.headers.pop("Server", None)
        return response
```

## Rate Limiting — Proteção contra abuso
```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Na rota de login — mais restritivo
@bp.post("/login")
@limiter.limit("5 per minute")
def login():
    pass
```

## Banco de Dados — SQLAlchemy correto
```python
# models/usuario.py
from datetime import datetime
from ..extensions import db

class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    senha_hash = db.Column(db.String(255), nullable=False)
    ativo = db.Column(db.Boolean, default=True, nullable=False)
    criado_em = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    atualizado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    def __repr__(self):
        return f"<Usuario {self.email}>"

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "ativo": self.ativo,
            "criado_em": self.criado_em.isoformat()
            # NUNCA retornar senha_hash
        }
```

## Variáveis de Ambiente
```python
# config.py
import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    DATABASE_URL = os.getenv("DATABASE_URL")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    DEBUG = False
    TESTING = False
    ORIGENS_PERMITIDAS = os.getenv("CORS_ORIGINS", "").split(",")

class ConfigDesenvolvimento(Config):
    DEBUG = True
    DATABASE_URL = os.getenv("DEV_DATABASE_URL", "sqlite:///dev.db")

class ConfigProducao(Config):
    DEBUG = False
    # Força HTTPS em produção
    PREFERRED_URL_SCHEME = "https"
```

## .env.example — Sempre commitar esse
```
SECRET_KEY=gere-uma-chave-forte-aqui
JWT_SECRET_KEY=outra-chave-forte-aqui
DATABASE_URL=postgresql://usuario:senha@localhost:5432/meu_banco
CORS_ORIGINS=https://meusite.com,https://www.meusite.com
DEBUG=false
```

## Checklist API antes de publicar
- [ ] Todas as rotas protegidas que precisam de auth têm @jwt_required()
- [ ] Validação de entrada em todas as rotas (schema)
- [ ] Respostas padronizadas (sucesso/erro)
- [ ] Rate limiting nas rotas críticas (login, registro)
- [ ] Headers de segurança configurados
- [ ] Sem dados sensíveis nas respostas (senhas, tokens internos)
- [ ] Logs de erro configurados
- [ ] Variáveis de ambiente no .env, nunca no código
- [ ] CORS configurado apenas para origens conhecidas
