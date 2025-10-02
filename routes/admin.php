<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', function () {
        return Inertia::render('admin/dashboard');
    })->name('dashboard');

    Route::get('/users', function () {
        return Inertia::render('admin/users');
    })->name('users');

    Route::get('/analytics', function () {
        return Inertia::render('admin/analytics');
    })->name('analytics');

    Route::get('/settings', function () {
        return Inertia::render('admin/settings');
    })->name('settings');
});
