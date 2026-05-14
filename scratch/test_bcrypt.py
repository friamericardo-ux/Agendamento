from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

senha = 'admin123'
hash_senha = pwd_context.hash(senha)
print(f"Hash created: {hash_senha}")

try:
    match = pwd_context.verify(senha, hash_senha)
    print(f"Match: {match}")
except Exception as e:
    print(f"Error during verify: {e}")
