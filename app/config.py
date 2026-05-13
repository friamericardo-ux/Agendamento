from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    REFRESH_SECRET_KEY: str
    ALLOWED_ORIGINS: str = "*"
    INTERNAL_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()
