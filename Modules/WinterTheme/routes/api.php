<?php

use Illuminate\Support\Facades\Route;
use Modules\WinterTheme\Http\Controllers\WinterThemeController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('winterthemes', WinterThemeController::class)->names('wintertheme');
});
