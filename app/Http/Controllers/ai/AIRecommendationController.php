<?php

namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Services\PythonApiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AIRecommendationController extends Controller
{
    protected PythonApiService $pythonApi;

    public function __construct(PythonApiService $pythonApi)
    {
        $this->pythonApi = $pythonApi;
    }

    /**
     * Get AI-powered travel recommendations
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getRecommendations(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'destination_city_id' => 'required|string',
            'guest_count' => 'integer|min:1|max:20',
            'duration_days' => 'integer|min:1|max:30',
            'target_budget' => 'numeric|min:0',
            'user_id' => 'nullable|string',
            // User preferences
            'liked_activities' => 'array',
            'disliked_activities' => 'array',
            'liked_restaurants' => 'array',
            'disliked_restaurants' => 'array',
            'liked_hotels' => 'array',
            'disliked_hotels' => 'array',
            'liked_transport_modes' => 'array',
            'disliked_transport_modes' => 'array',
        ]);

        $result = $this->pythonApi->getRecommendations($validated);

        if ($result['success']) {
            return response()->json($result);
        }

        return response()->json($result, 500);
    }

    /**
     * Get recommendations by city name
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getRecommendationsByCityName(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'city_name' => 'required|string',
            'guest_count' => 'integer|min:1|max:20',
            'duration_days' => 'integer|min:1|max:30',
            'target_budget' => 'numeric|min:0',
            'user_id' => 'nullable|string',
        ]);

        $result = $this->pythonApi->getRecommendationsByCityName(
            $validated['city_name'],
            $validated['guest_count'] ?? 1,
            $validated['duration_days'] ?? 3,
            $validated['target_budget'] ?? 1000.0,
            $validated['user_id'] ?? null
        );

        if ($result['success']) {
            return response()->json($result);
        }

        return response()->json($result, 500);
    }

    /**
     * Get available cities
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getCities(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 10);
        $result = $this->pythonApi->getCities($limit);

        return response()->json($result);
    }

    /**
     * Test Python API connection
     *
     * @return JsonResponse
     */
    public function healthCheck(): JsonResponse
    {
        $result = $this->pythonApi->healthCheck();

        if ($result['success']) {
            return response()->json($result);
        }

        return response()->json($result, 500);
    }
}

