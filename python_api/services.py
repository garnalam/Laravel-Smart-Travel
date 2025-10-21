"""
Business logic and AI services for travel recommendations
"""
import json
import math
import pandas as pd
from datetime import datetime
from typing import Dict, Any, Optional
import google.generativeai as genai

from config import settings
from models import UserTourInfo

# Configure Gemini AI
genai.configure(api_key=settings.GEMINI_API_KEY)
gemini_model = genai.GenerativeModel(settings.GEMINI_MODEL)


def create_user_tour_info_simple(user_id, start_city_id, destination_city_id, 
                                guest_count=1, duration_days=3, target_budget=1000.0,
                                hotel_ids=None, activity_ids=None, restaurant_ids=None, transport_ids=None):
    """
    Tạo UserTourInfo từ các tham số đơn giản để dễ sử dụng với Gemini
    """
    return UserTourInfo({
        'user_id': user_id,
        'start_city_id': start_city_id,
        'destination_city_id': destination_city_id,
        'guest_count': guest_count,
        'duration_days': duration_days,
        'target_budget': target_budget,
        'hotel_ids': hotel_ids or [],
        'activity_ids': activity_ids or [],
        'restaurant_ids': restaurant_ids or [],
        'transport_ids': transport_ids or []
    })


def get_gemini_travel_recommendations(user_input: UserTourInfo, destination_name: str = "Unknown", 
                                     user_prefs: dict = None, places_data: dict = None):
    """
    Sử dụng Gemini AI để tạo lịch trình du lịch
    
    Args:
        user_input: Thông tin tour của người dùng
        destination_name: Tên thành phố đích
        user_prefs: User preferences (liked/disliked)
        places_data: Dict chứa activities, restaurants, hotels (REQUIRED)
    """
    try:
        # Sử dụng dữ liệu được truyền vào (không query database)
        if not places_data or not all(k in places_data for k in ['activities', 'restaurants', 'hotels']):
            return {
                "error": "Missing required places_data. Please provide activities, restaurants, and hotels."
            }
        activities = places_data['activities']
        restaurants = places_data['restaurants']
        hotels = places_data['hotels']
        
        # Print places info
        data_source = "PROVIDED DATA" if places_data else "DATABASE"

        # Convert price to float if it's a string
        def normalize_price(place):
            if isinstance(place, dict) and 'avg_price' in place:
                price_val = place.get('avg_price', '0')
                if isinstance(price_val, str):
                    # Remove $ and any non-numeric characters except . and -
                    price_str = price_val.replace('$', '').replace(',', '').strip()
                    try:
                        place['avg_price'] = float(price_str) if price_str and price_str != '-' else 0.0
                    except ValueError:
                        place['avg_price'] = 0.0
                elif price_val is None:
                    place['avg_price'] = 0.0
            return place
        
        # Normalize prices in all places
        activities = [normalize_price(a) for a in activities]
        restaurants = [normalize_price(r) for r in restaurants]
        hotels = [normalize_price(h) for h in hotels]
        
        # Chuyển đổi dữ liệu thành DataFrame
        activities_df = pd.DataFrame(activities) if activities else pd.DataFrame()
        restaurants_df = pd.DataFrame(restaurants) if restaurants else pd.DataFrame()
        hotels_df = pd.DataFrame(hotels) if hotels else pd.DataFrame()
        
        # Tạo travel_data tổng hợp
        travel_data = {
            "activities": activities_df.to_dict('records') if not activities_df.empty else [],
            "restaurants": restaurants_df.to_dict('records') if not restaurants_df.empty else [],
            "hotels": hotels_df.to_dict('records') if not hotels_df.empty else []
        }

        # Xử lý user preferences
        if user_prefs is None:
            user_prefs = {}
        
        # Chuẩn bị thông số
        duration = int(float(user_input.duration_days)) if user_input.duration_days else 3
        budget = float(user_input.target_budget) if user_input.target_budget else 1000.0
        guests = int(float(user_input.guest_count)) if user_input.guest_count else 1
        
        # Tạo prompt chi tiết cho Gemini với tất cả available data và preferences
        prompt = f"""
        You are an expert AI travel planner. Create a detailed, personalized {duration}-day itinerary for {destination_name}.

        AVAILABLE DATA (Use ONLY these places - all data provided):
        
        Activities ({len(travel_data['activities'])} available):
        {json.dumps(travel_data['activities'], ensure_ascii=False, indent=2)}
        
        Restaurants ({len(travel_data['restaurants'])} available):
        {json.dumps(travel_data['restaurants'], ensure_ascii=False, indent=2)}
        
        Hotels ({len(travel_data['hotels'])} available):
        {json.dumps(travel_data['hotels'], ensure_ascii=False, indent=2)}
        
        DATA STRUCTURE NOTES:
        - Each place may have: id, place_id, name, category, rating, reviews, price, info/description
        - Use 'id' or 'place_id' as the place identifier in your output
        - 'price' is already normalized to float (USD)
        - 'info' contains additional information about the place

        USER PREFERENCES:
        ✅ LIKED (prioritize these):
        - Activities: {json.dumps(user_prefs.get("liked_activities", []), ensure_ascii=False)}
        - Restaurants: {json.dumps(user_prefs.get("liked_restaurants", []), ensure_ascii=False)}
        - Hotels: {json.dumps(user_prefs.get("liked_hotels", []), ensure_ascii=False)}
        - Transport Modes: {json.dumps(user_prefs.get("liked_transport_modes", []), ensure_ascii=False)}
        
        ❌ DISLIKED (avoid these completely):
        - Activities: {json.dumps(user_prefs.get("disliked_activities", []), ensure_ascii=False)}
        - Restaurants: {json.dumps(user_prefs.get("disliked_restaurants", []), ensure_ascii=False)}
        - Hotels: {json.dumps(user_prefs.get("disliked_hotels", []), ensure_ascii=False)}
        - Transport Modes: {json.dumps(user_prefs.get("disliked_transport_modes", []), ensure_ascii=False)}

        BUDGET BREAKDOWN:
        💰 Total Budget: ${budget} USD for {guests} guests for {duration} days
        💰 Daily Budget: ${budget/duration:.2f} USD per day
        💰 Per Person Budget: ${budget/guests:.2f} USD per person for entire trip
        💰 Daily Per Person: ${budget/(duration*guests):.2f} USD per person per day

        PLANNING RULES & CONSTRAINTS:
        
        1) BUDGET CONSTRAINTS:
        - TOTAL budget is ${budget} USD for {guests} guests for {duration} days
        - Stay WITHIN budget - do not exceed ${budget/duration:.2f} USD per day
        - Consider cost per person: ${budget/guests:.2f} USD per person total
        - Hotels: Calculate cost as (price_per_night × nights × rooms_needed)
        - Activities/Restaurants: Calculate as (price × guests)
        - Transport: Calculate based on actual distance and mode
        
        2) GROUP SIZE CONSIDERATIONS:
        - Planning for {guests} people total
        - Hotel rooms needed: {max(1, (guests + 1) // 2)} rooms (assuming 2 people per room max)
        - Restaurant reservations: for {guests} people
        - Activity bookings: for {guests} people
        
        3) DURATION PLANNING:
        - Trip length: {duration} days
        - Plan activities for each day from day 1 to day {duration}
        - Each day should have 6-10 activities including meals, transfers, and rest
        - Balance busy and relaxed periods
        
        4) USER PREFERENCES PRIORITY:
        - MUST prioritize liked items: activities{user_prefs.get("liked_activities", [])}, restaurants{user_prefs.get("liked_restaurants", [])}, hotels{user_prefs.get("liked_hotels", [])}, transport{user_prefs.get("liked_transport_modes", [])}
        - MUST avoid disliked items: activities{user_prefs.get("disliked_activities", [])}, restaurants{user_prefs.get("disliked_restaurants", [])}, hotels{user_prefs.get("disliked_hotels", [])}, transport{user_prefs.get("disliked_transport_modes", [])}
        
        5) MEALS & REST:
        - Breakfast 07:00–08:30, Lunch 12:00–13:00, Dinner 18:30–19:30
        - At least one 15–30 min rest period per day
        - Respect restaurant opening hours if available
        
        6) LOCATION CONTEXT:
        - Destination: {destination_name} (City ID: {user_input.destination_city_id})
        - Use activities, restaurants, and hotels from the provided data
        - Consider local culture, weather, and typical tourist patterns
        
        7) TRANSPORT & MOVEMENT:
        - Transport mode selection rules (PRIORITY ORDER):
            1) FIRST: Check user preferences - ALWAYS use liked_transport_modes when possible
            2) NEVER use any transport modes in disliked_transport_modes  
            3) Default fallback: "Taxi" if no preferences specified
        - If user has liked_transport_modes{user_prefs.get("liked_transport", [])}, use ONLY those modes for all transfers
        - If user has disliked_transport_modes{user_prefs.get("disliked_transport", [])}, NEVER use those modes under any circumstances
        - Insert explicit "transfer" items between consecutive non-transfer activities
        - For transfer items: set distance_km and travel_time_min to null (or reasonable estimates if you want)
        - Estimate reasonable time duration for transfer activities (10-30 minutes typically)
        - Use simple transport modes: "taxi", "bus", "walk", "bike", "metro", etc.
        - Set transfer cost to 0 or a small estimated amount (will be adjusted if needed)

        8) COST CALCULATION RULES:
        - Activities/Restaurants: price_per_person × guests, or use price_total if available
        - Hotels: price_per_night × rooms_needed × nights (rooms_needed = ceil(guests / 2))
        - Transport: Will be calculated in post-processing based on real distance
        - Stay within the total budget of ${budget} USD for all {guests} guests
        - Track cumulative costs to avoid budget overrun

        9) SELECTION PRIORITY RULES:
        - HARD RULES: Completely exclude all disliked items (activities, restaurants, hotels, transport modes)
        - PREFERENCE RULES: Prioritize liked items when feasible within budget
        - FALLBACK RULES: If no preferences, select by: highest rating → lowest cost → best location
        - QUALITY CONTROL: Ensure variety in activities, avoid repeating same restaurants/activities
        - Min rating threshold: 3.5 (relax to 3.0 if limited options)
        - No duplicate places within the same day
        - If impossible to meet budget, still output plan with "within_budget": false and "reason"

        10) OUTPUT REQUIREMENTS:
        - Activities sorted by start_time for each day
        - Insert transfer between consecutive non-transfer items  
        - Each day should be realistic and achievable
        - Provide clear time allocations for all activities
        - Times in HH:MM (24h format)
        - No time overlaps between activities
        - Ensure logical flow and realistic timing
        - For place_id: use the 'id' or 'place_id' field from the provided places data

        Return ONLY valid JSON in this EXACT format:
        {{
            "destination": "{destination_name}",
            "guests": {guests},
            "duration_days": {duration},
            "within_budget": true,
            "total_cost": 0,
            "cost_breakdown": {{"hotels": 0, "activities": 0, "meals": 0, "transport_estimate": 0}},
            "days": [
                {{
                    "day": 1,
                    "activities": [
                        {{
                            "start_time": "09:00",
                            "end_time": "10:30",
                            "type": "activity",
                            "place_id": "activity_123",
                            "place_name": "Example Activity Name",
                            "description": "Activity description or info",
                            "transport_mode": null,
                            "distance_km": null,
                            "travel_time_min": null,
                            "cost": 15.00
                        }},
                        {{
                            "start_time": "10:30",
                            "end_time": "10:50",
                            "type": "transfer",
                            "place_id": null,
                            "place_name": "Transfer by Taxi",
                            "description": "Moving to next location",
                            "transport_mode": "taxi",
                            "distance_km": 2.5,
                            "travel_time_min": 20,
                            "cost": 5.00
                        }},
                        {{
                            "start_time": "12:00",
                            "end_time": "13:00",
                            "type": "meal",
                            "place_id": "restaurant_456",
                            "place_name": "Example Restaurant",
                            "description": "Lunch at local restaurant",
                            "transport_mode": null,
                            "distance_km": null,
                            "travel_time_min": null,
                            "cost": 25.00
                        }}
                    ]
                }}
            ]
        }}
        
        IMPORTANT: Use ONLY the places provided in the AVAILABLE DATA above. Do not invent new places.
        """
        
        # Gọi Gemini API
        response = gemini_model.generate_content(prompt)
        result_text = response.text.strip()
        # Parse JSON response
        try:
            # Loại bỏ markdown formatting
            if result_text.startswith('```json'):
                result_text = result_text[7:]
            if result_text.endswith('```'):
                result_text = result_text[:-3]
            
            itinerary_data = json.loads(result_text.strip())
            
            # Post-process transport preferences
            liked_modes = [m.lower() for m in user_prefs.get('liked_transport', [])]
            disliked_modes = [m.lower() for m in user_prefs.get('disliked_transport', [])]
            
            for day in itinerary_data.get('days', []):
                for activity in day.get('activities', []):
                    if activity.get('type') == 'transfer':
                        current_mode = activity.get('transport_mode', 'taxi').lower()
                        
                        if liked_modes:
                            import random
                            activity['transport_mode'] = random.choice(liked_modes)
                        elif current_mode in disliked_modes:
                            activity['transport_mode'] = 'taxi'
                        elif not current_mode:
                            activity['transport_mode'] = 'taxi'
            
            # No database processing - using provided data directly
            print("\n✨ Using simple tour from provided data (no distance/time calculation)")
            
            # Convert to API format
            schedule = []
            for day_data in itinerary_data.get('days', []):
                schedule.append({
                    "day": day_data.get('day', 1),
                    "activities": day_data.get('activities', [])
                })
            
            return {
                "tour_id": f"gemini_{user_input.user_id}_{destination_name}_{duration}days",
                "user_id": user_input.user_id,
                "start_city": destination_name,
                "destination_city": destination_name,
                "duration_days": duration,
                "guest_count": guests,
                "budget": budget,
                "total_estimated_cost": itinerary_data.get('total_cost', 0.0),
                "schedule": schedule,
                "generated_by": "gemini_ai",
                "within_budget": itinerary_data.get('within_budget', True)
            }
            
        except json.JSONDecodeError as e:
            print(f"Error parsing Gemini response: {e}")
            return create_fallback_tour(user_input, destination_name, duration, guests, budget)
    
    except Exception as e:
        print(f"Error in get_gemini_travel_recommendations: {e}")
        return create_fallback_tour(user_input, destination_name, duration, guests, budget)


def create_fallback_tour(user_input, destination_name, duration, guests, budget):
    """Create a simple fallback tour when Gemini fails"""
    schedule = []
    for day_num in range(1, duration + 1):
        schedule.append({
            "day": day_num,
            "activities": [
                {
                    "start_time": "09:00",
                    "end_time": "09:30",
                    "type": "transfer",
                    "place_id": None,
                    "place_name": "Di chuyển bằng taxi",
                    "description": "Di chuyển đến địa điểm đầu tiên",
                    "transport_mode": "taxi",
                    "distance_km": 5.0,
                    "travel_time_min": 30,
                    "cost": 6.0
                }
            ]
        })
    
    return {
        "tour_id": f"fallback_{user_input.user_id}_{destination_name}",
        "user_id": user_input.user_id,
        "start_city": destination_name,
        "destination_city": destination_name,
        "duration_days": duration,
        "guest_count": guests,
        "budget": budget,
        "total_estimated_cost": 0.0,
        "schedule": schedule,
        "generated_by": "fallback",
        "error": "Gemini AI unavailable"
    }


def build_final_tour_json(user_input: UserTourInfo, user_prefs: dict = None, 
                          destination_name: str = None, places_data: dict = None):
    """
    Tạo lịch trình du lịch hoàn chỉnh sử dụng Gemini AI (no database required)
    
    Args:
        user_input: Thông tin tour của người dùng
        user_prefs: User preferences
        destination_name: Tên thành phố đích (REQUIRED)
        places_data: Dict chứa activities, restaurants, hotels (REQUIRED)
    """
    try:
        if not destination_name:
            return {"error": "destination_name is required"}
        
        if not places_data:
            return {"error": "places_data is required"}
        
        # Sử dụng Gemini để tạo lịch trình với places_data
        result = get_gemini_travel_recommendations(
            user_input, 
            destination_name, 
            user_prefs, 
            places_data
        )
        
        return result
        
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}

