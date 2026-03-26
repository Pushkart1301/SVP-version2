from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Student Vacation Planner 2.0"
    API_V1_STR: str = "/api/v1"
    
    # MongoDB
    DATABASE_URL: str
    DATABASE_NAME: str = "svp_db"
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 * 24 * 60  # 30 days
    
    # AI
    GROQ_API_KEY: str

    class Config:
        env_file = str(ENV_PATH)

settings = Settings()
