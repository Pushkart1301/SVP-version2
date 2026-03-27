from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Student Vacation Planner 2.0"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str
    DATABASE_NAME: str = "svp_db"
    
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 * 24 * 60
    
    GROQ_API_KEY: str

    class Config:
        env_file = ".env" if os.getenv("ENV") != "production" else None

settings = Settings()