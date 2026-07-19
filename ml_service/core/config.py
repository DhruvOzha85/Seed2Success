from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Seed2Success ML Inference Service"
    VERSION: str = "1.0.0"
    MODEL_PATH: str = "models/best_model.pkl"
    DISTRICT_COORDS_PATH: str = "data/raw/weather/noaa_ghcn_station_metadata/districtCoordinates.json"
    
    # Open-Meteo API
    WEATHER_API_URL: str = "https://archive-api.open-meteo.com/v1/archive"
    
    # LLM APIs
    GEMINI_API_KEY: str
    GROQ_API_KEY: str

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
