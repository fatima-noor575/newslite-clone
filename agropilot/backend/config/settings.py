from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379/0"
    JWT_SECRET: str
    JWT_REFRESH_SECRET: str
    ACCESS_TTL_MIN: int = 15
    REFRESH_TTL_DAYS: int = 30
    OPENAI_API_KEY: str = ""
    OPENWEATHER_API_KEY: str = ""
    CLOUDINARY_URL: str = ""
    SMTP_HOST: str = ""
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    FRONTEND_URL: str = "http://localhost:3000"

settings = Settings()
