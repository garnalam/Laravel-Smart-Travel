"""
FastAPI application for Smart Travel Recommendation API
"""
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional
from datetime import datetime

from config import settings
from models import (
    TravelPreferencesRequest,
    TravelRecommendationResponse,
    HealthCheckResponse,
    CitySearchRequest,
    PlaceData,
    PlaceName
)
from services import create_user_tour_info_simple, build_final_tour_json


def serialize_place_data(place: PlaceData) -> dict:
    """
    Serialize PlaceData to dictionary, handling name that can be string or PlaceName object
    """
    place_dict = place.model_dump()
    
    # Handle name field - convert PlaceName object to dict if needed
    if isinstance(place_dict.get("name"), dict):
        # Already a dict, convert keys from snake_case to camelCase for API compatibility
        name_obj = place_dict["name"]
        if "language_code" in name_obj:
            name_obj["languageCode"] = name_obj.pop("language_code")
    
    return place_dict


def serialize_user_preferences(user_prefs: dict) -> dict:
    """
    Serialize all PlaceData objects in user preferences to dictionaries
    """
    serialized = {}
    for key, value in user_prefs.items():
        if isinstance(value, list):
            # Serialize list of PlaceData objects
            serialized[key] = [
                serialize_place_data(item) if isinstance(item, PlaceData) else item
                for item in value
            ]
        else:
            serialized[key] = value
    return serialized


# Initialize FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description=settings.API_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Security dependency (API Key authentication)
async def verify_api_key(x_api_key: Optional[str] = Header(None)):
    """Verify API key if configured"""
    if settings.API_KEY and settings.API_KEY != "":
        if not x_api_key or x_api_key != settings.API_KEY:
            raise HTTPException(status_code=401, detail="Invalid or missing API key")
    return True


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Smart Travel Recommendation API",
        "version": settings.API_VERSION,
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint - no database required"""
    gemini_status = {"configured": bool(settings.GEMINI_API_KEY)}
    
    return {
        "status": "healthy" if settings.GEMINI_API_KEY else "unhealthy",
        "version": settings.API_VERSION,
        "timestamp": datetime.now().isoformat(),
        "gemini_ai": gemini_status,
        "message": "API is running. Database not required - all data provided by Laravel."
    }


@app.post("/api/recommendations", response_model=TravelRecommendationResponse, tags=["Recommendations"])
async def get_travel_recommendations(
    request: TravelPreferencesRequest,
    authenticated: bool = Depends(verify_api_key)
):
    """
    Generate AI-powered travel itinerary recommendations
    
    This endpoint uses Gemini AI to create personalized travel itineraries
    based on user preferences, budget, and destination.
    """
    try:
        # Generate user ID if not provided
        if not request.user_id:
            request.user_id = f"web_user_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Determine destination city (support both old and new format)
        destination_city = request.city_name or request.destination_city_id or "Unknown"
        
        # Create user preferences dict
        user_prefs = {
            "liked_activities": request.liked_activities or [],
            "disliked_activities": request.disliked_activities or [],
            "liked_restaurants": request.liked_restaurants or [],
            "disliked_restaurants": request.disliked_restaurants or [],
            "liked_hotels": request.liked_hotels or [],
            "disliked_hotels": request.disliked_hotels or [],
            "liked_transport": request.liked_transport or [],
            "disliked_transport": request.disliked_transport or []
        }
        
        # Print places data info
        print(f"\n📦 PLACES DATA:")
        print(f"   🎯 Activities: {len(request.activities)} provided")
        print(f"   🍽️  Restaurants: {len(request.restaurants)} provided")
        print(f"   🏨 Hotels: {len(request.hotels)} provided")
        print("="*80 + "\n")
        
        # Create user tour info
        user_input = create_user_tour_info_simple(
            user_id=request.user_id,
            start_city_id=destination_city,
            destination_city_id=destination_city,
            guest_count=request.guest_count,
            duration_days=request.duration_days,
            target_budget=request.target_budget
        )
        
        # Prepare places data if provided
        places_data = None
        if request.activities or request.restaurants or request.hotels:
            places_data = {
                'activities': [serialize_place_data(place) for place in request.activities],
                'restaurants': [serialize_place_data(place) for place in request.restaurants],
                'hotels': [serialize_place_data(place) for place in request.hotels]
            }
        # Generate itinerary with provided places data

        result = build_final_tour_json(
            user_input, 
            serialize_user_preferences(user_prefs),
            destination_name=destination_city,
            places_data=places_data
        )
        
        # Check for errors
        if "error" in result:
            return TravelRecommendationResponse(
                success=False,
                error=result["error"],
                data=None
            )
        
        # Format successful response
        response_data = {
            "tour_info": {
                "tour_id": result["tour_id"],
                "user_id": result["user_id"],
                "start_city": result["start_city"],
                "destination_city": result["destination_city"],
                "duration_days": int(result["duration_days"]),
                "guest_count": int(result["guest_count"]),
                "current_day": request.current_day,
                "budget": float(result["budget"]),
                "total_estimated_cost": float(result["total_estimated_cost"]),
                "generated_by": result["generated_by"],
                "created_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            },
            "itinerary": result["schedule"],
            "summary": {
                "total_days": int(result["duration_days"]),
                "total_activities": sum(len(day.get("activities", [])) for day in result["schedule"]),
                "cost_per_person": float(result["total_estimated_cost"]) / int(result["guest_count"]) if int(result["guest_count"]) > 0 else 0,
                "budget_utilized": (float(result["total_estimated_cost"]) / float(result["budget"]) * 100) if float(result["budget"]) > 0 else 0
            }
        }
        return TravelRecommendationResponse(
            success=True,
            error=None,
            data=response_data
        )
        
    except Exception as e:
        print(f"Error in get_travel_recommendations: {e}")
        import traceback
        traceback.print_exc()
        return TravelRecommendationResponse(
            success=False,
            error=f"Internal server error: {str(e)}",
            data=None
        )

# Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": f"Internal server error: {str(exc)}",
            "data": None
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        workers=1 if settings.DEBUG else settings.MAX_WORKERS
    )

