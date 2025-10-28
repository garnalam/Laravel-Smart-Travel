<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PythonApiService
{
    protected string $baseUrl;
    protected ?string $apiKey;
    protected int $timeout;

    public function __construct()
    {
        $this->baseUrl = config('services.python_api.url', 'http://localhost:8000');
        $this->apiKey = config('services.python_api.api_key');
        $this->timeout = config('services.python_api.timeout', 300);
    }

    /**
     * Get travel recommendations from Python AI service
     *
     * @param array $preferences Travel preferences
     * @return array Response from Python API
     */
    public function getRecommendations(array $preferences): array
    {
        try {
            $headers = [];
            if (!empty($this->apiKey)) {
                $headers['X-API-Key'] = $this->apiKey;
            }

            $response = Http::timeout($this->timeout)
                ->withHeaders($headers)
                ->post("{$this->baseUrl}/api/recommendations", $preferences);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Python API Error', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return [
                'success' => false,
                'error' => "Python API returned status {$response->status()}: {$response->body()}",
                'data' => null
            ];
        } catch (\Exception $e) {
            Log::error('Python API Exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Get recommendations by city name with full preferences
     *
     * @param string $cityName City name
     * @param array $preferences Full preferences array
     * @return array Response from Python API
     */
    public function getRecommendationsByCityNameWithPreferences(
        string $cityName,
        array $preferences
    ): array {
        try {
            $headers = [];
            if (!empty($this->apiKey)) {
                $headers['X-API-Key'] = $this->apiKey;
            }

            // Prepare request with city name and all preferences
            $requestData = [
                'city_name' => $cityName,
                'guest_count' => $preferences['guest_count'] ?? 1,
                'duration_days' => $preferences['duration_days'] ?? 3,
                'target_budget' => $preferences['target_budget'] ?? 1000.0,
                'user_id' => $preferences['user_id'] ?? null,
                'liked_activities' => $preferences['liked_activities'] ?? [],
                'disliked_activities' => $preferences['disliked_activities'] ?? [],
                'liked_restaurants' => $preferences['liked_restaurants'] ?? [],
                'disliked_restaurants' => $preferences['disliked_restaurants'] ?? [],
                'liked_hotels' => $preferences['liked_hotels'] ?? [],
                'disliked_hotels' => $preferences['disliked_hotels'] ?? [],
                'liked_transport_modes' => $preferences['liked_transport_modes'] ?? [],
                'disliked_transport_modes' => $preferences['disliked_transport_modes'] ?? [],
            ];

            Log::info('Sending to by-city-name with preferences', [
                'city' => $cityName,
                'liked_activities_count' => count($requestData['liked_activities']),
                'liked_restaurants_count' => count($requestData['liked_restaurants']),
                'liked_hotels_count' => count($requestData['liked_hotels']),
            ]);

            $response = Http::timeout($this->timeout)
                ->withHeaders($headers)
                ->post("{$this->baseUrl}/api/recommendations/by-city-name", $requestData);

            if ($response->successful()) {
                return $response->json();
            }

            return [
                'success' => false,
                'error' => "Python API returned status {$response->status()}",
                'data' => null
            ];
        } catch (\Exception $e) {
            Log::error('Python API Exception (by city name with preferences)', [
                'message' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Get recommendations by city name (simple version - kept for backward compatibility)
     *
     * @param string $cityName City name
     * @param int $guestCount Number of guests
     * @param int $durationDays Trip duration
     * @param float $budget Budget
     * @param string|null $userId User ID
     * @return array Response from Python API
     */
    public function getRecommendationsByCityName(
        string $cityName,
        int $guestCount = 1,
        int $durationDays = 3,
        float $budget = 1000.0,
        ?string $userId = null
    ): array {
        try {
            $headers = [];
            if (!empty($this->apiKey)) {
                $headers['X-API-Key'] = $this->apiKey;
            }

            $response = Http::timeout($this->timeout)
                ->withHeaders($headers)
                ->post("{$this->baseUrl}/api/recommendations/by-city-name", [
                    'city_name' => $cityName,
                    'guest_count' => $guestCount,
                    'duration_days' => $durationDays,
                    'target_budget' => $budget,
                    'user_id' => $userId
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            return [
                'success' => false,
                'error' => "Python API returned status {$response->status()}",
                'data' => null
            ];
        } catch (\Exception $e) {
            Log::error('Python API Exception (by city name)', [
                'message' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Get list of available cities
     *
     * @param int $limit Number of cities to return
     * @return array Response from Python API
     */
    public function getCities(int $limit = 10): array
    {
        try {
            $headers = [];
            if (!empty($this->apiKey)) {
                $headers['X-API-Key'] = $this->apiKey;
            }

            $response = Http::timeout($this->timeout)
                ->withHeaders($headers)
                ->get("{$this->baseUrl}/api/cities", ['limit' => $limit]);

            if ($response->successful()) {
                return $response->json();
            }

            return [
                'success' => false,
                'error' => "Python API returned status {$response->status()}",
                'cities' => []
            ];
        } catch (\Exception $e) {
            Log::error('Python API Exception (get cities)', [
                'message' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'cities' => []
            ];
        }
    }

    /**
     * Search for flights
     *
     * @param string $departureCity Departure city name or IATA code
     * @param string $arrivalCity Arrival city name or IATA code
     * @param string $departureDate Departure date (YYYY-MM-DD)
     * @param string|null $returnDate Return date (YYYY-MM-DD) - optional
     * @return array Response from Python API
     */
    public function searchFlights(
        string $departureCity,
        string $arrivalCity,
        string $departureDate,
        ?string $returnDate = null
    ): array {
        try {
            $headers = [];
            if (!empty($this->apiKey)) {
                $headers['X-API-Key'] = $this->apiKey;
            }

            $requestData = [
                'departure_city' => $departureCity,
                'arrival_city' => $arrivalCity,
                'departure_date' => $departureDate,
            ];

            if ($returnDate) {
                $requestData['return_date'] = $returnDate;
            }

            Log::info('Searching flights', $requestData);

            $response = Http::timeout($this->timeout)
                ->withHeaders($headers)
                ->post("{$this->baseUrl}/api/flight-search", $requestData);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Python API Flight Search Error', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return [
                'success' => false,
                'error' => "Python API returned status {$response->status()}: {$response->body()}",
                'data' => null
            ];
        } catch (\Exception $e) {
            Log::error('Python API Flight Search Exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Test Python API connection
     *
     * @return array Health check response
     */
    public function healthCheck(): array
    {
        try {
            $response = Http::timeout(10)
                ->get("{$this->baseUrl}/health");

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            return [
                'success' => false,
                'error' => "Health check failed with status {$response->status()}"
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}

