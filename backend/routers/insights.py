import os
import json
from fastapi import APIRouter, HTTPException
from backend.models import InsightsResponse
from backend.config import settings

router = APIRouter(prefix="/api/insights", tags=["insights"])

@router.get("", response_model=InsightsResponse)
def get_insights():
    """
    Returns precalculated dataset exploratory statistics (genre distributions,
    rating frequencies, vote vs rating sample, global C and m parameters)
    for the frontend charts.
    """
    if not os.path.exists(settings.EDA_STATS_PATH):
        raise HTTPException(
            status_code=404, 
            detail=f"Insights stats not found at {settings.EDA_STATS_PATH}. Please run the EDA analysis script first."
        )
        
    try:
        with open(settings.EDA_STATS_PATH, 'r', encoding='utf-8') as f:
            stats = json.load(f)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading insights stats: {e}")
