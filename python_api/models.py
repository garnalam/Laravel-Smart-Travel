"""
Data models and schemas for the Travel API
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any, Union
from datetime import datetime

class UserTourInfo:
    """Class chứa thông tin tour của người dùng"""
    def __init__(self, user_tour_option: dict):
        self.user_id = user_tour_option['user_id']
        self.start_city_id = user_tour_option['start_city_id']
        self.destination_city_id = user_tour_option['destination_city_id']
        self.hotel_ids = user_tour_option.get('hotel_ids', [])
        self.activity_ids = user_tour_option.get('activity_ids', [])
        self.restaurant_ids = user_tour_option.get('restaurant_ids', [])
        self.transport_ids = user_tour_option.get('transport_ids', [])
        self.guest_count = user_tour_option.get('guest_count', 1)
        self.duration_days = user_tour_option.get('duration_days', 3)
        self.target_budget = user_tour_option.get('target_budget', 1000.0)


class PlaceName(BaseModel):
    """Place name with language information"""
    model_config = ConfigDict(populate_by_name=True)
    
    text: str = Field(..., description="Place name text")
    language_code: Optional[str] = Field(default="en", description="Language code", alias="languageCode")


class PlaceData(BaseModel):
    """Place data model - matches frontend data structure"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = Field(default=None, description="Place ID (can be string or number)")
    place_id: Optional[str] = Field(default=None, description="Alternative place ID")
    name: Union[str, PlaceName, Dict] = Field(..., description="Place name (string, object with text/languageCode, or dict)")
    category: Optional[str] = Field(default="", description="Place category")
    rating: Optional[float] = Field(default=0, description="Rating")
    reviews: Optional[int] = Field(default=0, description="Number of reviews")
    latitude: Optional[float] = Field(default=None, description="Latitude")
    longitude: Optional[float] = Field(default=None, description="Longitude")
    avg_price: Optional[float] = Field(default=0, description="Average price")

class TravelPreferencesRequest(BaseModel):
    """Request model for travel recommendations"""
    model_config = ConfigDict(populate_by_name=True)
    
    # Support both old names and new names for destination
    city_name: Optional[str] = Field(default=None, description="City name to search", alias="destination_city_name")
    destination_city_id: Optional[str] = Field(default=None, description="Destination city ID (for backward compatibility)")
    
    guest_count: int = Field(default=1, ge=1, le=20)
    duration_days: int = Field(default=3, ge=1, le=30)
    target_budget: float = Field(default=1000.0, ge=0)
    user_id: Optional[str] = None
    current_day: int = Field(default=1, ge=1, le=30)
    
    # Place data - pass directly instead of querying database
    activities: Optional[List[PlaceData]] = Field(default=[], description="Available activities")
    restaurants: Optional[List[PlaceData]] = Field(default=[], description="Available restaurants")
    hotels: Optional[List[PlaceData]] = Field(default=[], description="Available hotels")
    transport: Optional[List[str]] = Field(default=[], description="Available transport modes")
    
    # User preferences - added to support full preferences
    liked_activities: Optional[List[PlaceData]] = Field(default=[], description="Liked activity IDs")
    disliked_activities: Optional[List[PlaceData]] = Field(default=[], description="Disliked activity IDs")
    liked_restaurants: Optional[List[PlaceData]] = Field(default=[], description="Liked restaurant IDs")
    disliked_restaurants: Optional[List[PlaceData]] = Field(default=[], description="Disliked restaurant IDs")
    liked_hotels: Optional[List[PlaceData]] = Field(default=[], description="Liked hotel IDs")
    disliked_hotels: Optional[List[PlaceData]] = Field(default=[], description="Disliked hotel IDs")
    liked_transport: Optional[List[str]] = Field(default=[], description="Liked transport modes")
    disliked_transport: Optional[List[str]] = Field(default=[], description="Disliked transport modes")


class Activity(BaseModel):
    """Activity in itinerary"""
    start_time: str
    end_time: str
    type: str  # activity, meal, hotel, transfer
    place_id: Optional[str] = None
    place_name: str
    description: str
    transport_mode: Optional[str] = None
    distance_km: Optional[float] = None
    travel_time_min: Optional[int] = None
    cost: float


class DaySchedule(BaseModel):
    """Daily schedule"""
    day: int
    activities: List[Activity]


class TourInfo(BaseModel):
    """Tour information"""
    tour_id: str
    user_id: str
    start_city: str
    destination_city: str
    duration_days: int
    guest_count: int
    budget: float
    total_estimated_cost: float
    generated_by: str
    created_at: str


class ItinerarySummary(BaseModel):
    """Summary of itinerary"""
    total_days: int
    total_activities: int
    cost_per_person: float
    budget_utilized: float


class TravelRecommendationResponse(BaseModel):
    """Response model for travel recommendations"""
    success: bool
    error: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    timestamp: str
    database: Dict[str, Any]
    gemini_ai: Dict[str, bool]


class CitySearchRequest(BaseModel):
    """Request for city search by name"""
    city_name: str = Field(..., description="City name to search")
    guest_count: int = Field(default=1, ge=1, le=20)
    duration_days: int = Field(default=3, ge=1, le=30)
    target_budget: float = Field(default=1000.0, ge=0)
    user_id: Optional[str] = None
    
    # User preferences - added to support full preferences
    liked_activities: Optional[List[PlaceData]] = Field(default=[], description="Liked activity IDs")
    disliked_activities: Optional[List[PlaceData]] = Field(default=[], description="Disliked activity IDs")
    liked_restaurants: Optional[List[PlaceData]] = Field(default=[], description="Liked restaurant IDs")
    disliked_restaurants: Optional[List[PlaceData]] = Field(default=[], description="Disliked restaurant IDs")
    liked_hotels: Optional[List[PlaceData]] = Field(default=[], description="Liked hotel IDs")
    disliked_hotels: Optional[List[PlaceData]] = Field(default=[], description="Disliked hotel IDs")
    liked_transport: Optional[List[str]] = Field(default=[], description="Liked transport modes")
    disliked_transport: Optional[List[str]] = Field(default=[], description="Disliked transport modes")

