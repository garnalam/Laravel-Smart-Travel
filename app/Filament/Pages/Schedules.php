<?php

namespace App\Filament\Pages;

use App\Models\Connection;
use App\Jobs\RunConnectionJob;
use Filament\Pages\Page;
use Filament\Notifications\Notification;
use Filament\Actions\DeleteAction;
use Filament\Actions\Concerns\InteractsWithActions;
use Filament\Actions\Contracts\HasActions;

class Schedules extends Page implements HasActions
{
    use InteractsWithActions;

    protected static ?string $navigationIcon = 'heroicon-o-calendar'; 
    protected static string $view = 'filament.pages.schedules';

    public $records = [];

public function mount(): void
{
    // --- DEBUG ---
    // 1. Thử lấy TẤT CẢ connection xem có dữ liệu không
    $allConnections = Connection::query()
        ->orderBy('name', 'asc')
        ->get();
    // dd('All Connections:', $allConnections); // Bỏ comment dòng này để xem tất cả

    // 2. Lấy câu truy vấn có điều kiện
    $query = Connection::query()
        ->where('schedule_config.enabled', true) // <-- Điều kiện lọc
        ->orderBy('name', 'asc');

    // 3. Xem câu truy vấn MongoDB thô (nếu dùng mongodb/laravel-mongodb)
    // dd('Raw MongoDB Query:', $query->toMql()); // Bỏ comment dòng này để xem câu query

    // 4. Lấy kết quả cuối cùng
    $this->records = $query->get();

    // 5. Dump kết quả cuối cùng
    // dd('Filtered Records:', $this->records); // Bỏ comment dòng này để xem kết quả lọc
    // --- END DEBUG ---

    // Dòng code gốc (tạm thời comment lại nếu dùng dd)
    // $this->records = Connection::query()
    //     ->where('schedule_config.enabled', true)
    //     ->orderBy('name', 'asc')
    //     ->get();
}


    public function getTitle(): string
    {
        return 'Schedules';
    }

    public function getSubheading(): ?string
    {
        return 'Manage automated API runs and schedules';
    }


    public function runNow(string $connectionId)
    {
        RunConnectionJob::dispatch($connectionId);

        Notification::make()
            ->title("Một tác vụ đã được đưa vào hàng đợi.")
            ->body("Job cho connection ID '{$connectionId}' sẽ chạy trong nền.")
            ->success()
            ->send();
            
        $this->mount();
    }


    public function toggleSchedule(string $connectionId)
    {
        $connection = Connection::where('connection_id', $connectionId)->firstOrFail();
        
        $connection->is_active = !$connection->is_active;
        $connection->save();
        
        $status = $connection->is_active ? 'resumed' : 'paused';
        Notification::make()
            ->title("Schedule for '" . $connection->name . "' has been {$status}.")
            ->info()
            ->send();

        $this->mount();
    }


    public function deleteAction(): DeleteAction
    {
        return DeleteAction::make('delete')
            ->record(fn (array $data) => Connection::where('connection_id', $data['connection_id'])->first())
            ->after(fn () => $this->mount());
    }

    public function confirmDelete(string $connectionId)
    {
        $this->dispatch('open-modal', id: 'delete', 
            settings: [
                'connection_id' => $connectionId
            ]
        );
    }
}