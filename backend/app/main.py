"""
DayMate Backend - FastAPI Application Entry Point

An AI-powered assistant that helps users plan their day by combining
real-time weather data, local news, and intelligent recommendations.
"""
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.models import PlanRequest, PlanResponse, WeatherData, NewsArticle, HealthResponse, ServiceError, ChatRequest, ChatResponse
from app.services.weather import get_realtime_weather, get_weather_by_coordinates
from app.services.news import get_local_news
from app.services.ai_agent import generate_day_plan, generate_followup

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="DayMate API",
    description="AI-powered daily planning assistant combining weather, news, and intelligent recommendations",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS - Allow all origins in development, restrict in production
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set specific frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint - API health check."""
    return HealthResponse(
        status="healthy",
        message="Welcome to DayMate API! Visit /docs for API documentation."
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for deployment monitoring."""
    return HealthResponse(
        status="healthy",
        message="DayMate API is running"
    )


@app.post("/api/plan", response_model=PlanResponse)
async def generate_plan(request: PlanRequest):
    """
    Generate a personalized daily plan based on weather and local news.
    Gracefully handles partial failures - returns available data with error messages.
    
    Supports both:
    - City name lookup (request.city)
    - Coordinates for real-time location (request.latitude, request.longitude)
    
    Args:
        request: PlanRequest containing city name OR latitude/longitude coordinates
        
    Returns:
        PlanResponse with weather data, news articles, AI plan, and any service errors
    """
    # Determine if using coordinates or city name
    use_coordinates = request.latitude is not None and request.longitude is not None
    city = request.city.strip() if request.city else None
    
    if not use_coordinates and not city:
        raise HTTPException(status_code=400, detail="Either city name or coordinates (latitude/longitude) are required")
    
    errors = []
    weather_response = None
    news_response = []
    
    # Fetch weather data (graceful handling)
    if use_coordinates:
        weather_data = get_weather_by_coordinates(request.latitude, request.longitude)
    else:
        weather_data = get_realtime_weather(city)
    
    has_weather = not weather_data.get("error", False)
    
    # Use the city name from weather response (more accurate, especially for coordinates)
    display_city = weather_data.get("city_name", city or "Your Location") if has_weather else (city or "Your Location")
    
    if has_weather:
        weather_response = WeatherData(
            temp=weather_data["temp"],
            feels_like=weather_data["feels_like"],
            humidity=weather_data["humidity"],
            condition=weather_data["condition"],
            description=weather_data["description"],
            icon=weather_data["icon"],
            wind_speed=weather_data["wind_speed"],
            city_name=weather_data["city_name"],
            country=weather_data["country"]
        )
    else:
        errors.append(ServiceError(
            service="weather",
            message=weather_data.get("message", "Weather service unavailable")
        ))
    
    # Fetch news data (graceful handling) - use display_city for news search
    news_result = get_local_news(display_city)
    news_articles = news_result.get("articles", [])
    
    if news_result.get("error", False):
        errors.append(ServiceError(
            service="news",
            message=news_result.get("message", "News service unavailable")
        ))
    
    news_response = [
        NewsArticle(
            title=article["title"],
            description=article.get("description"),
            url=article["url"],
            source=article["source"],
            published_at=article.get("published_at")
        )
        for article in news_articles
    ]
    
    # Generate AI plan (uses available data, graceful fallback)
    ai_result = generate_day_plan(
        weather_data if has_weather else None,
        news_articles,
        display_city,
        request.profile,
        request.preferences.model_dump() if request.preferences else None
    )
    
    if ai_result.get("error", False):
        errors.append(ServiceError(
            service="ai",
            message=ai_result.get("message", "AI service unavailable")
        ))
    
    ai_plan = ai_result.get("plan", "Unable to generate plan. Please try again later.")
    
    # Determine if this is a partial success
    partial_success = has_weather or len(news_articles) > 0 or ai_plan
    
    return PlanResponse(
        weather=weather_response,
        news=news_response,
        ai_plan=ai_plan,
        city=display_city,
        errors=errors,
        partial_success=partial_success
    )


@app.get("/api/weather/{city}")
async def get_weather(city: str):
    """
    Get weather data for a specific city.
    
    Args:
        city: Name of the city
        
    Returns:
        Weather data dictionary or error info
    """
    result = get_realtime_weather(city)
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result


@app.get("/api/news/{city}")
async def get_news(city: str):
    """
    Get news articles for a specific city.
    
    Args:
        city: Name of the city
        
    Returns:
        List of news articles or error info
    """
    result = get_local_news(city)
    return result


@app.post("/api/chat", response_model=ChatResponse)
async def chat_followup(request: ChatRequest):
    """
    Handle follow-up chat messages about the plan.
    
    Args:
        request: ChatRequest containing message, context, and previous plan
        
    Returns:
        ChatResponse with the AI's answer
    """
    # Convert Pydantic models back to dicts for the service
    weather_dict = request.weather.dict() if request.weather else None
    news_list = [article.dict() for article in request.news]
    
    result = generate_followup(
        weather_data=weather_dict,
        news_data=news_list,
        city=request.city,
        previous_plan=request.previous_plan or "",
        user_message=request.message
    )
    
    return ChatResponse(
        response=result.get("response", ""),
        error=result.get("error", False),
        message=result.get("message")
    )
