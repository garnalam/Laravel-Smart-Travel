<?php

namespace App\Http\Middleware;

// THÊM CÁC DÒNG NÀY
use App\Models\Theme;
use Illuminate\Support\Facades\Storage;
// ---

use App\Models\LanguageLine;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Defines the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     */
    public function share(Request $request): array
    {
        // **BỔ SUNG: LOGIC LẤY GIAO DIỆN ĐANG KÍCH HOẠT**
        $activeTheme = Cache::rememberForever('active_theme', function () {
            // Tìm trong DB theme nào có cờ is_active = true
            return Theme::where('is_active', true)->first();
        });
        // ---

        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return array_merge(parent::share($request), [
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => fn () => ['user' => $request->user()],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            
            'translations' => function () {
                $locale = app()->getLocale();
                return Cache::rememberForever("translations_{$locale}", function () use ($locale) {
                    try {
                        return LanguageLine::all()
                            ->flatMap(function ($line) use ($locale) {
                                $key = $line->group === 'single' ? $line->key : "{$line->group}.{$line->key}";
                                $translation = $line->text[$locale] ?? $key;
                                return [$key => $translation];
                            });
                    } catch (\Exception $e) {
                        return [];
                    }
                });
            },
            // ---

            'active_theme' => $activeTheme ? [
                // Tạo ra đường dẫn công khai tới thư mục của theme
                'url' => Storage::url('themes/' . $activeTheme->path),
            ] : null, // Nếu không có theme nào active, gửi giá trị null
            // ---
        ]);
    }
}