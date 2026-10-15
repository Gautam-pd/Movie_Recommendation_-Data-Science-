import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Paths
    BASE_DIR: str = os.path.dirname(os.path.abspath(__file__))
    RAW_DATA_DIR: str = os.path.join(BASE_DIR, "data", "raw")
    PROCESSED_DATA_DIR: str = os.path.join(BASE_DIR, "data", "processed")
    
    MOVIES_RAW_PATH: str = os.path.join(RAW_DATA_DIR, "movies.csv")
    RATINGS_RAW_PATH: str = os.path.join(RAW_DATA_DIR, "ratings.csv")
    LINKS_RAW_PATH: str = os.path.join(RAW_DATA_DIR, "links.csv")
    
    PROCESSED_MOVIES_PATH: str = os.path.join(PROCESSED_DATA_DIR, "movies_enriched.csv")
    TMDB_CACHE_PATH: str = os.path.join(PROCESSED_DATA_DIR, "tmdb_cache.json")
    EDA_STATS_PATH: str = os.path.join(PROCESSED_DATA_DIR, "eda_stats.json")
    
    # Recommendation configurations
    GENRE_SIMILARITY_WEIGHT: float = 0.6
    QUALITY_SCORE_WEIGHT: float = 0.4
    TOP_N: int = 15
    
    # Mood-genre mapping (adds secondary genres at 0.5 weight)
    MOOD_GENRE_MAP: dict = {
        "Light & Fun": ["Comedy", "Animation", "Adventure"],
        "Intense & Gripping": ["Thriller", "Mystery", "Crime", "Film-Noir"],
        "Thought-provoking": ["Sci-Fi", "Drama", "Documentary", "War"]
    }
    
    # TMDB Configurations
    TMDB_API_KEY: str = os.getenv("TMDB_API_KEY", "")
    TMDB_IMAGE_BASE_URL: str = "https://image.tmdb.org/t/p/w500"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
