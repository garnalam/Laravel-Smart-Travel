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

    Route::get('tour/payment', function () {
        return redirect()->route('tour')->with('error', 'Please start a new tour.');
    })->name('tour.payment');

    Route::get('tour/success', function () {
        return Inertia::render('tour/success');
    })->name('tour.success');

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
            'city_id' => 'nullable|string',
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
        $payload = request()->all();

        // Generate final tour using AI or save to database
        session(['final_tour' => $payload]);

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

    // Save tour data
    Route::post('tour/save-tour-data', [\App\Http\Controllers\Tour\TourController::class, 'saveTourData'])->name('tour.save.tour.data');

    Route::post('tour/payment', [\App\Http\Controllers\Tour\TourController::class, 'paymentTour'])->name('tour.payment.tour');

    Route::get('tour/download-itinerary', [\App\Http\Controllers\Tour\TourController::class, 'downloadItinerary'])->name('tour.download.itinerary');
    Route::get('tour/download-receipt', [\App\Http\Controllers\Tour\TourController::class, 'downloadReceipt'])->name('tour.download.receipt');
});


Route::get('language/{locale}', function ($locale) {
    // Kiểm tra xem ngôn ngữ có được hỗ trợ không (tùy chọn nhưng nên có)
    // Ví dụ: if (in_array($locale, ['en', 'vi'])) { ... }

    // Lưu ngôn ngữ người dùng chọn vào session
    Session::put('locale', $locale);
    
    // Quay trở lại trang trước đó
    return redirect()->back();
})->name('language.switch');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

