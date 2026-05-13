import sqlite3
import os
from app.config import settings

db_path = settings.DATABASE_URL.replace("sqlite:///", "./")
db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), db_path)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(tenants)")
columns = [row[1] for row in cursor.fetchall()]

new_columns = {"evolution_instance", "bot_email", "bot_password"}
existing = set(columns)
to_add = new_columns - existing

if not to_add:
    print("Todas as colunas já existem. Nada a fazer.")
    conn.close()
    exit(0)

print(f"Colunas a adicionar: {to_add}")

if "evolution_instance" in to_add:
    cursor.execute("""
        CREATE TABLE tenants_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome_negocio VARCHAR(255) NOT NULL,
            tipo_negocio VARCHAR(100),
            telefone VARCHAR(20),
            plano VARCHAR(50) DEFAULT 'basico',
            horario_funcionamento VARCHAR(500),
            ativo BOOLEAN DEFAULT 1,
            evolution_instance VARCHAR(100) UNIQUE,
            bot_email VARCHAR(255),
            bot_password VARCHAR(255),
            criado_em DATETIME,
            atualizado_em DATETIME
        )
    """)
    cursor.execute("INSERT INTO tenants_new SELECT id, nome_negocio, tipo_negocio, telefone, plano, horario_funcionamento, ativo, NULL, NULL, NULL, criado_em, atualizado_em FROM tenants")
    cursor.execute("DROP TABLE tenants")
    cursor.execute("ALTER TABLE tenants_new RENAME TO tenants")
    print("Migração concluída: colunas evolution_instance, bot_email, bot_password adicionadas.")
else:
    existing_cols = ", ".join(columns)
    for col in to_add:
        if col == "evolution_instance":
            cursor.execute(f"ALTER TABLE tenants ADD COLUMN {col} VARCHAR(100) UNIQUE")
        else:
            cursor.execute(f"ALTER TABLE tenants ADD COLUMN {col} VARCHAR(255)")
    print(f"Migração concluída: colunas {', '.join(to_add)} adicionadas.")

conn.commit()
conn.close()
