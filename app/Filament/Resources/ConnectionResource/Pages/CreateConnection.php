<?php

namespace App\Filament\Resources\ConnectionResource\Pages;

use App\Filament\Resources\ConnectionResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateConnection extends CreateRecord
{
    protected static string $resource = ConnectionResource::class;

    /**
     * Ghi đè phương thức redirect mặc định.
     * Bắt buộc Filament phải sử dụng 'connection_id' để tạo URL.
     */
    protected function getRedirectUrl(): string
    {
        // $this->record chứa record vừa được tạo
        return static::getResource()::getUrl('view', ['record' => $this->record->connection_id]);
    }
}