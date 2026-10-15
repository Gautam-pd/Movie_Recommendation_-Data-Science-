from fastapi import APIRouter, Request
from backend.models import GenresResponse

router = APIRouter(prefix="/api/genres", tags=["genres"])

@router.get("", response_model=GenresResponse)
def get_genres(request: Request):
    """
    Returns a list of all unique genres dynamically derived from the dataset.
    """
    recommender = request.app.state.recommender
    
    # We can extract the vocabulary keys from TF-IDF vectorizer
    # But those are tokenized (e.g. sci_fi instead of Sci-Fi).
    # It is cleaner to extract them directly from the raw 'genres' strings of movies_df.
    if recommender.movies_df is not None:
        genres_set = set()
        for genres_str in recommender.movies_df['genres'].dropna():
            for g in genres_str.split('|'):
                if g and g != "(no genres listed)":
                    genres_set.add(g)
        genres_list = sorted(list(genres_set))
    else:
        # Fallback to standard MovieLens genres if dataframe is somehow not loaded
        genres_list = [
            "Action", "Adventure", "Animation", "Children", "Comedy", "Crime",
            "Documentary", "Drama", "Fantasy", "Film-Noir", "Horror", "Musical",
            "Mystery", "Romance", "Sci-Fi", "Thriller", "War", "Western"
        ]
        
    return {"genres": genres_list}
