import os
import json
import pandas as pd
import numpy as np
from backend.config import settings

def main():
    print("Running Exploratory Data Analysis (EDA) script...")

    # Load processed and raw datasets
    if not os.path.exists(settings.PROCESSED_MOVIES_PATH):
        print(f"Error: {settings.PROCESSED_MOVIES_PATH} not found. Run build_dataset.py first.")
        return
    if not os.path.exists(settings.RATINGS_RAW_PATH):
        print(f"Error: {settings.RATINGS_RAW_PATH} not found.")
        return

    movies_df = pd.read_csv(settings.PROCESSED_MOVIES_PATH)
    ratings_df = pd.read_csv(settings.RATINGS_RAW_PATH)

    # 1. Dataset summary
    num_movies = len(movies_df)
    num_ratings = len(ratings_df)
    num_users = ratings_df['userId'].nunique()

    # 2. Compute C (global mean rating)
    C_global_mean = float(ratings_df['rating'].mean())

    # 3. Compute vote count percentiles
    vote_counts = movies_df['vote_count'].values
    # Filter out movies with 0 votes to compute percentiles on rated catalog
    rated_movies = movies_df[movies_df['vote_count'] > 0]
    rated_vote_counts = rated_movies['vote_count'].values
    
    # default slider is 50%, which maps to the 60th percentile of vote counts
    m_default = float(np.percentile(vote_counts, 60))

    # 4. Top 10 movies by Weighted Rating (WR) using default m
    m = m_default
    movies_df['weighted_rating'] = (movies_df['vote_count'] / (movies_df['vote_count'] + m)) * movies_df['avg_rating'] + \
                                   (m / (movies_df['vote_count'] + m)) * C_global_mean
    
    top_10 = movies_df.sort_values(by='weighted_rating', ascending=False).head(10)
    print("\n--- TOP 10 MOVIES BY WEIGHTED RATING (Default m =", m, ") ---")
    for idx, row in enumerate(top_10.itertuples(), 1):
        print(f"{idx}. {row.title} (Year: {row.year}) | Votes: {row.vote_count} | Avg: {row.avg_rating:.2f} | WR: {row.weighted_rating:.2f} | Genres: {row.genres}")

    # 5. Genre counts
    genre_counts = {}
    for genres_str in movies_df['genres'].dropna():
        for genre in genres_str.split('|'):
            genre_counts[genre] = genre_counts.get(genre, 0) + 1
    
    # Sort genre counts descending
    genre_counts = dict(sorted(genre_counts.items(), key=lambda item: item[1], reverse=True))

    # 6. Rating histogram
    rating_counts = ratings_df['rating'].value_counts()
    # Bins: [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]
    bins = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]
    histogram_counts = [int(rating_counts.get(b, 0)) for b in bins]
    rating_histogram = {
        "bins": bins,
        "counts": histogram_counts
    }

    # 7. Vote count vs average rating (limit to a clean sample for charts to render quickly)
    # Let's take movies with at least 5 ratings, sorting by vote_count descending and limit to top 800
    chart_sample = movies_df[movies_df['vote_count'] >= 5].sort_values(by='vote_count', ascending=False).head(800)
    vote_vs_rating_sample = []
    for row in chart_sample.itertuples():
        vote_vs_rating_sample.append({
            "movieId": int(row.movieId),
            "title": str(row.title),
            "vote_count": int(row.vote_count),
            "avg_rating": float(row.avg_rating),
            "weighted_rating": float(row.weighted_rating)
        })

    # Prepare insights JSON structure
    insights = {
        "dataset_summary": {
            "num_movies": num_movies,
            "num_ratings": num_ratings,
            "num_users": num_users
        },
        "genre_counts": genre_counts,
        "rating_histogram": rating_histogram,
        "vote_vs_rating_sample": vote_vs_rating_sample,
        "C_global_mean": round(C_global_mean, 4),
        "m_default": round(m_default, 2)
    }

    # Save to json file
    with open(settings.EDA_STATS_PATH, 'w', encoding='utf-8') as f:
        json.dump(insights, f, indent=2)

    print(f"\nSaved EDA statistics to {settings.EDA_STATS_PATH}")
    print(f"Global mean rating C = {C_global_mean:.4f}")
    print(f"Default m (60th percentile of vote counts) = {m_default}")
    print(f"Dataset Stats: {num_movies} movies, {num_ratings} ratings, {num_users} users")

if __name__ == "__main__":
    main()
