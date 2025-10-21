<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\city\CityController;
use App\Http\Controllers\place\PlaceController;
use App\Http\Controllers\place\PlaceFetchController;
use App\Http\Controllers\AI\AIRecommendationController;

// Test MongoDB connection
Route::get('/test-mongo', [CityController::class, 'testMongo'])->name('test.mongo');

// City routes
Route::get('/cities', [CityController::class, 'getAllCities'])->name('cities.all');
Route::get('/city', [CityController::class, 'getCity'])->name('city.get');
Route::get('/cities/country/{country}', [CityController::class, 'getCitiesByCountry'])->name('cities.by_country');
Route::get('/cities/popular', [CityController::class, 'getPopularCities'])->name('cities.popular');
Route::get('/city/{id}', [CityController::class, 'getCityById'])->name('city.by_id');

// Place routes
Route::get('/places/test-mongo', [PlaceController::class, 'testMongo'])->name('places.test.mongo');
Route::get('/places/debug-metadata', [PlaceController::class, 'debugMetadata'])->name('places.debug.metadata');
Route::get('/places/city', [PlaceController::class, 'getPlacesByCity'])->name('places.by_city');
Route::get('/places/type', [PlaceController::class, 'getPlacesByType'])->name('places.by_type');
Route::get('/places/tour-preferences', [PlaceController::class, 'getPlacesForTourPreferences'])->name('places.tour_preferences');

// AI Recommendation routes (Python API integration)
Route::prefix('ai')->group(function () {
    Route::post('/recommendations', [AIRecommendationController::class, 'getRecommendations'])->name('ai.recommendations');
    Route::post('/recommendations/by-city-name', [AIRecommendationController::class, 'getRecommendationsByCityName'])->name('ai.recommendations.by_city');
    Route::get('/cities', [AIRecommendationController::class, 'getCities'])->name('ai.cities');
    Route::get('/health', [AIRecommendationController::class, 'healthCheck'])->name('ai.health');
});