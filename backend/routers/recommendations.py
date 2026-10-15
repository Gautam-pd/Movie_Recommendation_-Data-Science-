import os
import json
import requests
import pandas as pd
from fastapi import APIRouter, Request, HTTPException
from backend.models import RecommendationRequest, RecommendationResponse
from backend.config import settings

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

def fetch_tmdb_details(tmdb_id: int) -> dict:
    """
    Queries TMDB API for movie details (poster_path and overview).
    """
    if not settings.TMDB_API_KEY:
        return {}
    
    url = f"https://api.themoviedb.org/3/movie/{tmdb_id}"
    params = {"api_key": settings.TMDB_API_KEY}
    
    try:
        response = requests.get(url, params=params, timeout=10.0)
        if response.status_code == 200:
            data = response.json()
            poster_path = data.get("poster_path")
            overview = data.get("overview", "")
            
            poster_url = f"{settings.TMDB_IMAGE_BASE_URL}{poster_path}" if poster_path else None
            return {
                "poster_url": poster_url,
                "overview": overview
            }
    except Exception as e:
        print(f"Error fetching TMDB details for tmdbId {tmdb_id}: {e}")
        
    return {}

@router.post("", response_model=RecommendationResponse)
def get_recommendations(request: Request, payload: RecommendationRequest):
    """
    Generates personalized recommendations based on quiz input.
    Matches and enriches TMDB cache.
    """
    recommender = request.app.state.recommender
    
    try:
        # Generate recommendations using our recommender engine
        rec_data = recommender.recommend(
            genres=payload.genres,
            mood=payload.mood,
            era=payload.era,
            gem_slider=payload.gem_slider
        )
        
        # Enrich results with TMDB cache or live API calls
        enriched_results = []
        cache_updated = False
        
        tmdb_cache = request.app.state.tmdb_cache
        
        for movie in rec_data["results"]:
            movie_id = movie["movieId"]
            
            # Find the corresponding tmdbId
            # We stored 'tmdbId' in the movies_df inside recommender
            matching_rows = recommender.movies_df[recommender.movies_df["movieId"] == movie_id]
            
            poster_url = None
            overview = ""
            
            if not matching_rows.empty:
                tmdb_val = matching_rows.iloc[0]["tmdbId"]
                if tmdb_val and not pd.isna(tmdb_val):
                    tmdb_id = int(tmdb_val)
                    tmdb_key = str(tmdb_id)
                    
                    # Check cache first
                    if tmdb_key in tmdb_cache:
                        poster_url = tmdb_cache[tmdb_key].get("poster_url")
                        overview = tmdb_cache[tmdb_key].get("overview", "")
                    elif settings.TMDB_API_KEY:
                        # Fetch live if key is available and not in cache
                        print(f"Cache miss for TMDB ID {tmdb_id}. Fetching live...")
                        details = fetch_tmdb_details(tmdb_id)
                        if details:
                            poster_url = details.get("poster_url")
                            overview = details.get("overview", "")
                            # Write to cache
                            tmdb_cache[tmdb_key] = {
                                "poster_url": poster_url,
                                "overview": overview,
                                "title": movie["title"]
                            }
                            cache_updated = True
            
            # Fallback placeholder if poster is not resolved
            if not poster_url:
                # SVG UI placeholder fallback or generic movie image placeholder
                poster_url = f"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60"
                overview = "Overview not available."
                
            movie["poster_url"] = poster_url
            movie["overview"] = overview
            enriched_results.append(movie)
            
        # Save cache back to file if updated
        if cache_updated:
            os.makedirs(settings.PROCESSED_DATA_DIR, exist_ok=True)
            with open(settings.TMDB_CACHE_PATH, 'w', encoding='utf-8') as f:
                json.dump(tmdb_cache, f, indent=2)
            print("TMDB Cache file updated on disk.")
            
        return {
            "era_relaxed": rec_data["era_relaxed"],
            "m_param_used": rec_data["m_param_used"],
            "percentile_used": rec_data["percentile_used"],
            "C_used": rec_data["C_used"],
            "results": enriched_results
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Recommender error: {str(e)}")
