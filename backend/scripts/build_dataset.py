import os
import re
import pandas as pd
import numpy as np
from backend.config import settings

def main():
    print("Starting dataset building pipeline...")

    # Verify raw files exist
    for path in [settings.MOVIES_RAW_PATH, settings.RATINGS_RAW_PATH, settings.LINKS_RAW_PATH]:
        if not os.path.exists(path):
            print(f"Error: Required file {path} not found. Run download_data.py first.")
            return

    # 1. Ingest - Load CSVs
    print("Loading datasets...")
    movies_df = pd.read_csv(settings.MOVIES_RAW_PATH)
    ratings_df = pd.read_csv(settings.RATINGS_RAW_PATH)
    links_df = pd.read_csv(settings.LINKS_RAW_PATH)

    print(f"Raw movies: {len(movies_df)}")
    print(f"Raw ratings: {len(ratings_df)}")

    # 2. Clean
    print("Cleaning movies...")
    # Drop rows tagged (no genres listed)
    movies_df = movies_df[movies_df['genres'] != "(no genres listed)"].copy()
    print(f"Movies after dropping no-genres: {len(movies_df)}")

    # Extract release year from the title via regex e.g. "Toy Story (1995)" -> 1995
    # Some movies might not have a year or might have multiple parentheses, we match a 4-digit number inside parentheses at the end
    def extract_year(title):
        match = re.search(r'\((\d{4})\)\s*$', title)
        if match:
            return int(match.group(1))
        return np.nan

    movies_df['year'] = movies_df['title'].apply(extract_year)
    # Fill missing years with a sentinel or median year. Let's use NaN and handle it in recommendations.
    # Note: We keep the original title as it is (it contains the year).

    # 3. Aggregate ratings per movie
    print("Aggregating ratings...")
    rating_stats = ratings_df.groupby('movieId').agg(
        avg_rating=('rating', 'mean'),
        vote_count=('rating', 'count')
    ).reset_index()

    # Merge rating stats with movies
    movies_enriched = pd.merge(movies_df, rating_stats, on='movieId', how='left')
    # For movies with no ratings, set avg_rating = 0.0 and vote_count = 0
    movies_enriched['avg_rating'] = movies_enriched['avg_rating'].fillna(0.0)
    movies_enriched['vote_count'] = movies_enriched['vote_count'].fillna(0).astype(int)

    # 4. Join Links to get tmdbId
    print("Joining links...")
    # links_df has columns: movieId, imdbId, tmdbId
    # tmdbId can be NaN, let's keep it as float or fill with nan
    movies_enriched = pd.merge(movies_enriched, links_df[['movieId', 'tmdbId']], on='movieId', how='left')
    
    # Ensure processed directory exists
    os.makedirs(settings.PROCESSED_DATA_DIR, exist_ok=True)

    # 5. Save the enriched movies dataset
    print(f"Saving enriched dataset to {settings.PROCESSED_MOVIES_PATH}...")
    movies_enriched.to_csv(settings.PROCESSED_MOVIES_PATH, index=False)
    print("Dataset building complete!")

    # Verify the output shape and contents
    print(f"Enriched dataset shape: {movies_enriched.shape}")
    print(movies_enriched.head(2))

if __name__ == "__main__":
    main()
