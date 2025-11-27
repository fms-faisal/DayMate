"""
Pydantic models for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List


class UserPreferences(BaseModel):
    """User preferences for personalized planning."""
    name: Optional[str] = Field(None, description="User's name for personalization")
    travel_mode: str = Field("any", description="Preferred travel mode (walking, public_transport, driving)")
    food_preference: str = Field("any", description="Dietary or cuisine preferences")
    activity_type: str = Field("mixed", description="Type of activities (outdoor, indoor, shopping, cultural)")
    pace: str = Field("medium", description="Pace of the day (relaxed, medium, packed)")
    budget: str = Field("medium", description="Budget level (low, medium, high)")
    companions: str = Field("solo", description="Who the user is with (solo, couple, family, friends)")
    interests: Optional[str] = Field(None, description="Additional interests or constraints")


class PlanRequest(BaseModel):
    """Request model for generating a daily plan."""
    city: Optional[str] = Field(None, min_length=1, max_length=100, description="City name for weather and news")
    latitude: Optional[float] = Field(None, ge=-90, le=90, description="Latitude for location-based weather")
    longitude: Optional[float] = Field(None, ge=-180, le=180, description="Longitude for location-based weather")
    profile: str = Field("standard", description="User profile type (standard, child, elderly)")
    preferences: Optional[UserPreferences] = None


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


class TrafficAlert(BaseModel):
    """Traffic or emergency alert structure."""
    title: str
    description: Optional[str] = None
    url: str
    source: str
    published_at: Optional[str] = None
    alert_type: str = Field("traffic", description="Type: 'traffic' or 'emergency'")
    priority: str = Field("medium", description="Priority: 'high' or 'medium'")


class RoadCondition(BaseModel):
    """Real-time road condition data."""
    road_name: str
    congestion_level: str = Field(..., description="Traffic congestion: 'free', 'light', 'moderate', 'heavy', 'jammed'")
    speed_kmh: float
    normal_speed_kmh: float
    incident_type: Optional[str] = None
    description: Optional[str] = None
    last_updated: str


class TrafficIncident(BaseModel):
    """Traffic incident or event."""
    incident_type: str = Field(..., description="Type: 'accident', 'construction', 'road_closure', 'weather', 'event'")
    severity: str = Field(..., description="Severity: 'minor', 'major', 'critical'")
    road_name: str
    location: str
    description: str
    start_time: str
    estimated_end_time: Optional[str] = None
    delay_minutes: Optional[int] = None


class TrafficData(BaseModel):
    """Complete traffic information response."""
    error: bool = False
    road_conditions: List[RoadCondition] = []
    incidents: List[TrafficIncident] = []
    last_updated: str
    data_source: str
    is_simulated: bool = False


class ServiceError(BaseModel):
    """Error information for a specific service."""
    service: str
    message: str


class PlanResponse(BaseModel):
    """Response model containing weather, news, and AI-generated plan."""
    weather: Optional[WeatherData] = None
    news: List[NewsArticle] = []
    traffic_data: Optional[TrafficData] = None
    traffic_alerts: List[TrafficAlert] = []  # Keep for backward compatibility
    has_high_priority_alerts: bool = False
    ai_plan: str
    city: str
    errors: List[ServiceError] = []
    partial_success: bool = True


class ChatRequest(BaseModel):
    """Request model for follow-up chat."""
    message: str
    city: str
    weather: Optional[WeatherData] = None
    news: List[NewsArticle] = []
    previous_plan: Optional[str] = None


class ChatResponse(BaseModel):
    """Response model for chat."""
    response: str
    error: bool = False
    message: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    message: str
