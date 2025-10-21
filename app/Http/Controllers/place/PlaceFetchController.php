<?php

namespace App\Http\Controllers\place;

use App\Http\Controllers\Controller;
use App\Models\Place;
use App\Models\PlaceMetadata;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

/**
 * Controller for fetching places from external APIs (e.g., Google Places API)
 * This is separate from PlaceController to handle data fetching operations
 */
class PlaceFetchController extends Controller
{
    /**
     * Fetch places from Google Places API and store in database
     * This would be used to populate the database with place data
     */
    public function fetchAndStorePlaces(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'city' => 'required|string',
                'search_types' => 'required|array',
                'search_types.*' => 'string|in:restaurant,hotel,attraction',
            ]);

            $city = $validated['city'];
            $searchTypes = $validated['search_types'];

            $results = [];
            
            foreach ($searchTypes as $type) {
                // This is a placeholder - you would implement actual Google Places API calls here
                $results[$type] = [
                    'status' => 'not_implemented',
                    'message' => 'Google Places API integration needed',
                ];
            }

            return response()->json([
                'success' => true,
                'city' => $city,
                'results' => $results,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching places', [
                'error' => $e->getMessage(),
            ]);
            
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get statistics about stored places
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $placesCount = Place::count();
            $metadataCount = PlaceMetadata::count();
            
            // Group by city
            $citiesWithPlaces = PlaceMetadata::raw(function($collection) {
                return $collection->aggregate([
                    [
                        '$group' => [
                            '_id' => '$city',
                            'count' => ['$sum' => 1]
                        ]
                    ],
                    ['$sort' => ['count' => -1]],
                    ['$limit' => 20]
                ]);
            });

            return response()->json([
                'success' => true,
                'statistics' => [
                    'total_places' => $placesCount,
                    'total_metadata' => $metadataCount,
                    'cities_with_places' => iterator_to_array($citiesWithPlaces),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting statistics', [
                'error' => $e->getMessage(),
            ]);
            
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

