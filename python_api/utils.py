"""
Utility functions for travel calculations
"""
import math
from typing import Tuple, Optional

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Tính khoảng cách Haversine (km)"""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    
    a = (math.sin(dphi/2)**2 + 
         math.cos(phi1) * math.cos(phi2) * math.sin(dlambda/2)**2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c


def calculate_travel_time(distance_km: float, transport_mode: str, is_rush_hour: bool = False) -> int:
    """Tính thời gian di chuyển (phút) dựa trên khoảng cách và phương tiện"""
    # Tốc độ trung bình cho từng phương tiện (km/h)
    speed_map = {
        'walk': 4,
        'bike': 12,
        'bicycle': 12,
        'scooter': 25,
        'motorcycle': 25,
        'motorbike': 25,
        'taxi': 30,
        'grab': 30,
        'uber': 30,
        'bus': 25,
        'metro': 35,
        'subway': 35,
        'train': 40,
        'car': 30,
        'ojek': 25,
        'grabbike': 25,
        'rickshaw': 10,
        'cyclo': 10,
        'tricycle': 15,
        'ferry': 20,
        'boat': 20,
        'ship': 25
    }
    
    base_speed = speed_map.get(transport_mode.lower(), 30)  # Default to taxi speed
    
    # Điều chỉnh tốc độ trong giờ cao điểm
    if is_rush_hour and transport_mode.lower() in ['scooter', 'motorcycle', 'motorbike', 'taxi', 'grab', 'uber', 'car']:
        base_speed *= 0.8  # Giảm 20% tốc độ trong giờ cao điểm
    
    # Tính thời gian cơ bản
    base_time_minutes = (distance_km / base_speed) * 60
    
    # Thêm buffer time
    buffer_time = 10  # Base buffer 10 phút
    if transport_mode.lower() in ['scooter', 'motorcycle', 'taxi', 'grab', 'car', 'bus', 'metro']:
        buffer_time += 5  # Thêm 5 phút cho phương tiện cơ giới
    if distance_km > 20:
        buffer_time += 10  # Thêm 10 phút cho khoảng cách xa
    
    total_time = math.ceil(base_time_minutes + buffer_time)
    
    return max(total_time, 5)  # Minimum 5 phút


def calculate_transport_cost(distance_km: float, transport_mode: str) -> float:
    """Tính chi phí di chuyển dựa trên khoảng cách và phương tiện"""
    cost_map = {
        'walk': 0,      # Free
        'bike': 2,      # Fixed rental cost
        'bicycle': 2,   # Fixed rental cost
        'scooter': 0.5, # Per km
        'motorcycle': 0.5,
        'motorbike': 0.5,
        'taxi': 1.2,    # Per km 
        'grab': 1.0,    # Per km
        'uber': 1.0,
        'bus': 0.3,     # Per km
        'metro': 0.4,   # Per km
        'subway': 0.4,
        'train': 0.5,
        'car': 1.0,     # Per km
        'ojek': 0.4,
        'grabbike': 0.4,
        'rickshaw': 0.6,
        'cyclo': 0.6,
        'tricycle': 0.5,
        'ferry': 2.0,
        'boat': 2.0,
        'ship': 3.0
    }
    
    mode_lower = transport_mode.lower()
    if mode_lower in ['walk', 'bike', 'bicycle']:
        return cost_map.get(mode_lower, 0)  # Fixed cost
    else:
        base_cost = cost_map.get(mode_lower, 1.0) * distance_km
        return round(max(base_cost, 1.0), 1)  # Minimum $1


def get_location_coordinates(cursor, place_type: str, place_id: str) -> Tuple[Optional[float], Optional[float]]:
    """Lấy tọa độ của địa điểm từ database"""
    try:
        if place_type == 'activity':
            cursor.execute("SELECT latitude, longitude FROM activities WHERE activity_id = %s", (place_id,))
        elif place_type == 'restaurant':
            cursor.execute("SELECT latitude, longitude FROM restaurants WHERE restaurant_id = %s", (place_id,))
        elif place_type == 'hotel':
            cursor.execute("SELECT latitude, longitude FROM hotels WHERE hotel_id = %s", (place_id,))
        else:
            return None, None
            
        result = cursor.fetchone()
        if result and result['latitude'] and result['longitude']:
            return float(result['latitude']), float(result['longitude'])
        return None, None
    except Exception as e:
        print(f"Error getting coordinates for {place_type} {place_id}: {e}")
        return None, None


def apply_fallback_distance_and_time(activity: dict, user_prefs: dict = None):
    """Áp dụng khoảng cách và thời gian fallback khi không tìm được tọa độ"""
    transport_mode = activity.get('transport_mode', 'taxi')
    
    # Default distance based on transport mode
    if transport_mode.lower() == 'walk':
        distance = 1.0
    elif transport_mode.lower() in ['bike', 'bicycle']:
        distance = 3.0
    elif transport_mode.lower() in ['scooter', 'motorcycle', 'taxi', 'grab']:
        distance = 5.0
    else:  # bus, metro, etc.
        distance = 8.0
    
    travel_time = calculate_travel_time(distance, transport_mode, False)
    cost = calculate_transport_cost(distance, transport_mode)
    
    activity['distance_km'] = distance
    activity['travel_time_min'] = travel_time
    activity['cost'] = cost


def convert_decimal(obj):
    """Convert Decimal objects to float for JSON serialization"""
    if hasattr(obj, '_asdict'):  # Handle named tuples
        return obj._asdict()
    elif hasattr(obj, '__dict__'):
        return obj.__dict__
    elif isinstance(obj, list):
        return [convert_decimal(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_decimal(value) for key, value in obj.items()}
    else:
        try:
            import decimal
            if isinstance(obj, decimal.Decimal):
                return float(obj)
        except:
            pass
        return obj

