<?php

namespace App\Http\Controllers\Place;

use App\Http\Controllers\Controller;
use App\Models\Place;
use App\Models\PlaceMetadata;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PlaceController extends Controller
{
    /**
     * Get all places by city grouped by type
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPlacesByCity(Request $request)
    {
        $request->validate([
            'city' => 'required|string',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $city = $request->input('city');
        $limit = $request->input('limit', 20);

        try {
            // Debug: Check metadata first
            // Debug: Fetch place IDs by type for debugging purposes
            $restaurantIds = PlaceMetadata::getPlaceIdsByCity($city, 'restaurant', $limit);
            $hotelIds = PlaceMetadata::getPlaceIdsByCity($city, 'hotel', $limit);
            $attractionIds = PlaceMetadata::getPlaceIdsByCity($city, 'attraction', $limit);
            
            // Log the place IDs
            Log::info('Place IDs fetched for city: ' . $city, [
                'restaurant_ids' => $restaurantIds->toArray(),
                'restaurant_count' => $restaurantIds->count(),
                'hotel_ids' => $hotelIds->toArray(),
                'hotel_count' => $hotelIds->count(),
                'attraction_ids' => $attractionIds->toArray(),
                'attraction_count' => $attractionIds->count(),
                'limit' => $limit,
            ]);
            
            $places = [
                'restaurants' => Place::getRestaurants($city, $limit),
                'hotels' => Place::getHotels($city, $limit),
                'tourist_attractions' => Place::getTouristAttractions($city, $limit),
            ];

            // Transform data to return only necessary fields
            $formattedPlaces = [
                'restaurants' => $this->formatPlaces($places['restaurants']),
                'hotels' => $this->formatPlaces($places['hotels']),
                'tourist_attractions' => $this->formatPlaces($places['tourist_attractions']),
            ];

            return response()->json([
                'success' => true,
                'city' => $city,
                'debug' => [
                    'metadata_ids' => [
                        'restaurant_count' => $restaurantIds->count(),
                        'hotel_count' => $hotelIds->count(),
                        'attraction_count' => $attractionIds->count(),
                    ],
                    'places_found' => [
                        'restaurants' => count($formattedPlaces['restaurants']),
                        'hotels' => count($formattedPlaces['hotels']),
                        'tourist_attractions' => count($formattedPlaces['tourist_attractions']),
                    ],
                ],
                'data' => $formattedPlaces,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching places: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    }

    /**
     * Get places by type
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPlacesByType(Request $request)
    {
        $request->validate([
            'city' => 'required|string',
            'type' => 'required|in:restaurant,hotel,attraction',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $city = $request->input('city');
        $type = $request->input('type');
        $limit = $request->input('limit', 20);

        try {
            // Map type to search_type in place_metadata
            $searchTypeMap = [
                'restaurant' => 'restaurant',
                'hotel' => 'hotel',
                'attraction' => 'attraction',
            ];
            
            $searchType = $searchTypeMap[$type] ?? $type;
            
            // Get place IDs from metadata
            $placeIds = PlaceMetadata::getPlaceIdsByCity($city, $searchType, $limit);
            
            // Get places by IDs
            $places = Place::getByPlaceIds($placeIds->toArray());

            return response()->json([
                'success' => true,
                'city' => $city,
                'type' => $type,
                'search_type' => $searchType,
                'count' => $places->count(),
                'data' => $this->formatPlaces($places),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching places: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get places for tour preferences (optimized for frontend)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPlacesForTourPreferences(Request $request)
    {
        $request->validate([
            'destination' => 'required|string',
            'days' => 'nullable|integer|min:1|max:30',
            'budget' => 'nullable|numeric',
            'passengers' => 'nullable|integer',
        ]);

        $destination = $request->input('destination');
        $days = $request->input('days', 1);
        $budget = $request->input('budget', 1000);
        $passengers = $request->input('passengers', 1);

        try {
            // Calculate how many places to return based on days
            $placesPerDay = 10;
            $limit = min($placesPerDay * $days, 50);

            $places = [
                'restaurants' => Place::getRestaurants($destination, $limit),
                'hotels' => Place::getHotels($destination, ceil($days * 1.5)), // More hotels for flexibility
                'tourist_attractions' => Place::getTouristAttractions($destination, $limit),
            ];

            // Add transport options (can be static or from another collection)
            $transport = $this->getTransportOptions($destination);

            return response()->json([
                'success' => true,
                'destination' => $destination,
                'days' => $days,
                'data' => [
                    'restaurants' => $this->formatPlaces($places['restaurants']),
                    'hotels' => $this->formatPlaces($places['hotels']),
                    'tourist_attractions' => $this->formatPlaces($places['tourist_attractions']),
                    'transport' => $transport,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching tour preferences: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Format places data for frontend
     * 
     * @param \Illuminate\Support\Collection $places
     * @return array
     */
    private function formatPlaces($places)
    {
        return $places->map(function ($place) {
            // Lấy displayName
            $displayName = $place->displayName ?? [];
            $displayText = is_array($displayName) ? ($displayName['text'] ?? '') : '';
            $displayLanguage = is_array($displayName) ? ($displayName['language'] ?? '') : '';
            
            // Ưu tiên displayName.text, nếu rỗng thì dùng 'Unknown'
            $name = !empty($displayText) ? $displayText : 'Unknown';
            
            // Lấy Google Place ID từ field 'id'
            $googlePlaceId = $place->id ?? null;
            
            return [
                'id' => $googlePlaceId,
                'place_id' => $googlePlaceId,
                'name' => $name,
                'displayName' => [
                    'text' => $displayText,
                    'language' => $displayLanguage,
                ],
                'avg_price' => $place->avg_price ?? 0,
                'rating' => $place->rating ?? 0,
            ];
        })->toArray();
    }

    /**
     * Get transport options for a city
     * This can be static or from a separate collection
     * 
     * @param string $city
     * @return array
     */
    private function getTransportOptions($city)
    {
        // You can make this dynamic by fetching from database
        return [
            [
                'id' => 1,
                'name' => 'Metro',
                'type' => 'Public Transit',
                'rating' => 8.9,
                'user_ratings_total' => 1000,
                'price_level' => '$0.50 - $2.00',
                'info' => '06:00-23:00',
            ],
            [
                'id' => 2,
                'name' => 'Bus',
                'type' => 'Public Transit',
                'rating' => 8.7,
                'user_ratings_total' => 850,
                'price_level' => '$0.30 - $1.50',
                'info' => '05:00-22:00',
            ],
            [
                'id' => 3,
                'name' => 'Taxi',
                'type' => 'Private Transport',
                'rating' => 8.5,
                'user_ratings_total' => 500,
                'price_level' => '$2.00 - $10.00',
                'info' => '24/7',
            ],
            [
                'id' => 4,
                'name' => 'Rental Car',
                'type' => 'Private Transport',
                'rating' => 8.3,
                'user_ratings_total' => 300,
                'price_level' => '$30.00 - $100.00/day',
                'info' => '24/7',
            ],
        ];
    }

    /**
     * Test MongoDB connection for places
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function testMongo()
    {
        try {
            $count = Place::count();
            $sample = Place::limit(1)->first();
            
            // Test with a specific place_id from metadata
            $testPlaceId = "ChIJBYCkBQCZ4jARMk27YRVj-vM";
            $byId = Place::where('id', $testPlaceId)->first();
            $byPlaceId = Place::where('place_id', $testPlaceId)->first();
            $byObjectId = Place::where('_id', $testPlaceId)->first();
            
            // Get all field names from sample
            $sampleArray = $sample ? $sample->toArray() : [];
            $fieldNames = array_keys($sampleArray);

            return response()->json([
                'success' => true,
                'message' => 'MongoDB connection successful',
                'total_places' => $count,
                'sample' => $sample,
                'field_names' => $fieldNames,
                'test_queries' => [
                    'test_place_id' => $testPlaceId,
                    'found_by_id' => $byId ? true : false,
                    'found_by_place_id' => $byPlaceId ? true : false,
                    'found_by_object_id' => $byObjectId ? true : false,
                    'result_id' => $byId->id ?? null,
                    'result_place_id' => $byPlaceId->place_id ?? null,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'MongoDB connection failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Debug place metadata
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function debugMetadata(Request $request)
    {
        $city = $request->input('city', 'Bangkok');
        
        try {
            // Check place_metadata collection
            $metadataCount = PlaceMetadata::count();
            $metadataSample = PlaceMetadata::limit(3)->get();
            
            // Check for specific city
            $cityMetadata = PlaceMetadata::where('city', $city)->get();
            $cityMetadataGrouped = $cityMetadata->groupBy('search_type');
            
            // Check places collection
            $placesCount = Place::count();
            $placesSample = Place::limit(1)->first();
            
            // Try to get places for Bangkok
            $restaurantIds = PlaceMetadata::getPlaceIdsByCity($city, 'restaurant', 5);
            
            // Test different field names
            $testId = $restaurantIds->first();
            $placeById = Place::where('id', $testId)->first();
            $placeByPlaceId = Place::where('place_id', $testId)->first();
            
            $restaurants = Place::getByPlaceIds($restaurantIds->toArray());
            
            return response()->json([
                'success' => true,
                'debug_info' => [
                    'place_metadata' => [
                        'total_count' => $metadataCount,
                        'sample' => $metadataSample,
                        'city_specific' => [
                            'city' => $city,
                            'total' => $cityMetadata->count(),
                            'by_type' => [
                                'restaurant' => $cityMetadataGrouped->get('restaurant', collect())->count(),
                                'hotel' => $cityMetadataGrouped->get('hotel', collect())->count(),
                                'attraction' => $cityMetadataGrouped->get('attraction', collect())->count(),
                            ],
                            'sample_ids' => $restaurantIds->take(5),
                        ],
                    ],
                    'places' => [
                        'total_count' => $placesCount,
                        'sample' => $placesSample,
                        'test_query' => [
                            'test_id' => $testId,
                            'found_by_id' => $placeById ? true : false,
                            'found_by_place_id' => $placeByPlaceId ? true : false,
                            'place_by_id' => $placeById,
                            'place_by_place_id' => $placeByPlaceId,
                        ],
                        'restaurants_found' => $restaurants->count(),
                        'restaurants_sample' => $restaurants->first(),
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Debug failed: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    }
}

