
import os
import sys
from app.services.ai_agent import generate_day_plan
from app.models import PlanRequest, UserPreferences

# Mock environment
os.environ["GEMINI_API_KEY"] = "test_key"

def test_plan_generation():
    print("Testing plan generation...")
    
    # Case 1: No preferences
    print("Case 1: No preferences")
    try:
        req = PlanRequest(city="London", profile="standard", preferences=None)
        # Simulate main.py logic
        prefs_dict = req.preferences.dict() if req.preferences else None
        result = generate_day_plan({}, [], "London", req.profile, prefs_dict)
        print("Success Case 1")
    except Exception as e:
        print(f"Error Case 1: {e}")

    # Case 2: With preferences, missing interests
    print("\nCase 2: With preferences, missing interests in input (Pydantic fills default)")
    try:
        # Frontend sends this
        frontend_payload = {
            "travel_mode": "walking",
            "food_preference": "vegan",
            "activity_type": "outdoor",
            "pace": "relaxed"
            # interests missing
        }
        req = PlanRequest(city="London", profile="standard", preferences=frontend_payload)
        prefs_dict = req.preferences.dict() if req.preferences else None
        print(f"Prefs dict: {prefs_dict}")
        result = generate_day_plan({}, [], "London", req.profile, prefs_dict)
        print("Success Case 2")
    except Exception as e:
        print(f"Error Case 2: {e}")

    # Case 3: With preferences, interests is None
    print("\nCase 3: With preferences, interests is None")
    try:
        frontend_payload = {
            "travel_mode": "walking",
            "food_preference": "vegan",
            "activity_type": "outdoor",
            "pace": "relaxed",
            "interests": None
        }
        req = PlanRequest(city="London", profile="standard", preferences=frontend_payload)
        prefs_dict = req.preferences.dict() if req.preferences else None
        result = generate_day_plan({}, [], "London", req.profile, prefs_dict)
        print("Success Case 3")
    except Exception as e:
        print(f"Error Case 3: {e}")

if __name__ == "__main__":
    test_plan_generation()
