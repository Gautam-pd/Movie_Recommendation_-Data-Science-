import os
import json
import time
import requests
import pandas as pd
from backend.config import settings

def main():
    print("Starting TMDB Cache Pre-warming Script...")
    
    # Check if TMDB API key is available
    if not settings.TMDB_API_KEY:
        print("\n[WARNING] TMDB_API_KEY is not set in your environment or .env file.")
        print("This script is optional. The recommendation engine will fall back to using default placeholders.")
        print("To enable poster enrichment, get an API key from themoviedb.org and set it in your .env file.")
        return

    # Check if movies_enriched exists
    if not os.path.exists(settings.PROCESSED_MOVIES_PATH):
        print(f"Error: Processed movies file not found at {settings.PROCESSED_MOVIES_PATH}. Run build_dataset.py first.")
        return

    print("Loading enriched movies dataset...")
    movies_df = pd.read_csv(settings.PROCESSED_MOVIES_PATH)
    
    # Load existing cache
    cache = {}
    if os.path.exists(settings.TMDB_CACHE_PATH):
        try:
            with open(settings.TMDB_CACHE_PATH, 'r', encoding='utf-8') as f:
                cache = json.load(f)
            print(f"Loaded existing TMDB cache containing {len(cache)} movies.")
        except Exception as e:
            print(f"Error loading existing cache, starting fresh: {e}")

    # Warm cache for the top 300 most-rated movies in the dataset (most likely candidates for recommendation)
    movies_to_warm = movies_df[movies_df['vote_count'] > 0].sort_values(by='vote_count', ascending=False).head(300)
    print(f"Targeting top {len(movies_to_warm)} most popular movies for cache pre-warming.")

    new_additions = 0
    errors = 0
    start_time = time.time()

    for idx, row in enumerate(movies_to_warm.itertuples(), 1):
        tmdb_val = row.tmdbId
        if pd.isna(tmdb_val):
            continue
            
        tmdb_id = int(tmdb_val)
        tmdb_key = str(tmdb_id)
        
        # Skip if already cached
        if tmdb_key in cache and cache[tmdb_key].get('poster_url'):
            continue
            
        print(f"[{idx}/{len(movies_to_warm)}] Fetching metadata for '{row.title}' (TMDB ID: {tmdb_id})...")
        
        url = f"https://api.themoviedb.org/3/movie/{tmdb_id}"
        params = {"api_key": settings.TMDB_API_KEY}
        
        try:
            # Request details from TMDB
            response = requests.get(url, params=params, timeout=3.0)
            if response.status_code == 200:
                data = response.json()
                poster_path = data.get("poster_path")
                overview = data.get("overview", "")
                
                poster_url = f"{settings.TMDB_IMAGE_BASE_URL}{poster_path}" if poster_path else None
                cache[tmdb_key] = {
                    "poster_url": poster_url,
                    "overview": overview,
                    "title": row.title
                }
                new_additions += 1
            else:
                print(f"  [Error] Received status {response.status_code} for TMDB ID {tmdb_id}")
                errors += 1
        except Exception as e:
            print(f"  [Error] Exception occurred: {e}")
            errors += 1
            
        # Throttling to respect API guidelines and preserve resources
        time.sleep(0.1)
        
        # Save cache every 50 records to prevent loss if interrupted
        if new_additions > 0 and new_additions % 50 == 0:
            with open(settings.TMDB_CACHE_PATH, 'w', encoding='utf-8') as f:
                json.dump(cache, f, indent=2)
            print("  -> Intermediary cache saved to disk.")

    # Save final cache
    if new_additions > 0:
        os.makedirs(settings.PROCESSED_DATA_DIR, exist_ok=True)
        with open(settings.TMDB_CACHE_PATH, 'w', encoding='utf-8') as f:
            json.dump(cache, f, indent=2)
            
    elapsed = time.time() - start_time
    print(f"\nCache pre-warming finished in {elapsed:.1f} seconds.")
    print(f"Added {new_additions} new movies, {errors} errors. Total cached: {len(cache)}")

if __name__ == "__main__":
    main()
