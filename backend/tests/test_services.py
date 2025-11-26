"""
Unit tests for DayMate backend services.
"""
import pytest
from unittest.mock import patch, MagicMock
import os


class TestWeatherService:
    """Tests for weather service using Open-Meteo (FREE, no API key needed)."""
    
    @patch('app.services.weather.requests.get')
    def test_get_realtime_weather_success(self, mock_get):
        """Test successful weather fetch from Open-Meteo."""
        from app.services.weather import get_realtime_weather
        
        # Mock geocoding response
        geo_response = MagicMock()
        geo_response.status_code = 200
        geo_response.json.return_value = {
            "results": [{
                "name": "London",
                "country": "United Kingdom",
                "latitude": 51.5074,
                "longitude": -0.1278
            }]
        }
        
        # Mock weather response
        weather_response = MagicMock()
        weather_response.status_code = 200
        weather_response.json.return_value = {
            "current": {
                "temperature_2m": 25.5,
                "apparent_temperature": 26.0,
                "relative_humidity_2m": 60,
                "weather_code": 0,
                "wind_speed_10m": 3.5
            }
        }
        
        # Return different responses for each call
        mock_get.side_effect = [geo_response, weather_response]
        
        result = get_realtime_weather("London")
        
        assert result["error"] == False
        assert result["temp"] == 25.5
        assert result["city_name"] == "London"
        assert result["country"] == "United Kingdom"
    
    @patch('app.services.weather.requests.get')
    def test_get_realtime_weather_city_not_found(self, mock_get):
        """Test weather fetch with invalid city returns error dict."""
        from app.services.weather import get_realtime_weather
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"results": []}  # No results
        mock_get.return_value = mock_response
        
        result = get_realtime_weather("InvalidCity123XYZ")
        
        assert result["error"] == True
        assert "not found" in result["message"].lower()
    
    @patch('app.services.weather.requests.get')
    def test_get_coordinates_success(self, mock_get):
        """Test geocoding API returns coordinates."""
        from app.services.weather import get_coordinates
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "results": [{
                "name": "Paris",
                "country": "France",
                "latitude": 48.8566,
                "longitude": 2.3522
            }]
        }
        mock_get.return_value = mock_response
        
        result = get_coordinates("Paris")
        
        assert result is not None
        assert result["city_name"] == "Paris"
        assert result["country"] == "France"
        assert result["lat"] == 48.8566


class TestNewsService:
    """Tests for news service."""
    
    @patch('app.services.news.requests.get')
    @patch.dict(os.environ, {'NEWS_API_KEY': 'test_key'})
    def test_get_local_news_success(self, mock_get):
        """Test successful news fetch."""
        from app.services.news import get_local_news
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "articles": [
                {
                    "title": "Test News 1",
                    "description": "Description 1",
                    "url": "http://test.com/1",
                    "source": {"name": "Test Source"},
                    "publishedAt": "2024-01-01T00:00:00Z"
                },
                {
                    "title": "Test News 2",
                    "description": "Description 2",
                    "url": "http://test.com/2",
                    "source": {"name": "Test Source 2"},
                    "publishedAt": "2024-01-01T00:00:00Z"
                }
            ]
        }
        mock_get.return_value = mock_response
        
        result = get_local_news("London")
        
        assert result["error"] == False
        assert len(result["articles"]) == 2
        assert result["articles"][0]["title"] == "Test News 1"
    
    def test_get_fallback_news(self):
        """Test fallback news generation."""
        from app.services.news import get_fallback_news
        
        result = get_fallback_news("London")
        
        assert len(result) == 3
        assert "London" in result[0]["title"]


class TestAIAgent:
    """Tests for AI agent service."""
    
    def test_generate_fallback_plan_rain(self):
        """Test fallback plan for rainy weather."""
        from app.services.ai_agent import generate_fallback_plan
        
        weather_data = {
            "temp": 15,
            "condition": "Rain",
            "city_name": "London",
            "feels_like": 14,
            "humidity": 80,
            "description": "light rain"
        }
        news_data = [{"title": "Test News"}]
        
        result = generate_fallback_plan(weather_data, news_data, "London", True)
        
        assert "umbrella" in result.lower()
        assert "London" in result
    
    def test_generate_fallback_plan_hot(self):
        """Test fallback plan for hot weather."""
        from app.services.ai_agent import generate_fallback_plan
        
        weather_data = {
            "temp": 35,
            "condition": "Clear",
            "city_name": "Dubai",
            "feels_like": 38,
            "humidity": 40,
            "description": "clear sky"
        }
        news_data = []
        
        result = generate_fallback_plan(weather_data, news_data, "Dubai", True)
        
        assert "hydrated" in result.lower() or "heat" in result.lower()
    
    def test_generate_fallback_plan_cold(self):
        """Test fallback plan for cold weather."""
        from app.services.ai_agent import generate_fallback_plan
        
        weather_data = {
            "temp": 5,
            "condition": "Clear",
            "city_name": "Moscow",
            "feels_like": 2,
            "humidity": 70,
            "description": "clear sky"
        }
        news_data = []
        
        result = generate_fallback_plan(weather_data, news_data, "Moscow", True)
        
        assert "cold" in result.lower() or "bundle" in result.lower()
    
    def test_generate_fallback_plan_no_weather(self):
        """Test fallback plan when weather data is unavailable."""
        from app.services.ai_agent import generate_fallback_plan
        
        result = generate_fallback_plan(None, [], "Unknown City", False)
        
        assert "unavailable" in result.lower() or "flexible" in result.lower()
        assert "Unknown City" in result
    
    @patch('app.services.ai_agent.requests.post')
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test_key'})
    def test_generate_day_plan_with_gemini(self, mock_post):
        """Test AI plan generation with Gemini API."""
        from app.services.ai_agent import generate_day_plan
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {"text": "## Your Daily Plan\n- Morning: Go for a walk"}
                        ]
                    }
                }
            ]
        }
        mock_post.return_value = mock_response
        
        weather_data = {
            "temp": 20,
            "condition": "Clear",
            "city_name": "London",
            "country": "GB",
            "feels_like": 19,
            "humidity": 50,
            "description": "clear sky",
            "wind_speed": 3
        }
        news_data = [{"title": "Test News"}]
        
        result = generate_day_plan(weather_data, news_data, "London")
        
        assert result["error"] == False
        assert "Daily Plan" in result["plan"] or "Morning" in result["plan"]
    
    @patch.dict(os.environ, {'GEMINI_API_KEY': ''})
    def test_generate_day_plan_no_api_key(self):
        """Test AI plan generation falls back when no API key."""
        from app.services.ai_agent import generate_day_plan
        
        weather_data = {
            "temp": 20,
            "condition": "Clear",
            "city_name": "London",
            "country": "GB"
        }
        
        result = generate_day_plan(weather_data, [], "London")
        
        assert result["error"] == True
        assert "plan" in result
        assert len(result["plan"]) > 0
    
    @patch('app.services.ai_agent.requests.post')
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test_key'})
    def test_generate_day_plan_with_preferences(self, mock_post):
        """Test AI plan generation with user preferences."""
        from app.services.ai_agent import generate_day_plan
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {"text": "Plan with preferences"}
                        ]
                    }
                }
            ]
        }
        mock_post.return_value = mock_response
        
        weather_data = {"city_name": "London", "country": "GB"}
        preferences = {
            "travel_mode": "walking",
            "food_preference": "vegan",
            "activity_type": "outdoor",
            "pace": "relaxed"
        }
        
        result = generate_day_plan(weather_data, [], "London", preferences=preferences)
        
        assert result["error"] == False
        
        # Verify preferences were included in the prompt
        assert mock_post.called
        args, kwargs = mock_post.call_args
        request_body = kwargs['json']
        prompt_text = request_body['contents'][0]['parts'][0]['text']
        assert "USER PREFERENCES" in prompt_text
        assert "vegan" in prompt_text
