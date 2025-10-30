"""
Configuration settings for the Python Travel API
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Application settings"""
    
    # API Settings
    API_TITLE = "Smart Travel Recommendation API"
    API_VERSION = "1.0.0"
    API_DESCRIPTION = "AI-powered travel itinerary recommendation system using Gemini AI"
    
    # Server Settings
    HOST = os.getenv("API_HOST", "0.0.0.0")
    PORT = int(os.getenv("API_PORT", "8000"))
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    
    # Database Settings (NOT REQUIRED - kept for backward compatibility)
    # This API works without database - all data provided by Laravel
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", "3306"))
    DB_NAME = os.getenv("DB_NAME", "travel_db")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    
    # Gemini AI Settings (REQUIRED)
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")  # Use gemini-1.5-flash for stability
    
    # API Security
    API_KEY = os.getenv("API_KEY", "")
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    
    # Performance Settings
    REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "300"))
    MAX_WORKERS = int(os.getenv("MAX_WORKERS", "4"))
    
    @classmethod
    def get_database_url(cls):
        """Get database connection URL (DEPRECATED - database not required)"""
        return f"mysql+pymysql://{cls.DB_USER}:{cls.DB_PASSWORD}@{cls.DB_HOST}:{cls.DB_PORT}/{cls.DB_NAME}"

settings = Settings()

