<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\city\CityController;

// Test MongoDB connection
Route::get('/test-mongo', [CityController::class, 'testMongo'])->name('test.mongo');

Route::get('/cities', [CityController::class, 'getAllCities'])->name('cities.all');
Route::get('/city', [CityController::class, 'getCity'])->name('city.get');
Route::get('/cities/country/{country}', [CityController::class, 'getCitiesByCountry'])->name('cities.by_country');
Route::get('/cities/popular', [CityController::class, 'getPopularCities'])->name('cities.popular');
Route::get('/city/{id}', [CityController::class, 'getCityById'])->name('city.by_id');