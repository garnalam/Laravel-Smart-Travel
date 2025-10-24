<?php

use Illuminate\Support\Facades\Route;
use Modules\WinterTheme\Http\Controllers\WinterThemeController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('winterthemes', WinterThemeController::class)->names('wintertheme');
});
