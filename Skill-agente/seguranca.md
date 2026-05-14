# Segurança e Boas Práticas Gerais

## Os 10 Mandamentos do Código Seguro

1. **Nunca confie em input do usuário** — valide e sanitize sempre
2. **Nunca coloque segredos no código** — use variáveis de ambiente
3. **Nunca exponha erros internos** — log interno, mensagem genérica pro usuário
4. **Sempre use HTTPS** — sem exceção em produção
5. **Senhas sempre com hash** — bcrypt, nunca MD5 ou SHA1
6. **Princípio do menor privilégio** — usuário só acessa o que precisa
7. **Dependências sempre atualizadas** — vulnerabilidades são corrigidas nas atualizações
8. **Backups regulares** — testar restauração periodicamente
9. **Logs de auditoria** — registrar quem fez o quê e quando
10. **Nunca confie no frontend** — validar tudo no backend também

## OWASP Top 10 — Os ataques mais comuns

### 1. Injeção SQL — Nunca concatenar queries
```python
# ❌ VULNERÁVEL — injeção SQL
query = f"SELECT * FROM usuarios WHERE email = '{email}'"
db.execute(query)

# ✅ SEGURO — parâmetros
db.execute("SELECT * FROM usuarios WHERE email = %s", [email])

# ✅ COM SQLAlchemy
Usuario.query.filter_by(email=email).first()
```

### 2. XSS — Cross-Site Scripting
```python
# ❌ VULNERÁVEL — no backend
return f"<h1>Olá, {nome_usuario}</h1>"

# ✅ SEGURO — escapar HTML
from markupsafe import escape
return f"<h1>Olá, {escape(nome_usuario)}</h1>"
```

### 3. Autenticação quebrada
```python
# ❌ ERRADO
token = jwt.encode({"user_id": id}, "senha123")

# ✅ CORRETO — chave forte, expiração, algoritmo seguro
import secrets
token = jwt.encode(
    {
        "user_id": id,
        "exp": datetime.utcnow() + timedelta(hours=1),
        "iat": datetime.utcnow(),
        "jti": secrets.token_hex(16)  # ID único do token
    },
    os.getenv("JWT_SECRET"),  # Chave do .env, mínimo 32 chars
    algorithm="HS256"
)
```

### 4. Exposição de dados sensíveis
```python
# ❌ ERRADO — retorna senha no JSON
return jsonify(usuario.__dict__)

# ✅ CORRETO — serializar apenas o necessário
return jsonify({
    "id": usuario.id,
    "nome": usuario.nome,
    "email": usuario.email
    # senha_hash NUNCA aqui
})
```

### 5. IDOR — Acesso a recursos de outros usuários
```python
# ❌ VULNERÁVEL — qualquer usuário acessa qualquer recurso
@bp.get("/pedidos/<int:id>")
@jwt_required()
def buscar_pedido(id):
    return Pedido.query.get_or_404(id)

# ✅ SEGURO — verifica se pertence ao usuário logado
@bp.get("/pedidos/<int:id>")
@jwt_required()
def buscar_pedido(id):
    usuario_id = int(get_jwt_identity())
    pedido = Pedido.query.filter_by(
        id=id,
        usuario_id=usuario_id  # Garante que é do usuário logado
    ).first_or_404()
    return jsonify(pedido.to_dict())
```

## Gerenciamento de Segredos

### .gitignore — Arquivo obrigatório
```gitignore
# Ambiente
.env
.env.local
.env.production
*.env

# Python
__pycache__/
*.pyc
*.pyo
.venv/
venv/
*.egg-info/

# Node
node_modules/
dist/
build/

# Banco de dados
*.db
*.sqlite
*.sqlite3

# Logs
logs/
*.log

# Chaves e certificados
*.pem
*.key
*.cert
*.p12

# IDEs
.vscode/settings.json
.idea/
*.swp
```

### Gerar chaves fortes
```python
import secrets

# Gerar SECRET_KEY
print(secrets.token_hex(32))
# Exemplo: "a3f8c2e1b4d7f9a0c5e2b8d1f6a4c7e3..."

# Gerar senha temporária
print(secrets.token_urlsafe(16))
```

## CORS — Configurar corretamente
```python
from flask_cors import CORS

# ❌ ERRADO — permite qualquer origem
CORS(app)

# ✅ CORRETO — apenas origens conhecidas
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://meusite.com", "https://www.meusite.com"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

## Upload de Arquivos — Seguro
```python
import os
import uuid
from werkzeug.utils import secure_filename

EXTENSOES_PERMITIDAS = {"png", "jpg", "jpeg", "gif", "pdf"}
TAMANHO_MAX = 5 * 1024 * 1024  # 5MB

def extensao_permitida(nome_arquivo: str) -> bool:
    return (
        "." in nome_arquivo and
        nome_arquivo.rsplit(".", 1)[1].lower() in EXTENSOES_PERMITIDAS
    )

@bp.post("/upload")
@jwt_required()
def upload_arquivo():
    if "arquivo" not in request.files:
        return erro("Nenhum arquivo enviado", 400)

    arquivo = request.files["arquivo"]

    if not extensao_permitida(arquivo.filename):
        return erro("Tipo de arquivo não permitido", 400)

    # Verifica tamanho
    arquivo.seek(0, 2)
    tamanho = arquivo.tell()
    arquivo.seek(0)
    if tamanho > TAMANHO_MAX:
        return erro("Arquivo muito grande (máx 5MB)", 400)

    # Nome seguro e único — NUNCA usar nome original
    nome_seguro = f"{uuid.uuid4()}.{arquivo.filename.rsplit('.', 1)[1].lower()}"
    caminho = os.path.join(app.config["UPLOAD_FOLDER"], nome_seguro)
    arquivo.save(caminho)

    return sucesso({"arquivo": nome_seguro}, "Upload realizado", 201)
```

## Checklist de Segurança Completo

### Backend
- [ ] SQL via ORM ou queries parametrizadas
- [ ] Validação de entrada em todas as rotas
- [ ] Autenticação em rotas protegidas
- [ ] Verificação de propriedade (IDOR)
- [ ] Rate limiting nas rotas críticas
- [ ] Headers de segurança configurados
- [ ] CORS restritivo
- [ ] Senhas com bcrypt
- [ ] Tokens JWT com expiração
- [ ] Logs de auditoria
- [ ] Variáveis sensíveis no .env
- [ ] .gitignore correto

### Frontend
- [ ] Sanitizar HTML dinâmico
- [ ] Sem secrets no código
- [ ] HTTPS forçado
- [ ] Tokens armazenados de forma segura
- [ ] Rotas protegidas por autenticação
- [ ] Validação de formulários

### Infraestrutura
- [ ] HTTPS com certificado válido
- [ ] Banco de dados não exposto publicamente
- [ ] Backups automáticos
- [ ] Dependências atualizadas
- [ ] Firewall configurado
