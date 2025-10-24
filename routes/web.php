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
});


Route::get('language/{locale}', function ($locale) {
    // Kiểm tra xem ngôn ngữ có được hỗ trợ không (tùy chọn nhưng nên có)
    // Ví dụ: if (in_array($locale, ['en', 'vi'])) { ... }

    // Lưu ngôn ngữ người dùng chọn vào session
    Session::put('locale', $locale);
    
    // Quay trở lại trang trước đó
    return redirect()->back();
})->name('language.switch');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
// require __DIR__.'/admin.php';