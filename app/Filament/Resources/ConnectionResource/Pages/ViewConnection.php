<?php
namespace App\Filament\Resources\ConnectionResource\Pages; // <-- Đảm bảo dòng này đúng

use App\Filament\Resources\ConnectionResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;
use Filament\Actions\Action; // Thêm use statement này
use Filament\Notifications\Notification; // Và cái này nữa

class ViewConnection extends ViewRecord
{
    protected static string $resource = ConnectionResource::class;

    // 👇 DÁN HÀM CỦA BẠN VÀO BÊN TRONG CLASS NHƯ THẾ NÀY 👇
    protected function getHeaderActions(): array
    {
        return [
            Action::make('testConnection')
                ->label('Test Connection')
                ->color('gray')
                ->icon('heroicon-o-bolt')
                ->action(function ($record) {
                    // TODO: Viết logic để gọi API thử
                    Notification::make()
                        ->title('Connection test successful!')
                        ->success()
                        ->send();
                }),
            Action::make('runNow')
                ->label('Run Now')
                ->icon('heroicon-o-play')
                ->requiresConfirmation()
                ->action(function () {
                    // TODO: Viết logic để thực thi pipeline
                    Notification::make()
                        ->title('Pipeline started!')
                        ->info()
                        ->send();
                }),
            Actions\EditAction::make(),
        ];
    }
}