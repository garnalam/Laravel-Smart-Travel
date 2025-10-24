<?php

namespace App\Filament\Resources\ConnectionResource\Pages;

use App\Filament\Resources\ConnectionResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
// Xoá các use không cần thiết như Notification, DeleteAction, RunConnectionJob
// use App\Models\Connection; 
// use Filament\Notifications\Notification;
// use Filament\Pages\Actions\DeleteAction;
// use App\Jobs\RunConnectionJob;

class ListConnections extends ListRecords
{
    protected static string $resource = ConnectionResource::class;
    protected static string $view = 'filament.resources.connection-resource.pages.list-connections-cards';

    public function getTitle(): string
    {
        // Đổi tiêu đề cho khớp
        return 'API Connections';
    }

    public function getSubheading(): ?string
    {
        // Đổi mô tả cho khớp
        return 'Manage your API integrations and configurations';
    }

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()
                // Đổi label cho khớp
                ->label('New Connection') 
                ->icon('heroicon-o-plus'), // Đổi icon cho khớp
        ];
    }

    // --- XOÁ TOÀN BỘ CÁC HÀM BÊN DƯỚI ---
    // Trang này không cần các hành động này
    
    // protected function getActions(): array
    // {
    //     // ... (Xoá)
    // }

    // public function confirmDelete(string $connectionId)
    // {
    //     // ... (Xoá)
    // }

    // public function runNow(string $connectionId)
    // {
    //     // ... (Xoá)
    // }

    // public function toggleSchedule(string $connectionId)
    // {
    //     // ... (Xoá)
    // }
}