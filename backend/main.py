import os
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# Include routers
app.include_router(genres.router)
app.include_router(recommendations.router)
app.include_router(insights.router)

from fastapi.responses import FileResponse

# Serve index.html at root
@app.get("/")
def serve_index():
    index_path = os.path.join(settings.BASE_DIR, "..", "frontend", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"status": "online", "message": "Backend running, but frontend/index.html is missing."}

# Serve static files from frontend folder (e.g. JS, CSS, images)
@app.get("/{path:path}")
def serve_static_files(path: str):
    # Prevent path traversal
    clean_path = os.path.normpath(path).lstrip("./\\")
    file_path = os.path.join(settings.BASE_DIR, "..", "frontend", clean_path)
    
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
        
    # Fallback to index.html for React SPA routing
    index_path = os.path.join(settings.BASE_DIR, "..", "frontend", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
        
    raise HTTPException(status_code=404, detail="File not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
