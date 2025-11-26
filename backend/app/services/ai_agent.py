"""
AI Agent service for generating personalized daily plans using Google Gemini.
"""
import os
import requests


def generate_day_plan(weather_data: dict, news_data: list, city: str = None, profile: str = "standard", preferences: dict = None) -> dict:
    """
    Generate a personalized daily plan based on weather and news data.
    
    Args:
        weather_data: Dictionary containing weather information (can be None or have error)
        news_data: List of news article dictionaries
        city: City name for context when weather is unavailable
        profile: User profile type (standard, child, elderly)
        preferences: Dictionary of user preferences (travel, food, etc.)
        
    Returns:
        Dictionary with plan and optional error info
    """
    api_key = os.getenv("GEMINI_API_KEY")
    
    # Check if we have valid weather data
    has_weather = weather_data and not weather_data.get("error", False)
    has_news = news_data and len(news_data) > 0
    
    if not api_key or api_key == "your_gemini_api_key_here":
        # Return a rule-based plan if Gemini is not configured
        return {
            "error": True,
            "message": "AI API key not configured. Using basic recommendations.",
            "plan": generate_fallback_plan(weather_data, news_data, city, has_weather)
        }
    
    try:
        # Build context based on available data
        context_parts = []
        location_name = weather_data.get('city_name', city or 'Unknown') if has_weather else (city or 'Unknown')
        country = weather_data.get('country', '') if has_weather else ''
        temp = weather_data.get('temp', 15) if has_weather else 15
        condition = weather_data.get('condition', 'variable') if has_weather else 'variable'
        
        if has_weather:
            context_parts.append(f"""WEATHER:
- Location: {location_name}, {country}
- Temperature: {temp}°C (feels like {weather_data.get('feels_like', temp)}°C)
- Conditions: {condition} - {weather_data.get('description', '')}
- Humidity: {weather_data.get('humidity', 'N/A')}%
- Wind: {weather_data.get('wind_speed', 'N/A')} m/s""")
        else:
            context_parts.append(f"WEATHER: Not available for {city or 'this location'}")
        
        # Prepare news summary
        if has_news:
            news_headlines = [f"• {article.get('title', '')}" for article in news_data[:5] if article.get("title")]
            news_summary = "\n".join(news_headlines)
            context_parts.append(f"\nTODAY'S NEWS:\n{news_summary}")
        
        context = "\n".join(context_parts)
        
        # Define profile-specific instructions
        profile_instructions = ""
        if profile == "child":
            profile_instructions = """
PROFILE: FAMILY WITH CHILDREN
- Focus on kid-friendly activities (parks with playgrounds, interactive museums, zoos)
- Suggest family-friendly restaurants with kid menus
- Keep travel times short and manageable
- Mention facilities like restrooms or baby changing spots if relevant
- Avoid crowded bars or quiet art galleries unless they have kids' programs"""
        elif profile == "elderly":
            profile_instructions = """
PROFILE: ELDERLY / RELAXED PACE
- Focus on accessible locations (flat ground, elevators, minimal stairs)
- Suggest comfortable seating availability
- Keep the pace relaxed and unhurried
- Avoid loud, crowded, or chaotic venues
- Suggest places with good accessibility and restrooms"""
        else:
            profile_instructions = "PROFILE: STANDARD ADULT (General interest)"

        # Define user preference instructions
        pref_instructions = ""
        user_name = "Friend"
        if preferences:
            user_name = preferences.get('name') or "Friend"
            pref_instructions = f"""
USER PREFERENCES:
- Name: {user_name}
- Travel Mode: {preferences.get('travel_mode') or 'any'}
- Food Preference: {preferences.get('food_preference') or 'any'}
- Activity Type: {preferences.get('activity_type') or 'mixed'}
- Pace: {preferences.get('pace') or 'medium'}
- Budget: {preferences.get('budget') or 'medium'}
- Companions: {preferences.get('companions') or 'solo'}
- Additional Notes: {preferences.get('interests') or 'None'}
"""

        # Build the prompt - friendly personal assistant style
        prompt = f"""You are DayMate, a friendly personal assistant who knows {location_name} like the back of your hand! 

{context}

{profile_instructions}
{pref_instructions}

Create a warm, personalized daily plan for {user_name}. Be like a helpful friend who lives in {location_name}.

STYLE:
- Be warm and conversational (use "you", "your", friendly phrases)
- Address the user as "{user_name}" at least once naturally
- Sound excited and helpful, like texting a friend recommendations
- Use emojis sparingly (1-2 max in the whole response)

FORMAT - Use EXACTLY this structure:
* **☀️ Morning:** [Specific activity at a REAL named place]. [Why it's great + weather consideration]

* **🍽️ Midday:** [Lunch recommendation at REAL restaurant name]. [What to try there]

* **🚶 Afternoon:** [Activity at REAL place]. [Tip or detail]

* **🌆 Evening:** [Dinner/activity at REAL venue]. [Personal touch]

* **💡 Local Tip:** [One insider secret about {location_name}]

REQUIREMENTS:
1. Name REAL specific places in {location_name} (actual restaurant names, real landmarks, specific neighborhoods)
2. Consider the {temp}°C {condition} weather - suggest what to wear briefly
3. Keep each point to 1-2 sentences max
4. Sound like a friendly local, not a tour guide
5. If news mentions events/issues, weave them in naturally
6. STRICTLY ADHERE to the PROFILE guidelines above.

Remember: Be specific! Say "grab a flat white at Monmouth Coffee" not "visit a local cafe"."""

        # Gemini API endpoint - using gemini-2.0-flash (free tier)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.8,
                "maxOutputTokens": 800
            }
        }
        
        response = requests.post(url, json=payload, timeout=30)
        
        if response.status_code == 400:
            return {
                "error": True,
                "message": "Invalid request to AI service.",
                "plan": generate_fallback_plan(weather_data, news_data, city, has_weather)
            }
        
        if response.status_code == 403:
            return {
                "error": True,
                "message": "AI API key invalid or quota exceeded.",
                "plan": generate_fallback_plan(weather_data, news_data, city, has_weather)
            }
        
        if response.status_code != 200:
            print(f"Gemini API error: {response.status_code} - {response.text}")
            return {
                "error": True,
                "message": "AI service temporarily unavailable. Using basic recommendations.",
                "plan": generate_fallback_plan(weather_data, news_data, city, has_weather)
            }
        
        result = response.json()
        
        # Extract text from Gemini response
        if "candidates" in result and len(result["candidates"]) > 0:
            candidate = result["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"]:
                return {
                    "error": False,
                    "plan": candidate["content"]["parts"][0]["text"].strip()
                }
        
        return {
            "error": True,
            "message": "Could not parse AI response. Using basic recommendations.",
            "plan": generate_fallback_plan(weather_data, news_data, city, has_weather)
        }
        
    except requests.Timeout:
        return {
            "error": True,
            "message": "AI service timed out. Using basic recommendations.",
            "plan": generate_fallback_plan(weather_data, news_data, city, has_weather)
        }
    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        return {
            "error": True,
            "message": "AI service error. Using basic recommendations.",
            "plan": generate_fallback_plan(weather_data, news_data, city, has_weather)
        }


def generate_fallback_plan(weather_data: dict, news_data: list, city: str = None, has_weather: bool = True) -> str:
    """
    Generate a rule-based plan when AI service is unavailable.
    
    Args:
        weather_data: Dictionary containing weather information
        news_data: List of news article dictionaries
        city: City name for context
        has_weather: Whether we have valid weather data
        
    Returns:
        Rule-based daily plan as a string
    """
    if has_weather and weather_data:
        temp = weather_data.get("temp", 20)
        condition = weather_data.get("condition", "Clear").lower()
        location = weather_data.get("city_name", city or "your area")
    else:
        temp = 20  # Default moderate temperature
        condition = "unknown"
        location = city or "your area"
    
    plan_parts = [f"## Daily Plan for {location}\n"]
    
    if not has_weather:
        plan_parts.append("*Note: Weather data unavailable. Here are flexible recommendations:*\n")
    
    # Morning recommendations
    plan_parts.append("### Morning")
    if not has_weather:
        plan_parts.append("- Check the weather before heading out")
        plan_parts.append("- Keep an umbrella handy just in case")
        plan_parts.append("- Great time for morning exercise or a walk")
    elif "rain" in condition or "storm" in condition or "drizzle" in condition:
        plan_parts.append("- Don't forget your umbrella! Rain is expected today.")
        plan_parts.append("- Consider indoor exercise like yoga or home workout.")
    elif temp > 30:
        plan_parts.append("- Start your day early to avoid peak heat.")
        plan_parts.append("- Stay hydrated - keep water with you.")
    elif temp < 10:
        plan_parts.append("- Bundle up! It's cold outside.")
        plan_parts.append("- A warm breakfast will help start your day right.")
    else:
        plan_parts.append("- Great weather for a morning walk or jog!")
        plan_parts.append("- Enjoy breakfast outdoors if possible.")
    
    # Afternoon recommendations
    plan_parts.append("\n### Afternoon")
    if not has_weather:
        plan_parts.append("- Good time for errands and tasks")
        plan_parts.append("- Plan both indoor and outdoor options")
    elif "rain" in condition or "storm" in condition:
        plan_parts.append("- Good time for indoor activities: reading, movies, or catching up on work.")
        plan_parts.append("- If you must go out, plan trips between rain showers.")
    elif temp > 30:
        plan_parts.append("- Stay indoors during peak sun hours (12-3 PM).")
        plan_parts.append("- Visit air-conditioned places like malls or libraries.")
    elif "clear" in condition or "sun" in condition:
        plan_parts.append("- Perfect weather for outdoor activities!")
        plan_parts.append("- Consider a lunch picnic or outdoor café.")
    else:
        plan_parts.append("- Good time for errands and outdoor tasks.")
        plan_parts.append("- Check local events happening today.")
    
    # Evening recommendations
    plan_parts.append("\n### Evening")
    if not has_weather:
        plan_parts.append("- Perfect time for dinner plans or relaxation")
        plan_parts.append("- Consider both indoor and outdoor dining options")
    elif "rain" in condition:
        plan_parts.append("- Cozy evening indoors - perfect for cooking or movies.")
    elif temp > 25:
        plan_parts.append("- Enjoy the cooler evening air with a walk.")
    else:
        plan_parts.append("- Great time for dinner out or evening activities.")
    
    # Add news-based tip if available
    if news_data and len(news_data) > 0 and news_data[0].get("title"):
        plan_parts.append(f"\n### Stay Informed")
        plan_parts.append(f"- Check local news: {news_data[0].get('title', 'Local updates')}")
    
    return "\n".join(plan_parts)


def generate_followup(weather_data: dict, news_data: list, city: str, previous_plan: str, user_message: str) -> dict:
    """
    Generate a follow-up response based on the previous plan and user's message.
    
    Args:
        weather_data: Dictionary containing weather information
        news_data: List of news article dictionaries
        city: City name
        previous_plan: The previously generated plan
        user_message: The user's follow-up question or request
        
    Returns:
        Dictionary with response and optional error info
    """
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key or api_key == "your_gemini_api_key_here":
        return {
            "error": True,
            "message": "AI API key not configured.",
            "response": "I'm sorry, I can't answer follow-up questions right now because my AI brain isn't fully connected."
        }
    
    try:
        # Build context based on available data
        context_parts = []
        location_name = weather_data.get('city_name', city or 'Unknown') if weather_data else (city or 'Unknown')
        
        if weather_data and not weather_data.get("error"):
            temp = weather_data.get('temp', 15)
            condition = weather_data.get('condition', 'variable')
            context_parts.append(f"WEATHER: {temp}°C, {condition}")
        
        # Prepare news summary (brief)
        if news_data:
            news_headlines = [article.get('title', '') for article in news_data[:3] if article.get("title")]
            if news_headlines:
                context_parts.append(f"NEWS: {'; '.join(news_headlines)}")
        
        context = "\n".join(context_parts)
        
        # Build the prompt
        prompt = f"""You are DayMate, a friendly local expert for {location_name}.

CONTEXT:
{context}

PREVIOUS PLAN GENERATED:
{previous_plan}

USER SAYS:
"{user_message}"

INSTRUCTIONS:
Answer the user's question or request naturally.
- Be helpful, specific, and friendly.
- If suggesting new places, use REAL names.
- Keep it concise (under 150 words).
- Don't repeat the whole plan, just address the specific request.

Response:"""

        # Gemini API endpoint - using gemini-2.0-flash (free tier)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 300
            }
        }
        
        response = requests.post(url, json=payload, timeout=30)
        
        if response.status_code != 200:
            return {
                "error": True,
                "message": "AI service temporarily unavailable.",
                "response": "I'm having trouble thinking of a response right now. Please try again."
            }
        
        result = response.json()
        
        # Extract text from Gemini response
        if "candidates" in result and len(result["candidates"]) > 0:
            candidate = result["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"]:
                return {
                    "error": False,
                    "response": candidate["content"]["parts"][0]["text"].strip()
                }
        
        return {
            "error": True,
            "message": "Could not parse AI response.",
            "response": "I'm not sure how to answer that. Could you rephrase?"
        }
        
    except Exception as e:
        return {
            "error": True,
            "message": str(e),
            "response": "Something went wrong while processing your request."
        }
