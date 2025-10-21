<?php

namespace App\Http\Controllers\Tour;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Place;
use App\Services\PythonApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TourController extends Controller
{
    protected PythonApiService $pythonApi;

    public function __construct(PythonApiService $pythonApi)
    {
        $this->pythonApi = $pythonApi;
    }

    /**
     * Show tour schedule page
     */
    public function showSchedule()
    {
        $scheduleData = session('scheduleData', session('tour_schedule', null));
        $tourData = session('tour_data', null);
        
        return Inertia::render('tour/tour_Schedule', [
            'scheduleData' => $scheduleData,
            'tourData' => $tourData,
        ]);
    }

    /**
     * Generate tour schedule using Python AI API
     */
    public function generateSchedule(Request $request)
    {
        // Increase PHP execution time limit for AI processing
        set_time_limit(300); // 5 minutes
        
        $validated = $request->all();

        // Save tour data to session
        session(['tour_data' => $validated]);
        Log::info('Tour data', $validated);
        try {
            // Query places data by IDs from liked items
            $placesData = $this->queryPlacesData($validated);
            
            $preferences = $this->preparePreferences($validated);
            // Add places data to preferences
            $preferences['activities'] = $placesData['activities'] ?? [];
            $preferences['restaurants'] = $placesData['restaurants'] ?? [];
            $preferences['hotels'] = $placesData['hotels'] ?? [];
            $preferences['transport'] = $validated['transport'] ?? [];
            $preferences['liked_activities'] = $placesData['liked_activities'] ?? [];
            $preferences['liked_restaurants'] = $placesData['liked_restaurants'] ?? [];
            $preferences['liked_hotels'] = $placesData['liked_hotels'] ?? [];
            $preferences['disliked_activities'] = $placesData['disliked_activities'] ?? [];
            $preferences['disliked_restaurants'] = $placesData['disliked_restaurants'] ?? [];
            $preferences['disliked_hotels'] = $placesData['disliked_hotels'] ?? [];
            $preferences['liked_transport'] = $validated['liked_transport'] ?? [];
            $preferences['disliked_transport'] = $validated['disliked_transport'] ?? [];

            Log::info('Sending request to Python API', $preferences);

            // Call Python API to generate recommendations
            $result = $this->pythonApi->getRecommendations($preferences);

            if (!$result['success']) {
                Log::error('Python API returned error', [
                    'error' => $result['error']
                ]);

            return redirect()->route('tour.schedule', ['day' => $validated['currentDay'] ?? 1])->with([
                'error' => 'Failed to generate schedule: ' . ($result['error'] ?? 'Unknown error'),
                'scheduleData' => $this->generateFallbackSchedule($validated),
            ]);
            }

            // Transform Python API response to frontend format
            $scheduleData = $this->transformApiResponse($result['data'], $validated);

            Log::info('Successfully generated schedule', [
                'days' => count($scheduleData),
                'total_cost' => $result['data']['tour_info']['total_estimated_cost'] ?? 0
            ]);

            return redirect()->route('tour.schedule', ['day' => $validated['currentDay'] ?? 1])->with([
                'success' => "Schedule generated successfully with AI!",
                'scheduleData' => $scheduleData,
                'tourInfo' => $result['data']['tour_info'] ?? null,
            ]);

        } catch (\Exception $e) {
            Log::error('Exception in generateSchedule', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('tour.schedule', ['day' => $validated['currentDay'] ?? 1])->with([
                'error' => 'An error occurred while generating schedule. Please try again.',
                'scheduleData' => $this->generateFallbackSchedule($validated),
            ]);
        }
    }

    /**
     * Prepare preferences for Python API
     */
    protected function preparePreferences(array $validated): array
    {
        // Get destination city ID from database
        $destination = $validated['destination'] ?? $validated['city'] ?? 'Bangkok'; // Fallback
        $destinationCityId = $this->getCityId($destination);
        
        // Calculate budget (subtract flight cost if provided)
        $totalBudget = (float)($validated['budget'] ?? 1000);
        $flightCost = (float)($validated['moneyFlight'] ?? 0);
        $availableBudget = max($totalBudget - $flightCost, 100); // Minimum $100

        return [
            'destination_city_id' => $destinationCityId,
            'guest_count' => (int)($validated['passengers'] ?? 1),
            'duration_days' => 1,
            'target_budget' => $availableBudget,
            'user_id' => auth()->id() ? (string)auth()->id() : null,
            'current_day' => (int)($validated['currentDay'] ?? 1), // Add current day info
            'departure_date' => $validated['departureDate'] ?? null, // Add departure date for date calculation
        ];
    }

    /**
     * Query places data by IDs
     */
    protected function queryPlacesData(array $validated): array
    {
        // Collect all place IDs by type
        $activityIds = $validated['activities'] ?? [];
        $restaurantIds = $validated['restaurants'] ?? [];
        $hotelIds = $validated['hotels'] ?? [];
        
        // Query places from MongoDB
        $activities = !empty($activityIds) ? Place::getPlaceByIds($activityIds) : collect([]);
        $restaurants = !empty($restaurantIds) ? Place::getPlaceByIds($restaurantIds) : collect([]);
        $hotels = !empty($hotelIds) ? Place::getPlaceByIds($hotelIds) : collect([]);
        
        $liked_activities_Ids = $validated['liked_activities'] ?? [];
        $liked_restaurants_Ids = $validated['liked_restaurants'] ?? [];
        $liked_hotels_Ids = $validated['liked_hotels'] ?? [];

        $disliked_activities_Ids = $validated['disliked_activities'] ?? [];
        $disliked_restaurants_Ids = $validated['disliked_restaurants'] ?? [];
        $disliked_hotels_Ids = $validated['disliked_hotels'] ?? [];

        $liked_activities = !empty($liked_activities_Ids) ? Place::getPlaceByIds($liked_activities_Ids) : collect([]);
        $liked_restaurants = !empty($liked_restaurants_Ids) ? Place::getPlaceByIds($liked_restaurants_Ids) : collect([]);
        $liked_hotels = !empty($liked_hotels_Ids) ? Place::getPlaceByIds($liked_hotels_Ids) : collect([]);

        $disliked_activities = !empty($disliked_activities_Ids) ? Place::getPlaceByIds($disliked_activities_Ids) : collect([]);
        $disliked_restaurants = !empty($disliked_restaurants_Ids) ? Place::getPlaceByIds($disliked_restaurants_Ids) : collect([]);
        $disliked_hotels = !empty($disliked_hotels_Ids) ? Place::getPlaceByIds($disliked_hotels_Ids) : collect([]);

        // Format for Python API
        return [
            'activities' => $activities->map(function ($place) {
                return [
                    'id' => $place->id,
                    'place_id' => $place->id,
                    'name' => $place->displayName ?? $place->name ?? 'Unknown',
                    'category' => $place->types[0] ?? 'attraction',
                    'rating' => $place->rating ?? 0,
                    'reviews' => $place->userRatingCount ?? 0,
                    'latitude' => $place->location['latitude'] ?? null,
                    'longitude' => $place->location['longitude'] ?? null,
                ];
            })->toArray(),
            'restaurants' => $restaurants->map(function ($place) {
                return [
                    'id' => $place->id,
                    'place_id' => $place->id,
                    'name' => $place->displayName ?? $place->name ?? 'Unknown',
                    'category' => $place->types[0] ?? 'restaurant',
                    'rating' => $place->rating ?? 0,
                    'reviews' => $place->userRatingCount ?? 0,
                    'latitude' => $place->location['latitude'] ?? null,
                    'longitude' => $place->location['longitude'] ?? null,
                ];
            })->toArray(),
            'hotels' => $hotels->map(function ($place) {
                return [
                    'id' => $place->id,
                    'place_id' => $place->id,
                    'name' => $place->displayName ?? $place->name ?? 'Unknown',
                    'category' => $place->types[0] ?? 'hotel',
                    'rating' => $place->rating ?? 0,
                    'reviews' => $place->userRatingCount ?? 0,
                    'latitude' => $place->location['latitude'] ?? null,
                    'longitude' => $place->location['longitude'] ?? null,
                ];
            })->toArray(),
            'liked_activities' => $liked_activities->map(function ($place) {
                return [
                    'id' => $place->id,
                    'place_id' => $place->id,
                    'name' => $place->displayName ?? $place->name ?? 'Unknown',
                    'category' => $place->types[0] ?? 'activity',
                    'rating' => $place->rating ?? 0,
                    'reviews' => $place->userRatingCount ?? 0,
                    'latitude' => $place->location['latitude'] ?? null,
                    'longitude' => $place->location['longitude'] ?? null,
                ];
            })->toArray(),
            'liked_restaurants' => $liked_restaurants->map(function ($place) {
                return [
                    'id' => $place->id,
                    'place_id' => $place->id,
                    'name' => $place->displayName ?? $place->name ?? 'Unknown',
                    'category' => $place->types[0] ?? 'restaurant',
                    'rating' => $place->rating ?? 0,
                    'reviews' => $place->userRatingCount ?? 0,
                    'latitude' => $place->location['latitude'] ?? null,
                    'longitude' => $place->location['longitude'] ?? null,
                ];
            })->toArray(),
            'liked_hotels' => $liked_hotels->map(function ($place) {
                return [
                    'id' => $place->id,
                    'place_id' => $place->id,
                    'name' => $place->displayName ?? $place->name ?? 'Unknown',
                    'category' => $place->types[0] ?? 'hotel',
                    'rating' => $place->rating ?? 0,
                    'reviews' => $place->userRatingCount ?? 0,
                    'latitude' => $place->location['latitude'] ?? null,
                    'longitude' => $place->location['longitude'] ?? null,
                ];
            })->toArray(),
            'disliked_activities' => $disliked_activities->map(function ($place) {
                return [
                    'id' => $place->id,
                    'place_id' => $place->id,
                    'name' => $place->displayName ?? $place->name ?? 'Unknown',
                    'category' => $place->types[0] ?? 'activity',
                    'rating' => $place->rating ?? 0,
                    'reviews' => $place->userRatingCount ?? 0,
                    'latitude' => $place->location['latitude'] ?? null,
                    'longitude' => $place->location['longitude'] ?? null,
                ];
            })->toArray(),
            'disliked_restaurants' => $disliked_restaurants->map(function ($place) {
                return [
                    'id' => $place->id,
                    'place_id' => $place->id,
                    'name' => $place->displayName ?? $place->name ?? 'Unknown',
                    'category' => $place->types[0] ?? 'restaurant',
                    'rating' => $place->rating ?? 0,
                    'reviews' => $place->userRatingCount ?? 0,
                    'latitude' => $place->location['latitude'] ?? null,
                    'longitude' => $place->location['longitude'] ?? null,
                ];
            })->toArray(),
            'disliked_hotels' => $disliked_hotels->map(function ($place) {
                return [
                    'id' => $place->id,
                    'place_id' => $place->id,
                    'name' => $place->displayName ?? $place->name ?? 'Unknown',
                    'category' => $place->types[0] ?? 'hotel',
                    'rating' => $place->rating ?? 0,
                    'reviews' => $place->userRatingCount ?? 0,
                    'latitude' => $place->location['latitude'] ?? null,
                    'longitude' => $place->location['longitude'] ?? null,
                ];
            })->toArray(),
        ];
    }

    /**
     * Get city ID from city name
     */
    protected function getCityId(string $cityName): string
    {
        try {
            // Search for exact match first
            $city = City::where('city', $cityName)->first();
            
            if (!$city) {
                // Try case-insensitive search
                $city = City::where('city', 'like', $cityName)->first();
            }
            
            if (!$city) {
                // Try searching in city_ascii
                $city = City::where('city_ascii', 'like', $cityName)->first();
            }
            
            if ($city && isset($city->_id)) {
                Log::info("Found city ID for {$cityName}", ['city_id' => (string)$city->_id]);
                return (string)$city->_id;
            }
            
            Log::warning("City not found in database, using city name as fallback", ['city_name' => $cityName]);
            return $cityName;
            
        } catch (\Exception $e) {
            Log::error("Error getting city ID", [
                'city_name' => $cityName,
                'error' => $e->getMessage()
            ]);
            return $cityName;
        }
    }

    /**
     * Transform Python API response to schedule format with correct dates
     */
    private function transformApiResponse($data, $validated)
    {
        $scheduleData = [];
        
        // Get departure date from validated data
        $departureDate = isset($validated['departureDate']) ? new \DateTime($validated['departureDate']) : now();
        
        // Get current day being generated (1-based)
        $currentDay = (int)($validated['currentDay'] ?? 1);
        
        // Get number of days from data
        $days = count($data['itinerary'] ?? []);

        foreach (($data['itinerary'] ?? []) as $dayIndex => $dayData) {
            $scheduleItems = [];
            $dailyCost = 0;
            
            // Convert 0-based index to 1-based day number
            $dayNumber = $dayIndex + 1;

            foreach (($dayData['activities'] ?? []) as $activity) {
                // Calculate cost - try both 'cost' and 'estimated_cost' fields
                $cost = $activity['cost'] ?? $activity['estimated_cost'] ?? 0;
                
                // Log activity data for debugging
                Log::debug("Activity data", [
                    'place_name' => $activity['place_name'] ?? 'Unknown',
                    'cost_field' => $activity['cost'] ?? null,
                    'estimated_cost_field' => $activity['estimated_cost'] ?? null,
                    'final_cost' => $cost
                ]);
                
                $dailyCost += $cost;

                $item = [
                    'id' => count($scheduleItems) + 1,
                    'type' => $activity['type'] ?? 'activity',
                    'startTime' => $activity['start_time'] ?? '09:00',
                    'endTime' => $activity['end_time'] ?? '10:00',
                    'title' => $activity['place_name'] ?? 'Activity',
                    'description' => $activity['description'] ?? '',
                    'cost' => $cost,
                ];

                // Add transport-specific fields
                if ($activity['type'] === 'transfer') {
                    $item['transport_mode'] = $activity['transport_mode'] ?? 'taxi';
                    $item['distance'] = isset($activity['distance_km']) 
                        ? round($activity['distance_km'], 1) . 'km' 
                        : null;
                    $item['travel_time'] = isset($activity['travel_time_min'])
                        ? $activity['travel_time_min'] . ' min'
                        : null;
                }

                // Add place_id if available
                if (isset($activity['place_id'])) {
                    $item['place_id'] = $activity['place_id'];
                }

                $scheduleItems[] = $item;
            }

            // Calculate date based on departure date + day offset (0-based)
            $dayDate = clone $departureDate;
            $dayDate->modify('+' . $dayIndex . ' days');
            
            $scheduleData[] = [
                'day' => $dayNumber,
                'date' => $dayDate->format('l, F j, Y'),
                'completed' => true,
                'items' => $scheduleItems,
                'totalCost' => $dailyCost,
            ];
        }

        // If Python API returns full itinerary, filter to only return the requested day
        // This helps frontend properly display the correct day's schedule
        if ($currentDay > 0 && count($scheduleData) > 1) {
            $filteredSchedule = array_filter($scheduleData, function($schedule) use ($currentDay) {
                return $schedule['day'] === $currentDay;
            });
            
            if (!empty($filteredSchedule)) {
                Log::info("Filtered schedule to day {$currentDay}", [
                    'original_days' => count($scheduleData),
                    'filtered_days' => count($filteredSchedule)
                ]);
                return array_values($filteredSchedule); // Re-index array
            }
        }

        return $scheduleData;
    }

    /**
     * Generate fallback schedule when API fails
     */
    private function generateFallbackSchedule(array $validated): array
    {
        $scheduleData = [];
        $currentDay = $validated['currentDay'] ?? 1;
        $likedItems = $validated['liked_restaurants'] ?? [];
        
        // Get departure date from validated data
        $departureDate = isset($validated['departureDate']) ? new \DateTime($validated['departureDate']) : now();
        
        $scheduleItems = [];
        $totalCost = 0;
        $currentTime = 7;
        
        // Add breakfast
        $scheduleItems[] = [
            'id' => 1,
            'type' => 'meal',
            'startTime' => '07:00',
            'endTime' => '08:30',
            'title' => 'Breakfast',
            'cost' => 15.00,
        ];
        $totalCost += 15.00;
        
        // Add transfer
        $scheduleItems[] = [
            'id' => 2,
            'type' => 'transfer',
            'startTime' => '08:30',
            'endTime' => '09:00',
            'title' => 'Transfer by Taxi',
            'cost' => 8.00,
            'distance' => '5km',
        ];
        $totalCost += 8.00;
        $currentTime = 9;
        
        // Add activities
        $activities = collect($likedItems)->take(3);
        foreach ($activities as $activity) {
            $scheduleItems[] = [
                'id' => count($scheduleItems) + 1,
                'type' => 'transfer',
                'startTime' => sprintf('%02d:00', $currentTime),
                'endTime' => sprintf('%02d:30', $currentTime),
                'title' => 'Transfer by Taxi',
                'cost' => 8.00,
                'distance' => '5km',
            ];
            $totalCost += 8.00;
            $currentTime += 1;
            
            $scheduleItems[] = [
                'id' => count($scheduleItems) + 1,
                'type' => 'activity',
                'startTime' => sprintf('%02d:00', $currentTime),
                'endTime' => sprintf('%02d:00', $currentTime + 2),
                'title' => $activity['name'] ?? 'Visit Attraction',
                'cost' => 10.00,
            ];
            $totalCost += 10.00;
            $currentTime += 3;
        }
        
        // Calculate date for this day
        $dayDate = clone $departureDate;
        $dayDate->modify('+' . ($currentDay - 1) . ' days');
        
        $daySchedule = [
            'day' => $currentDay,
            'date' => $dayDate->format('l, F j, Y'),
            'completed' => true,
            'items' => $scheduleItems,
            'totalCost' => $totalCost,
        ];
        
        return [$daySchedule];
    }

    /**
     * Generate final tour
     */
    public function generateFinal(Request $request)
    {
        $validated = $request->validate([
            'schedules' => 'required|array',
            'destination' => 'nullable|string',
            'departure' => 'nullable|string',
            'days' => 'nullable|integer',
            'budget' => 'nullable|numeric',
            'passengers' => 'nullable|integer',
        ]);

        session(['final_tour' => $validated]);

        return redirect()->route('tour.final')->with('success', 'Tour generated successfully!');
    }

    /**
     * Show final tour
     */
    public function showFinal()
    {
        $finalTour = session('final_tour', null);
        
        if (!$finalTour) {
            return redirect()->route('tour')->with('error', 'No tour data found. Please start a new tour.');
        }

        return Inertia::render('tour/FinalTour', [
            'tourData' => $finalTour,
        ]);
    }
}

