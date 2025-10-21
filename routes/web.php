<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('tour/flight', function () {
        return Inertia::render('tour/page');
    })->name('tour');

    Route::post('tour/flight', function () {
        $validated = request()->validate([
            'departure' => 'required|string',
            'destination' => 'required|string',
            'departureDate' => 'required|string',
            'arrivalDate' => 'required|string',
            'budget' => 'required|numeric',
            'adults' => 'required|integer|min:1',
            'children' => 'nullable|integer|min:0',
            'infants' => 'nullable|integer|min:0',
        ]);

        return Inertia::render('tour/page', [
            'tourData' => $validated
        ]);
    })->name('tour.flight.submit');

    Route::get('tour/preferences', function () {
        return Inertia::render('tour/preferences');
    })->name('tour.preferences');

    Route::post('tour/preferences', function () {
        $validated = request()->validate([
            'departure' => 'required|string',
            'destination' => 'required|string',
            'departureDate' => 'required|string',
            'arrivalDate' => 'required|string',
            'days' => 'required|integer',
            'moneyFlight' => 'required|numeric',
            'passengers' => 'required|integer',
            'budget' => 'required|numeric',
            'adults' => 'required|integer|min:1',
            'children' => 'nullable|integer|min:0',
            'infants' => 'nullable|integer|min:0',
        ]);

        return Inertia::render('tour/preferences', [
            'tourData' => $validated
        ]);
    })->name('tour.preferences.submit');

    Route::post('tour/save-preferences', function () {
        $validated = request()->validate([
            'preferences' => 'required|array',
            'day' => 'required|integer',
        ]);

        // Save preferences to session or database
        session(['tour_preferences' => $validated]);

        return redirect()->route('tour.schedule')->with('success', 'Preferences saved successfully!');
    })->name('tour.save-preferences');

    Route::get('tour/schedule', [\App\Http\Controllers\Tour\TourController::class, 'showSchedule'])->name('tour.schedule');


    Route::post('tour/generate-schedule', [\App\Http\Controllers\Tour\TourController::class, 'generateSchedule'])->name('tour.generate.schedule');


    Route::post('tour/generate-final', function () {
        $validated = request()->validate([
            'schedules' => 'required|array',
            'destination' => 'nullable|string',
            'departure' => 'nullable|string',
            'days' => 'nullable|integer',
            'budget' => 'nullable|numeric',
            'passengers' => 'nullable|integer',
        ]);

        // Generate final tour using AI or save to database
        session(['final_tour' => $validated]);

        return redirect()->route('tour.final')->with('success', 'Tour generated successfully!');
    })->name('tour.generate.final');

    Route::get('tour/final', function () {
        $finalTour = session('final_tour', null);
        
        if (!$finalTour) {
            return redirect()->route('tour')->with('error', 'No tour data found. Please start a new tour.');
        }

        return Inertia::render('tour/FinalTour', [
            'tourData' => $finalTour,
        ]);
    })->name('tour.final');
});




require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';