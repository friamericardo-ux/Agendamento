import sqlite3
from passlib.context import CryptContext
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db_path = 'backend/agendazap.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

email = 'admin@admin.com'
senha = 'admin123'
nome = 'Administrador'
tipo = 'admin'
senha_hash = pwd_context.hash(senha)

try:
    cursor.execute("INSERT INTO usuarios (nome, email, senha_hash, tipo, ativo) VALUES (?, ?, ?, ?, ?)",
                   (nome, email, senha_hash, tipo, 1))
    conn.commit()
    print(f"User {email} created successfully!")
except sqlite3.IntegrityError:
    print(f"User {email} already exists. Updating password...")
    cursor.execute("UPDATE usuarios SET senha_hash = ?, tipo = ? WHERE email = ?", (senha_hash, tipo, email))
    conn.commit()
    print("Password updated.")
except Exception as e:
    print(f"Error: {e}")

conn.close()
