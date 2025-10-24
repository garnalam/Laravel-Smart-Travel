<?php

// app/Helpers/ThemeHelper.php

use App\Models\Theme; // Đảm bảo bạn đã import đúng Model Theme của mình
use Illuminate\Support\Facades\Cache;

/**
 * Lấy toàn bộ object của theme đang được kích hoạt từ cache.
 * Đây là hàm nền tảng, ít khi được gọi trực tiếp.
 *
 * @return \App\Models\Theme|null
 */
function get_active_theme_object()
{
    // Sử dụng key 'active_theme_object' để cache
    return Cache::rememberForever('active_theme_object', function () {
        return Theme::where('is_active', true)->first();
    });
}

/**
 * Lấy tên của theme đang được kích hoạt (ví dụ: "SummerTheme").
 *
 * @return string|null
 */
function get_active_theme_name()
{
    $theme = get_active_theme_object();
    return $theme ? $theme->name : null;
}

/**
 * Lấy đường dẫn thư mục build cho Vite (ví dụ: "build-summertheme").
 *
 * @return string
 */
function get_active_theme_build_path()
{
    $themeName = get_active_theme_name();
    
    if ($themeName) {
        // Toàn bộ logic biến đổi tên nằm ở đây!
        return 'build-' . strtolower($themeName);
    }
    
    // Trả về thư mục build mặc định nếu không có theme
    return 'build';
}

/**
 * Xóa cache của theme đang active.
 * Gọi hàm này mỗi khi người dùng kích hoạt một theme mới.
 */
function clear_active_theme_cache()
{
    Cache::forget('active_theme_object');
}