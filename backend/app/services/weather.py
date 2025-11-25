"""
Weather service for fetching real-time weather data from Open-Meteo API.
Open-Meteo is completely FREE - no API key required!
"""
import requests


# Weather code to condition mapping (WMO Weather interpretation codes)
WEATHER_CODES = {
    0: ("Clear", "clear sky", "01d"),
    1: ("Clear", "mainly clear", "01d"),
    2: ("Clouds", "partly cloudy", "02d"),
    3: ("Clouds", "overcast", "03d"),
    45: ("Fog", "fog", "50d"),
    48: ("Fog", "depositing rime fog", "50d"),
    51: ("Drizzle", "light drizzle", "09d"),
    53: ("Drizzle", "moderate drizzle", "09d"),
    55: ("Drizzle", "dense drizzle", "09d"),
    56: ("Drizzle", "light freezing drizzle", "09d"),
    57: ("Drizzle", "dense freezing drizzle", "09d"),
    61: ("Rain", "slight rain", "10d"),
    63: ("Rain", "moderate rain", "10d"),
    65: ("Rain", "heavy rain", "10d"),
    66: ("Rain", "light freezing rain", "13d"),
    67: ("Rain", "heavy freezing rain", "13d"),
    71: ("Snow", "slight snow", "13d"),
    73: ("Snow", "moderate snow", "13d"),
    75: ("Snow", "heavy snow", "13d"),
    77: ("Snow", "snow grains", "13d"),
    80: ("Rain", "slight rain showers", "09d"),
    81: ("Rain", "moderate rain showers", "09d"),
    82: ("Rain", "violent rain showers", "09d"),
    85: ("Snow", "slight snow showers", "13d"),
    86: ("Snow", "heavy snow showers", "13d"),
    95: ("Thunderstorm", "thunderstorm", "11d"),
    96: ("Thunderstorm", "thunderstorm with slight hail", "11d"),
    99: ("Thunderstorm", "thunderstorm with heavy hail", "11d"),
}


def get_coordinates(city: str) -> dict:
    """
    Get coordinates for a city using Open-Meteo Geocoding API (FREE).
    
    Args:
        city: Name of the city
        
    Returns:
        Dictionary with lat, lon, city_name, country or error
    """
    url = f"https://geocoding-api.open-meteo.com/v1/search"
    params = {
        "name": city,
        "count": 1,
        "language": "en",
        "format": "json"
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code != 200:
            return {"error": True, "message": "Geocoding service unavailable"}
        
        data = response.json()
        
        if "results" not in data or len(data["results"]) == 0:
            return {
                "error": True,
                "message": f"City '{city}' not found. Please check the spelling and try again."
            }
        
        result = data["results"][0]
        return {
            "error": False,
            "lat": result["latitude"],
            "lon": result["longitude"],
            "city_name": result["name"],
            "country": result.get("country_code", result.get("country", ""))
        }
        
    except requests.Timeout:
        return {"error": True, "message": "Geocoding service timed out"}
    except requests.RequestException as e:
        return {"error": True, "message": f"Geocoding error: {str(e)}"}


def get_realtime_weather(city: str) -> dict:
    """
    Fetch real-time weather data for a given city using Open-Meteo API.
    NO API KEY REQUIRED - completely free!
    
    Args:
        city: Name of the city to get weather for
        
    Returns:
        Dictionary containing weather information, or error info
    """
    # First, get coordinates for the city
    geo_result = get_coordinates(city)
    
    if geo_result.get("error"):
        return geo_result
    
    lat = geo_result["lat"]
    lon = geo_result["lon"]
    city_name = geo_result["city_name"]
    country = geo_result["country"]
    
    # Fetch weather data from Open-Meteo
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
        "timezone": "auto"
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code != 200:
            return {
                "error": True,
                "message": "Weather service temporarily unavailable. Please try again."
            }
        
        data = response.json()
        current = data.get("current", {})
        
        # Get weather condition from code
        weather_code = current.get("weather_code", 0)
        condition, description, icon = WEATHER_CODES.get(weather_code, ("Clear", "clear sky", "01d"))
        
        weather_info = {
            "error": False,
            "temp": round(current.get("temperature_2m", 0), 1),
            "feels_like": round(current.get("apparent_temperature", 0), 1),
            "humidity": current.get("relative_humidity_2m", 0),
            "condition": condition,
            "description": description,
            "icon": icon,
            "wind_speed": round(current.get("wind_speed_10m", 0) / 3.6, 1),  # Convert km/h to m/s
            "city_name": city_name,
            "country": country
        }
        
        return weather_info
        
    except requests.Timeout:
        return {
            "error": True,
            "message": "Weather service timed out. Please try again later."
        }
    except requests.RequestException as e:
        return {
            "error": True,
            "message": f"Weather service unavailable: {str(e)}"
        }
    except (KeyError, TypeError) as e:
        return {
            "error": True,
            "message": "Error parsing weather data. Please try again."
        }


def reverse_geocode(lat: float, lon: float) -> dict:
    """
    Get city name from coordinates using Open-Meteo reverse geocoding.
    
    Args:
        lat: Latitude
        lon: Longitude
        
    Returns:
        Dictionary with city_name, country or error
    """
    # Open-Meteo doesn't have reverse geocoding, so we'll use a free alternative
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {
        "lat": lat,
        "lon": lon,
        "format": "json",
        "zoom": 10
    }
    headers = {
        "User-Agent": "DayMate/1.0"  # Required by Nominatim
    }
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        
        if response.status_code != 200:
            return {"error": True, "message": "Reverse geocoding unavailable"}
        
        data = response.json()
        address = data.get("address", {})
        
        # Try to get city name from various fields
        city_name = (
            address.get("city") or 
            address.get("town") or 
            address.get("village") or 
            address.get("municipality") or
            address.get("county") or
            "Unknown Location"
        )
        country = address.get("country_code", "").upper() or address.get("country", "")
        
        return {
            "error": False,
            "city_name": city_name,
            "country": country
        }
        
    except Exception as e:
        return {"error": True, "message": f"Reverse geocoding error: {str(e)}"}


def get_weather_by_coordinates(lat: float, lon: float) -> dict:
    """
    Fetch real-time weather data for given coordinates using Open-Meteo API.
    NO API KEY REQUIRED - completely free!
    
    Args:
        lat: Latitude
        lon: Longitude
        
    Returns:
        Dictionary containing weather information, or error info
    """
    # Get city name from coordinates
    geo_result = reverse_geocode(lat, lon)
    city_name = geo_result.get("city_name", "Your Location") if not geo_result.get("error") else "Your Location"
    country = geo_result.get("country", "") if not geo_result.get("error") else ""
    
    # Fetch weather data from Open-Meteo
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
        "timezone": "auto"
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code != 200:
            return {
                "error": True,
                "message": "Weather service temporarily unavailable. Please try again."
            }
        
        data = response.json()
        current = data.get("current", {})
        
        # Get weather condition from code
        weather_code = current.get("weather_code", 0)
        condition, description, icon = WEATHER_CODES.get(weather_code, ("Clear", "clear sky", "01d"))
        
        weather_info = {
            "error": False,
            "temp": round(current.get("temperature_2m", 0), 1),
            "feels_like": round(current.get("apparent_temperature", 0), 1),
            "humidity": current.get("relative_humidity_2m", 0),
            "condition": condition,
            "description": description,
            "icon": icon,
            "wind_speed": round(current.get("wind_speed_10m", 0) / 3.6, 1),  # Convert km/h to m/s
            "city_name": city_name,
            "country": country
        }
        
        return weather_info
        
    except requests.Timeout:
        return {
            "error": True,
            "message": "Weather service timed out. Please try again later."
        }
    except requests.RequestException as e:
        return {
            "error": True,
            "message": f"Weather service unavailable: {str(e)}"
        }
    except (KeyError, TypeError) as e:
        return {
            "error": True,
            "message": "Error parsing weather data. Please try again."
        }
