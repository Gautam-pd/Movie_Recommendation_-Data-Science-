import os
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize
from backend.config import settings

class MovieRecommender:
    def __init__(self):
        self.movies_df = None
        self.C_global_mean = None
        self.vectorizer = None
        self.tfidf_matrix = None
        self.load_data()

    def load_data(self):
        """Loads dataset and fits TF-IDF on genres."""
        if not os.path.exists(settings.PROCESSED_MOVIES_PATH):
            raise FileNotFoundError(
                f"Enriched movies file not found at {settings.PROCESSED_MOVIES_PATH}. "
                "Please run build_dataset.py first."
            )
        
        # Load preprocessed movies
        self.movies_df = pd.read_csv(settings.PROCESSED_MOVIES_PATH)
        
        # Load ratings to compute global mean C
        if os.path.exists(settings.RATINGS_RAW_PATH):
            ratings_df = pd.read_csv(settings.RATINGS_RAW_PATH)
            self.C_global_mean = float(ratings_df['rating'].mean())
        else:
            # Fallback to standard C if ratings.csv is missing
            self.C_global_mean = 3.5016
        
        # Precompute genre tokens for vectorization
        # Replace '|' with space, and replace '-' with '_' to treat e.g. "Sci-Fi" as "sci_fi"
        self.movies_df['genres_tokenized'] = self.movies_df['genres'].fillna('').str.replace('|', ' ').str.replace('-', '_')
        
        # Fit vectorizer
        self.vectorizer = TfidfVectorizer(token_pattern=r'(?u)\b\w+\b', lowercase=True)
        self.tfidf_matrix = self.vectorizer.fit_transform(self.movies_df['genres_tokenized'])
        print(f"MovieRecommender loaded: {len(self.movies_df)} movies, fitted TF-IDF vocab size: {len(self.vectorizer.vocabulary_)}")

    def recommend(self, genres: list, mood: str, era: str, gem_slider: float):
        """
        Runs the recommendation scoring engine.
        
        Step A: Filter candidates by era range. Widen by 10 years if <20 candidates.
        Step B: Build the user vector using primary (1.0) and secondary (0.5) genres.
        Step C: Compute genre_similarity using cosine similarity.
        Step D: Compute quality_score (min-max normalized WR based on dynamic m_param).
        Step E: Combine scores (0.6 * genre_similarity + 0.4 * quality_score).
        Step F: Sort and return top 15.
        """
        if self.movies_df is None:
            self.load_data()

        df = self.movies_df.copy()
        
        # Step A: Filter by era range
        era_relaxed = False
        
        def filter_by_era(df_candidate, era_str, relaxation_offset=0):
            if era_str == "Any":
                return df_candidate
            elif era_str == "Classics (pre-2000)":
                return df_candidate[df_candidate['year'] < (2000 + relaxation_offset)]
            elif era_str == "Modern (2000–2015)":
                return df_candidate[
                    (df_candidate['year'] >= (2000 - relaxation_offset)) & 
                    (df_candidate['year'] <= (2015 + relaxation_offset))
                ]
            elif era_str == "Recent (2015+)":
                return df_candidate[df_candidate['year'] >= (2015 - relaxation_offset)]
            return df_candidate

        # Try filtering with 0 offset
        filtered_df = filter_by_era(df, era, relaxation_offset=0)
        
        # If fewer than 20 candidates match, widen by 10 years
        if era != "Any" and len(filtered_df) < 20:
            filtered_df = filter_by_era(df, era, relaxation_offset=10)
            era_relaxed = True
            print(f"Era filter relaxed: initial search returned {len(filtered_df)} items.")

        if len(filtered_df) == 0:
            # Fallback to any if still empty
            filtered_df = df.copy()
            era_relaxed = True

        # Extract indices of filtered movies
        candidate_indices = filtered_df.index.tolist()
        candidate_tfidf = self.tfidf_matrix[candidate_indices]

        # Step B: Build the user vector
        # Primary genres -> weight 1.0
        # Mood-derived secondary genres -> weight 0.5
        secondary_genres = settings.MOOD_GENRE_MAP.get(mood, [])
        
        user_tf = np.zeros((1, len(self.vectorizer.vocabulary_)))
        
        # Populate TF vector
        for g in genres:
            g_token = g.lower().replace('-', '_')
            if g_token in self.vectorizer.vocabulary_:
                idx = self.vectorizer.vocabulary_[g_token]
                user_tf[0, idx] = 1.0
                
        for g in secondary_genres:
            g_token = g.lower().replace('-', '_')
            if g_token in self.vectorizer.vocabulary_:
                idx = self.vectorizer.vocabulary_[g_token]
                # Keep primary at 1.0 weight, set secondary at 0.5
                if user_tf[0, idx] < 1.0:
                    user_tf[0, idx] = 0.5
                    
        # Apply IDF weighting
        user_vector = user_tf * self.vectorizer.idf_
        user_vector_norm = normalize(user_vector, norm='l2')

        # Step C: genre_similarity = cosine_similarity(user_vector, movie_vector)
        # Cosine similarity for candidates
        genre_sims = cosine_similarity(candidate_tfidf, user_vector_norm).ravel()

        # Step D: m_param & Weighted Rating
        # Map gem_slider (0-100) linearly to percentile (30-90)
        percentile_val = 30 + (gem_slider / 100.0) * (90 - 30)
        
        # Compute percentile threshold across the whole catalog
        # (excluding 0 rating counts to make percentile representative of rated movies)
        rated_votes = self.movies_df[self.movies_df['vote_count'] > 0]['vote_count'].values
        if len(rated_votes) > 0:
            m_param = float(np.percentile(rated_votes, percentile_val))
        else:
            m_param = 1.0
            
        # Recompute WR for candidates
        v = filtered_df['vote_count'].values
        R = filtered_df['avg_rating'].values
        C = self.C_global_mean
        
        WR = (v / (v + m_param)) * R + (m_param / (v + m_param)) * C
        
        # Min-max normalize WR across the candidate set to scale [0, 1]
        min_wr = WR.min()
        max_wr = WR.max()
        if max_wr > min_wr:
            quality_scores = (WR - min_wr) / (max_wr - min_wr)
        else:
            quality_scores = np.ones_like(WR)

        # Step E: Combine scores
        final_scores = (
            settings.GENRE_SIMILARITY_WEIGHT * genre_sims + 
            settings.QUALITY_SCORE_WEIGHT * quality_scores
        )

        # Step F: Return top 15 recommendations
        # Build results DataFrame
        results_df = filtered_df.copy()
        results_df['genre_similarity'] = genre_sims
        results_df['quality_score'] = quality_scores
        results_df['final_score'] = final_scores
        results_df['weighted_rating_computed'] = WR

        # Matched genres intersection (based on user primary genres)
        user_genres_set = set(genres)
        def get_matches(genre_str):
            if not isinstance(genre_str, str):
                return []
            movie_genres = genre_str.split('|')
            return list(user_genres_set & set(movie_genres))

        results_df['matched_genres'] = results_df['genres'].apply(get_matches)

        # Sort descending
        top_candidates = results_df.sort_values(by='final_score', ascending=False).head(settings.TOP_N)

        results = []
        for row in top_candidates.itertuples():
            # Build poster URL (or fallback)
            # Default fallback poster: a movie reel styled SVG or placeholder URL
            poster_url = None  # Will be populated by the TMDB enricher, or UI placeholder
            
            results.append({
                "movieId": int(row.movieId),
                "title": str(row.title),
                "genres": str(row.genres).split('|'),
                "avg_rating": round(float(row.avg_rating), 2),
                "vote_count": int(row.vote_count),
                "genre_similarity": round(float(row.genre_similarity), 4),
                "quality_score": round(float(row.quality_score), 4),
                "final_score": round(float(row.final_score), 4),
                "weighted_rating": round(float(row.weighted_rating_computed), 4),
                "matched_genres": row.matched_genres,
                "poster_url": poster_url,
                "year": int(row.year) if not pd.isna(row.year) else None
            })

        return {
            "era_relaxed": era_relaxed,
            "m_param_used": round(m_param, 2),
            "percentile_used": round(percentile_val, 1),
            "C_used": round(C, 4),
            "results": results
        }
