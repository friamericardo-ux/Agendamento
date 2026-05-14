from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "secreta-mude-isso-em-producao"

def criar_token(data: dict):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=15)
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def verificar(token):
    return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

try:
    # Test with string ID
    t1 = criar_token({"sub": "1"})
    print(f"Token 1 (string '1'): {t1}")
    p1 = verificar(t1)
    print(f"Payload 1: {p1}")

    # Test with int ID (just in case)
    t2 = criar_token({"sub": 1})
    print(f"Token 2 (int 1): {t2}")
    p2 = verificar(t2)
    print(f"Payload 2: {p2}")

except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
