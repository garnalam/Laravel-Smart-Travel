<?php

namespace App\Http\Controllers\Flight;

use App\Http\Controllers\Controller;
use App\Services\PythonApiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class FlightController extends Controller
{
    protected PythonApiService $pythonApi;

    public function __construct(PythonApiService $pythonApi)
    {
        $this->pythonApi = $pythonApi;
    }

    /**
     * Search for flights
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function searchFlights(Request $request): JsonResponse
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'departure_city' => 'required|string',
            'arrival_city' => 'required|string',
            'departure_date' => 'required|date_format:Y-m-d|after_or_equal:today',
            'return_date' => 'nullable|date_format:Y-m-d|after:departure_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
                'data' => null
            ], 422);
        }

        $validated = $validator->validated();

        // Call Python API
        $result = $this->pythonApi->searchFlights(
            $validated['departure_city'],
            $validated['arrival_city'],
            $validated['departure_date'],
            $validated['return_date'] ?? null
        );

        // Return response with appropriate status code
        $statusCode = $result['success'] ? 200 : 500;
        
        return response()->json($result, $statusCode);
    }
}

