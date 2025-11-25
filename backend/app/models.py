"""
Pydantic models for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List


class PlanRequest(BaseModel):
    """Request model for generating a daily plan."""
    city: Optional[str] = Field(None, min_length=1, max_length=100, description="City name for weather and news")
    latitude: Optional[float] = Field(None, ge=-90, le=90, description="Latitude for location-based weather")
    longitude: Optional[float] = Field(None, ge=-180, le=180, description="Longitude for location-based weather")


class WeatherData(BaseModel):
    """Weather information structure."""
    temp: float
    feels_like: float
    humidity: int
    condition: str
    description: str
    icon: str
    wind_speed: float
    city_name: str
    country: str


class NewsArticle(BaseModel):
    """News article structure."""
    title: str
    description: Optional[str] = None
    url: str
    source: str
    published_at: Optional[str] = None


class ServiceError(BaseModel):
    """Error information for a specific service."""
    service: str
    message: str


class PlanResponse(BaseModel):
    """Response model containing weather, news, and AI-generated plan."""
    weather: Optional[WeatherData] = None
    news: List[NewsArticle] = []
    ai_plan: str
    city: str
    errors: List[ServiceError] = []
    partial_success: bool = True


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    message: str
