<?php

namespace App\Http\Middleware;

use App\Models\Language;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Session;

class SetLocale
{
    public function handle(Request $request, Closure $next)
    {
        $locale = null;

        // Ưu tiên 1: Lấy ngôn ngữ từ session nếu người dùng đã chọn trước đó
        if (Session::has('locale')) {
            $locale = Session::get('locale');
        } 
        // Ưu tiên 2: Lấy ngôn ngữ mặc định từ database (thông qua cache)
        else {
            // Lấy mã ngôn ngữ mặc định từ cache để tăng tốc độ.
            // Cache này sẽ được tự động xóa khi bạn thay đổi ngôn ngữ mặc định trong admin.
            $defaultLocaleCode = Cache::rememberForever('default_locale', function () {
                try {
                    return Language::where('is_default', true)->first()?->code;
                } catch (\Exception $e) {
                    // Trả về null nếu có lỗi (ví dụ: bảng chưa được tạo)
                    return null;
                }
            });

            if ($defaultLocaleCode) {
                $locale = $defaultLocaleCode;
            }
        }

        // Ưu tiên 3 (Dự phòng): Lấy ngôn ngữ từ trình duyệt nếu cả 2 trường hợp trên đều không có
        if (!$locale) {
            $locale = substr($request->server('HTTP_ACCEPT_LANGUAGE'), 0, 2);
        }

        // Thiết lập ngôn ngữ cho toàn hệ thống
        App::setLocale($locale);

        return $next($request);
    }
}