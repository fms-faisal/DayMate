"""
News service for fetching local news using Google News RSS (Free & Reliable).
"""
import os
import requests
import feedparser
import urllib.parse
from typing import List


def get_local_news(city: str, page_size: int = 5) -> dict:
    """
    Fetch local news articles related to a city using Google News RSS.
    
    Args:
        city: City name to search news for
        page_size: Number of articles to fetch (default 5)
        
    Returns:
        Dictionary with articles list or error info
    """
    try:
        # Encode city name for URL
        encoded_city = urllib.parse.quote(city)
        
        # Google News RSS URL - searches for the city
        rss_url = f"https://news.google.com/rss/search?q={encoded_city}&hl=en-US&gl=US&ceid=US:en"
        
        # Parse the feed
        feed = feedparser.parse(rss_url)
        
        if not feed.entries:
            return {
                "error": False,
                "message": f"No news found for {city}",
                "articles": get_fallback_news(city)
            }
            
        news_list = []
        for entry in feed.entries[:page_size]:
            # Extract image if available (Google RSS doesn't always provide clean images, but we can try)
            # For now, we'll stick to text to be safe and fast
            
            news_list.append({
                "title": entry.title,
                "description": entry.summary if hasattr(entry, 'summary') else "Click to read more.",
                "url": entry.link,
                "source": entry.source.title if hasattr(entry, 'source') else "Google News",
                "published_at": entry.published if hasattr(entry, 'published') else None
            })
            
        return {
            "error": False,
            "articles": news_list
        }
        
    except Exception as e:
        print(f"Error fetching news: {e}")
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
