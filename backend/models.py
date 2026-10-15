from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class RecommendationRequest(BaseModel):
    genres: List[str] = Field(..., min_items=1, description="List of user's primary genres (at least 1 required)")
    mood: str = Field(..., description="User's mood selection mapping to secondary genres")
    era: str = Field(..., description="Preferred era filter (e.g. Classics (pre-2000), Modern (2000–2015), Recent (2015+), Any)")
    gem_slider: float = Field(..., ge=0, le=100, description="Slider value representing hidden gems vs crowd favorites (0-100)")

class MovieRecommendation(BaseModel):
    movieId: int
    title: str
    genres: List[str]
    avg_rating: float
    vote_count: int
    genre_similarity: float
    quality_score: float
    final_score: float
    weighted_rating: float
    matched_genres: List[str]
    poster_url: Optional[str] = None
    overview: Optional[str] = None
    year: Optional[int] = None

class RecommendationResponse(BaseModel):
    era_relaxed: bool
    m_param_used: float
    percentile_used: float
    C_used: float
    results: List[MovieRecommendation]

class GenresResponse(BaseModel):
    genres: List[str]

class DatasetSummary(BaseModel):
    num_movies: int
    num_ratings: int
    num_users: int

class RatingHistogram(BaseModel):
    bins: List[float]
    counts: List[int]

class VoteVsRatingSample(BaseModel):
    movieId: int
    title: str
    vote_count: int
    avg_rating: float
    weighted_rating: float

class InsightsResponse(BaseModel):
    dataset_summary: DatasetSummary
    genre_counts: Dict[str, int]
    rating_histogram: RatingHistogram
    vote_vs_rating_sample: List[VoteVsRatingSample]
    C_global_mean: float
    m_default: float
