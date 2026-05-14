# Python — Padrões Profissionais

## Estrutura de Projeto
```
meu_projeto/
├── src/
│   ├── __init__.py
│   ├── config.py        # Configurações centralizadas
│   ├── models/          # Modelos de dados
│   ├── services/        # Lógica de negócio
│   ├── repositories/    # Acesso ao banco de dados
│   └── utils/           # Funções auxiliares
├── tests/
│   ├── unit/
│   └── integration/
├── .env                 # Variáveis de ambiente (NUNCA no git)
├── .env.example         # Exemplo sem valores reais
├── requirements.txt
├── README.md
└── main.py
```

## Clean Code — Regras Obrigatórias

### Nomenclatura
```python
# ❌ ERRADO
def f(x, y):
    return x + y

d = {"n": "João", "i": 30}

# ✅ CORRETO
def calcular_total(preco: float, quantidade: int) -> float:
    return preco * quantidade

usuario = {"nome": "João", "idade": 30}
```

### Funções — Uma responsabilidade só
```python
# ❌ ERRADO — faz tudo junto
def processar_usuario(dados):
    # valida, salva no banco, envia email, tudo junto
    pass

# ✅ CORRETO — separado por responsabilidade
def validar_usuario(dados: dict) -> bool:
    pass

def salvar_usuario(dados: dict) -> Usuario:
    pass

def notificar_usuario(email: str) -> None:
    pass
```

### Type Hints — Sempre
```python
from typing import Optional, List, Dict

def buscar_usuarios(
    filtro: Optional[str] = None,
    limite: int = 10
) -> List[Dict[str, str]]:
    pass
```

## Tratamento de Erros — Profissional

### Exceções customizadas
```python
# exceptions.py
class AppError(Exception):
    """Erro base da aplicação."""
    def __init__(self, mensagem: str, codigo: int = 500):
        self.mensagem = mensagem
        self.codigo = codigo
        super().__init__(mensagem)

class NaoEncontradoError(AppError):
    def __init__(self, recurso: str):
        super().__init__(f"{recurso} não encontrado", 404)

class ValidacaoError(AppError):
    def __init__(self, campo: str, motivo: str):
        super().__init__(f"Campo '{campo}': {motivo}", 400)

class AcessoNegadoError(AppError):
    def __init__(self):
        super().__init__("Acesso não autorizado", 403)
```

### Try/Except correto
```python
# ❌ ERRADO — captura tudo sem tratar
try:
    resultado = processar()
except:
    pass

# ✅ CORRETO — específico e com log
import logging

logger = logging.getLogger(__name__)

try:
    resultado = processar_pagamento(dados)
except ValidacaoError as e:
    logger.warning(f"Validação falhou: {e.mensagem}")
    raise
except ConexaoBancoError as e:
    logger.error(f"Banco indisponível: {e}", exc_info=True)
    raise AppError("Serviço temporariamente indisponível", 503)
except Exception as e:
    logger.critical(f"Erro inesperado: {e}", exc_info=True)
    raise AppError("Erro interno do servidor", 500)
```

## Segurança — Obrigatório

### Variáveis de ambiente
```python
# config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    DATABASE_URL = os.getenv("DATABASE_URL")
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"

    @classmethod
    def validar(cls):
        obrigatorias = ["SECRET_KEY", "DATABASE_URL"]
        faltando = [v for v in obrigatorias if not os.getenv(v)]
        if faltando:
            raise EnvironmentError(
                f"Variáveis obrigatórias não definidas: {faltando}"
            )

# NUNCA faça isso:
# senha = "minha_senha_123"  ❌
# api_key = "sk-abc123"      ❌
```

### Validação de entrada
```python
import re

def validar_email(email: str) -> bool:
    padrao = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(padrao, email))

def sanitizar_string(texto: str, tamanho_max: int = 255) -> str:
    """Remove caracteres perigosos e limita tamanho."""
    texto = texto.strip()
    texto = texto[:tamanho_max]
    # Remove caracteres de controle
    texto = re.sub(r'[\x00-\x1f\x7f]', '', texto)
    return texto
```

### Senhas — bcrypt obrigatório
```python
import bcrypt

def hash_senha(senha: str) -> str:
    sal = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(senha.encode(), sal).decode()

def verificar_senha(senha: str, hash_armazenado: str) -> bool:
    return bcrypt.checkpw(
        senha.encode(),
        hash_armazenado.encode()
    )
```

## Logging Profissional
```python
# logger.py
import logging
import sys
from datetime import datetime

def configurar_logger(nome: str) -> logging.Logger:
    logger = logging.getLogger(nome)
    logger.setLevel(logging.DEBUG)

    # Console
    handler_console = logging.StreamHandler(sys.stdout)
    handler_console.setLevel(logging.INFO)

    # Arquivo
    handler_arquivo = logging.FileHandler(
        f"logs/{datetime.now().strftime('%Y-%m-%d')}.log"
    )
    handler_arquivo.setLevel(logging.DEBUG)

    formato = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
    )
    handler_console.setFormatter(formato)
    handler_arquivo.setFormatter(formato)

    logger.addHandler(handler_console)
    logger.addHandler(handler_arquivo)
    return logger
```

## Escalabilidade

### Padrão Repository — separa banco da lógica
```python
# repositories/usuario_repository.py
from abc import ABC, abstractmethod
from typing import Optional, List

class UsuarioRepositoryBase(ABC):
    @abstractmethod
    def buscar_por_id(self, id: int) -> Optional[dict]: pass

    @abstractmethod
    def salvar(self, dados: dict) -> dict: pass

    @abstractmethod
    def deletar(self, id: int) -> bool: pass

class UsuarioRepository(UsuarioRepositoryBase):
    def __init__(self, db):
        self.db = db

    def buscar_por_id(self, id: int) -> Optional[dict]:
        return self.db.query("SELECT * FROM usuarios WHERE id = %s", [id])

    def salvar(self, dados: dict) -> dict:
        # lógica de inserção
        pass

    def deletar(self, id: int) -> bool:
        # lógica de deleção
        pass
```

## Testes — Sempre escrever
```python
# tests/unit/test_usuario_service.py
import pytest
from unittest.mock import MagicMock
from src.services.usuario_service import UsuarioService
from src.exceptions import ValidacaoError

def test_criar_usuario_email_invalido():
    repo_mock = MagicMock()
    service = UsuarioService(repo_mock)

    with pytest.raises(ValidacaoError) as exc:
        service.criar({"email": "email-invalido", "senha": "123456"})

    assert "email" in str(exc.value.mensagem)
    repo_mock.salvar.assert_not_called()

def test_criar_usuario_sucesso():
    repo_mock = MagicMock()
    repo_mock.salvar.return_value = {"id": 1, "email": "test@test.com"}
    service = UsuarioService(repo_mock)

    resultado = service.criar({
        "email": "test@test.com",
        "senha": "Senha@123"
    })

    assert resultado["id"] == 1
    repo_mock.salvar.assert_called_once()
```

## Checklist antes de entregar código
- [ ] Type hints em todas as funções
- [ ] Sem credenciais no código — tudo no .env
- [ ] Tratamento de erro específico, não genérico
- [ ] Logs nos pontos críticos
- [ ] Testes cobrindo os fluxos principais
- [ ] Nomes descritivos — sem abreviações obscuras
- [ ] Funções com no máximo 20-30 linhas
- [ ] README atualizado
