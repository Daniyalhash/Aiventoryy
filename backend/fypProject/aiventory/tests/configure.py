
# config.py

import os

class Config:
    # Database Configuration
    DB_URI = os.getenv("DB_URI", "mongodb://localhost:27017/inventory")
    DB_USER = os.getenv("DB_USER", "admin")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "password")

    # AI Model Configuration
    AI_MODEL_PATH = os.getenv("AI_MODEL_PATH", "/path/to/model")
    AI_MODEL_VERSION = "1.0.0"
    CONFIDENCE_THRESHOLD = 0.8  # Confidence threshold for predictions

    # Firebase Configuration
    FIREBASE_API_KEY = os.getenv("FIREBASE_API_KEY", "your-firebase-api-key")
    FIREBASE_AUTH_DOMAIN = os.getenv("FIREBASE_AUTH_DOMAIN", "your-app.firebaseapp.com")
    FIREBASE_DB_URL = os.getenv("FIREBASE_DB_URL", "https://your-app.firebaseio.com")
    FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "your-app-id")

    # Logging Configuration
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")  # Options: DEBUG, INFO, ERROR

    # External APIs
    WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "your-weather-api-key")
    FINANCIAL_API_KEY = os.getenv("FINANCIAL_API_KEY", "your-financial-api-key")
