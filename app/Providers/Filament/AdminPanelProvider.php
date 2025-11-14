<?php

namespace App\Providers\Filament;

// Import class MenuItem
use Filament\Navigation\MenuItem; // <-- THÊM DÒNG NÀY
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Widgets;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;
// Bạn không cần 'NavigationItem' nữa, nên có thể xóa dòng đó đi

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            // ->navigationItems(...) // <-- ĐÃ XÓA KHỎI ĐÂY
            ->login()
            
            // === THÊM ĐOẠN NÀY VÀO ===
            ->userMenuItems([
                MenuItem::make()
                    ->label('Về Dashboard')
                    ->url('/dashboard') // Đường dẫn bạn muốn trỏ tới
                    ->icon('heroicon-o-arrow-left-on-rectangle'), // Icon (thay đổi tùy ý)
                
                // Thêm 'logout' nếu bạn muốn giữ lại nút đăng xuất mặc định
                // Hoặc bạn có thể tùy chỉnh nó:
                // 'logout' => MenuItem::make()->label('Đăng xuất')
            ])
            // =========================

            ->colors([
                'primary' => Color::Amber,
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->pages([
                Pages\Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->widgets([
                Widgets\AccountWidget::class,
                Widgets\FilamentInfoWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}