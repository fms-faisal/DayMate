"""
News service for fetching local news from NewsAPI.
"""
import os
import requests
from typing import List


def get_local_news(city: str, page_size: int = 5) -> dict:
    """
    Fetch local news articles related to a city.
    
    Args:
        city: City name to search news for
        page_size: Number of articles to fetch (default 5)
        
    Returns:
        Dictionary with articles list or error info
    """
    api_key = os.getenv("NEWS_API_KEY")
    
    if not api_key or api_key == "your_newsapi_key_here":
        return {
            "error": True,
            "message": "News API key not configured. Please add NEWS_API_KEY to your environment.",
            "articles": get_fallback_news(city)
        }
    
    url = f"https://newsapi.org/v2/everything"
    params = {
        "q": city,
        "pageSize": page_size,
        "sortBy": "publishedAt",
        "language": "en",
        "apiKey": api_key
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 401:
            return {
                "error": True,
                "message": "Invalid News API key. Please check your NEWS_API_KEY.",
                "articles": get_fallback_news(city)
            }
        
        if response.status_code == 426:
            # NewsAPI returns 426 when using free tier from non-localhost
            return {
                "error": True,
                "message": "News API free tier only works on localhost. Using fallback news.",
                "articles": get_fallback_news(city)
            }
        
        if response.status_code != 200:
            error_msg = response.json().get("message", "Unknown error")
            return {
                "error": True,
                "message": f"News service error: {error_msg}",
                "articles": get_fallback_news(city)
            }
        
        data = response.json()
        articles = data.get("articles", [])
        
        if not articles:
            return {
                "error": False,
                "message": "No news found for this location",
                "articles": get_fallback_news(city)
            }
        
        news_list = []
        for article in articles[:page_size]:
            news_list.append({
                "title": article.get("title", "No title"),
                "description": article.get("description"),
                "url": article.get("url", "#"),
                "source": article.get("source", {}).get("name", "Unknown"),
                "published_at": article.get("publishedAt")
            })
        
        return {
            "error": False,
            "articles": news_list
        }
        
    except requests.Timeout:
        return {
            "error": True,
            "message": "News service timed out. Please try again later.",
            "articles": get_fallback_news(city)
        }
    except requests.RequestException as e:
        return {
            "error": True,
            "message": f"News service unavailable: {str(e)}",
            "articles": get_fallback_news(city)
        }


def get_fallback_news(city: str) -> List[dict]:
    """
    Return fallback news when API is unavailable.
    
    Args:
        city: City name for context
        
    Returns:
        List of generic news placeholders
    """
    return [
        {
            "title": f"Local events and activities in {city}",
            "description": "Check local event listings for activities in your area.",
            "url": "#",
            "source": "DayMate",
            "published_at": None
        },
        {
            "title": f"Traffic and transportation updates for {city}",
            "description": "Stay informed about local traffic conditions.",
            "url": "#",
            "source": "DayMate",
            "published_at": None
        },
        {
            "title": f"Community news from {city}",
            "description": "Connect with local community happenings.",
            "url": "#",
            "source": "DayMate",
            "published_at": None
        }
    ]
