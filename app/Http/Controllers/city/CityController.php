<?php

namespace App\Http\Controllers\city;

use App\Http\Controllers\Controller;
use App\Http\Requests\city\GetcityRequest;
use App\Models\City;
use Illuminate\Http\Request;

class CityController extends Controller
{
    /**
     * Get all cities from world_cities table
     */
    public function getAllCities()
    {
        // Use DB facade directly with MongoDB connection
        $limit = request()->get('limit', 10);
        $cities = \Illuminate\Support\Facades\DB::connection('mongodb')
            ->table('world_cities')
            ->limit($limit)
            ->get();
        return response()->json($cities);
    }

    /**
     * Search cities by name, city_ascii, or country
     */
    public function getCity(GetcityRequest $request)
    {
        $searchTerm = $request->search ?? '';
        $cities = City::searchCities($searchTerm);
        return response()->json($cities);
    }

    /**
     * Get cities by specific country
     */
    public function getCitiesByCountry(Request $request)
    {
        $request->validate([
            'country' => 'required|string|max:255'
        ]);

        $cities = City::getCitiesByCountry($request->country);
        return response()->json($cities);
    }

    /**
     * Get popular cities (with high population)
     */
    public function getPopularCities(Request $request)
    {
        $limit = $request->get('limit', 50);

        $cities = City::where('population', '>', 1000000)
                     ->orderBy('population', 'desc')
                     ->limit($limit)
                     ->get();

        return response()->json($cities);
    }

    /**
     * Get city details by ID
     */
    public function getCityById($id)
    {
        $city = City::find($id);

        if (!$city) {
            return response()->json(['error' => 'City not found'], 404);
        }

        return response()->json($city);
    }

    /**
     * Test MongoDB connection
     */
    public function testMongo()
    {
        try {
            $count = \Illuminate\Support\Facades\DB::connection('mongodb')->collection('world_cities')->count();
            $cities = \Illuminate\Support\Facades\DB::connection('mongodb')->collection('world_cities')->get();
            return response()->json([
                'status' => 'success',
                'count' => $count,
                'cities' => $cities
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
}
