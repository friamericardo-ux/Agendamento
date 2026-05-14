import sqlite3
import os

db_path = 'backend/agendazap.db'
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("SELECT id, nome, email, tipo FROM usuarios")
    users = cursor.fetchall()
    print("Users found:")
    for user in users:
        print(user)
except Exception as e:
    print(f"Error: {e}")

conn.close()
