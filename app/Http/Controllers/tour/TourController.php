<?php

namespace App\Http\Controllers\Tour;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Place;
use App\Models\tour_user;
use App\Models\Payment;
use App\Models\User_preferences;
use App\Services\PythonApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

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
        // Get destination city ID - use city_id from frontend if available, otherwise query database
        if (!empty($validated['city_id'])) {
            $destinationCityId = $validated['city_id'];
            Log::info("Using city_id from frontend", ['city_id' => $destinationCityId]);
        } else {
            // Fallback: Get destination city ID from database
            $destination = $validated['destination'] ?? $validated['city'] ?? 'Bangkok'; // Fallback
            $destinationCityId = $this->getCityId($destination);
            Log::info("Queried city_id from database", ['city_id' => $destinationCityId]);
        }
        
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

    public function saveTourData(Request $request)
    {
        $validated = $request->validate([
            'departure' => 'required|string',
            'days' => 'required|integer',
            'passengers' => 'required|integer',
            'days_cost' => 'required|array',
            'total_cost' => 'required|numeric',
            'flight_cost' => 'required|numeric',
            'start_date' => 'required|string',
            'flights' => 'required|array',
            'flights.selectedDepartureFlight' => 'required|array',
            'flights.selectedReturnFlight' => 'required|array',
            'itinerary' => 'required|array',
            'itinerary.*.day' => 'required|integer',
            'itinerary.*.date' => 'required|string',
            'itinerary.*.completed' => 'required|boolean',
            'itinerary.*.totalCost' => 'required|numeric',
            'itinerary.*.activities_id' => 'nullable|array',
            'itinerary.*.restaurants_id' => 'nullable|array',
            'itinerary.*.hotel_id' => 'nullable|array',
            'itinerary.*.transportation_mode' => 'nullable|array',
            'schedules' => 'required|array',
            'schedules.*.day' => 'required|integer',
            'schedules.*.totalCost' => 'required|numeric',
            'schedules.*.items' => 'required|array',
            'schedules.*.items.*.id' => 'required',
            'schedules.*.items.*.place_id' => 'nullable|string',
            'schedules.*.items.*.type' => 'required|string',
            'schedules.*.items.*.startTime' => 'required|string',
            'schedules.*.items.*.endTime' => 'required|string',
            'schedules.*.items.*.title' => 'required|string',
            'schedules.*.items.*.cost' => 'required|numeric',
            'schedules.*.items.*.transport_mode' => 'nullable|string',
        ]);

        // Generate tour ID
        $tourId = (string) \Illuminate\Support\Str::uuid();
        
        // Create tour data using mass assignment
        $tourData = tour_user::create([
            'user_id' => auth()->id(),
            'tour_id' => $tourId,
            'duration_days' => $validated['days'],
            'start_date' => $validated['start_date'],
            'user_preferences' => [
                'departure' => $validated['departure'],
                'days' => $validated['days'],
                'passengers' => $validated['passengers'],
                'days_cost' => $validated['days_cost'],
                'total_cost' => $validated['total_cost'],
                'flight_cost' => $validated['flight_cost']
            ],
            'itinerary' => $validated['itinerary'],
            'flights' => $validated['flights'],
            'schedules' => $validated['schedules'],
        ]);
        
        $saved = $tourData ? true : false;
        
        // Log for debugging
        Log::info('Tour data saved', [
            'saved' => $saved,
            'tour_id' => $tourData->tour_id,
            'user_id' => $tourData->user_id,
            '_id' => $tourData->_id ?? null
        ]);

        // Redirect to payment page with tour data
        return Inertia::render('tour/payment', [
            'tourData' => array_merge($validated, [
                'tour_id' => $tourData->tour_id,
                '_id' => $tourData->_id ?? null
            ]),
            'tour_id' => $tourData->tour_id
        ]);
    }

    public function paymentTour(Request $request)
    {
        $validated = $request->validate([
            'tour_id' => 'required|string',
            'fullName' => 'required|string',
            'email' => 'required|email',
            'phone' => 'required|string',
            'address' => 'required|string',
        ]);

        $paymentData = new Payment();
        $paymentData->user_id = auth()->id();
        $paymentData->tour_id = $validated['tour_id'];
        $paymentData->fullName = $validated['fullName'];
        $paymentData->email = $validated['email'];
        $paymentData->phone = $validated['phone'];
        $paymentData->address = $validated['address'];
        $paymentData->status = 'paid';
        $paymentData->save();

        // Get tour data from database using tour_id
        $tourData = tour_user::where('tour_id', $validated['tour_id'])->first();

        // Redirect to success page with payment and tour data
        return Inertia::render('tour/success', [
            'paymentData' => $paymentData,
            'tourData' => $tourData ? [
                'departure' => $tourData->user_preferences['departure'] ?? null,
                'destination' => $tourData->destination ?? null,
                'days' => $tourData->user_preferences['days'] ?? count($tourData->itinerary ?? []),
                'passengers' => $tourData->user_preferences['passengers'] ?? null,
                'total_cost' => $tourData->user_preferences['total_cost'] ?? 0,
                'flight_cost' => $tourData->user_preferences['flight_cost'] ?? 0,
                'days_cost' => $tourData->user_preferences['days_cost'] ?? [],
                'start_date' => $tourData->start_date ?? null,
            ] : null,
        ]);
    }
    public function downloadItinerary()
    {
        $finalTour = session('final_tour', null);
        
        if (!$finalTour) {
            return redirect()->back()->with('error', 'No tour data found');
        }
    
        $pdf = Pdf::loadView('pdf.tour-itinerary', [
            'tourData' => $finalTour
        ]);
        
        $filename = 'tour-itinerary-' . date('Y-m-d') . '.pdf';
        
        return $pdf->download($filename);
    }
    
    /**
     * Download payment receipt as PDF
     */
    public function downloadReceipt(Request $request)
    {
        $paymentId = $request->input('payment_id');
        
        if (!$paymentId) {
            return redirect()->back()->with('error', 'Payment ID not found');
        }
    
        // Get payment data
        $paymentData = Payment::find($paymentId);
        
        if (!$paymentData) {
            return redirect()->back()->with('error', 'Payment not found');
        }
    
        // Get tour data
        $tourData = tour_user::where('tour_id', $paymentData->tour_id)->first();
        
        $pdf = Pdf::loadView('pdf.payment-receipt', [
            'paymentData' => $paymentData,
            'tourData' => $tourData ? [
                'departure' => $tourData->user_preferences['departure'] ?? null,
                'destination' => $tourData->destination ?? null,
                'days' => $tourData->user_preferences['days'] ?? count($tourData->itinerary ?? []),
                'passengers' => $tourData->user_preferences['passengers'] ?? null,
                'total_cost' => $tourData->user_preferences['total_cost'] ?? 0,
                'flight_cost' => $tourData->user_preferences['flight_cost'] ?? 0,
                'schedules' => $tourData->schedules ?? [],
                'start_date' => $tourData->start_date ?? null,
            ] : null,
        ]);
        
        $filename = 'receipt-' . $paymentData->id . '.pdf';
        
        return $pdf->download($filename);
    }

    public function saveUserPreferences(Request $request)
    {
        // Check if user is authenticated
        if (!auth()->check()) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        $validated = $request->validate([
            'city_id' => 'nullable|string',
            'city_name' => 'nullable|string',
            'liked_restaurants' => 'nullable|array',
            'disliked_restaurants' => 'nullable|array',
            'liked_hotels' => 'nullable|array',
            'disliked_hotels' => 'nullable|array',
            'liked_activities' => 'nullable|array',
            'disliked_activities' => 'nullable|array',
            'liked_transport' => 'nullable|array',
            'disliked_transport' => 'nullable|array',
        ]);
        
        $userId = auth()->id();
        
        // Xác định identifier để tìm preference (ưu tiên city_id, fallback city_name)
        $cityIdentifier = $validated['city_id'] ?? $validated['city_name'] ?? null;
        $cityIdField = $validated['city_id'] ? 'city_id' : 'city_name';
        
        if (!$cityIdentifier) {
            return response()->json([
                'success' => false,
                'message' => 'Either city_id or city_name is required',
            ], 400);
        }
        
        // Update hoặc create preferences
        $userPreferences = User_preferences::updateOrCreate(
            [
                'user_id' => $userId,
                $cityIdField => $cityIdentifier,
            ],
            [
                'city_id' => $validated['city_id'] ?? null,
                'city_name' => $validated['city_name'] ?? null,
                'liked_restaurants' => $validated['liked_restaurants'] ?? [],
                'disliked_restaurants' => $validated['disliked_restaurants'] ?? [],
                'liked_hotels' => $validated['liked_hotels'] ?? [],
                'disliked_hotels' => $validated['disliked_hotels'] ?? [],
                'liked_activities' => $validated['liked_activities'] ?? [],
                'disliked_activities' => $validated['disliked_activities'] ?? [],
                'liked_transport' => $validated['liked_transport'] ?? [],
                'disliked_transport' => $validated['disliked_transport'] ?? [],
            ]
        );

        Log::info('User preferences saved', [
            'user_id' => $userId,
            'city_id' => $validated['city_id'] ?? null,
            'city_name' => $validated['city_name'] ?? null,
            'liked_restaurants_count' => count($validated['liked_restaurants'] ?? []),
            'disliked_restaurants_count' => count($validated['disliked_restaurants'] ?? []),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User preferences saved successfully',
            'data' => $userPreferences,
        ], 200);
    }
}

