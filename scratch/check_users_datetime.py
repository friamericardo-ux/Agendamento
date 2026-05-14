import sqlite3
import os

db_path = 'backend/agendazap.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("SELECT id, email, criado_em FROM usuarios")
    users = cursor.fetchall()
    print("Users and their criado_em:")
    for user in users:
        print(user)
except Exception as e:
    print(f"Error: {e}")

conn.close()
