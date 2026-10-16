import os
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.config import settings
from backend.analysis.recommender import MovieRecommender
from backend.routers import genres, recommendations, insights

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing FastAPI Recommendation Engine Backend...")
    
    # Instantiate global MovieRecommender
    recommender = MovieRecommender()
    app.state.recommender = recommender
    
    # Load TMDB cache if it exists
    tmdb_cache = {}
    if os.path.exists(settings.TMDB_CACHE_PATH):
        try:
            with open(settings.TMDB_CACHE_PATH, 'r', encoding='utf-8') as f:
                tmdb_cache = json.load(f)
            print(f"Loaded TMDB cache from disk containing {len(tmdb_cache)} items.")
        except Exception as e:
            print(f"Error loading TMDB cache, starting fresh: {e}")
    else:
        print("No TMDB cache found, starting with empty cache.")
        
    app.state.tmdb_cache = tmdb_cache
    
    yield
    print("Shutting down FastAPI Recommendation Engine Backend...")

app = FastAPI(
    title="Movie Recommendation Engine API",
    description="Educational data-analysis-first recommender API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configurations for local frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For educational demo, open all origins. In production, restrict to frontend domain.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers FIRST — these must take priority over static file serving
app.include_router(genres.router)
app.include_router(recommendations.router)
app.include_router(insights.router)

# Mount the frontend directory as static files LAST, so API routes are never shadowed.
# html=True enables SPA-style fallback: serves index.html for any path that doesn't
# match a real file, which lets the React app handle its own routing.
FRONTEND_DIR = os.path.normpath(os.path.join(settings.BASE_DIR, "..", "frontend"))
if os.path.isdir(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
else:
    # Fallback if frontend dir is missing — at least show a status message
    @app.get("/")
    def root_fallback():
        return {"status": "online", "message": "Backend running, but frontend/ directory is missing."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)

