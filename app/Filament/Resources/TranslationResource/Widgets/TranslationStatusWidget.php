<?php

namespace App\Filament\Resources\TranslationResource\Widgets;

use Filament\Widgets\Widget;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Cache;

class TranslationStatusWidget extends Widget
{
    protected static string $view = 'filament.resources.translation-resource.widgets.translation-status-widget';
    protected int | string | array $columnSpan = 'full';
    protected static ?string $pollingInterval = '2s'; // Hỏi mỗi 2 giây

    public int $importProgress = -1; // -1 nghĩa là không chạy

    public function mount(): void
    {
        $importBatchId = Cache::get('import_batch_id');

        if ($importBatchId) {
            $batch = Bus::findBatch($importBatchId);

            if ($batch) {
                if ($batch->finished() || $batch->cancelled()) {
                    Cache::forget('import_batch_id');
                    Cache::put('import_job_finished', true, 60);
                } else {
                    $this->importProgress = $batch->progress();
                }
            } else {
                // Nếu không tìm thấy batch, có thể đã lỗi, ta dọn dẹp
                Cache::forget('import_batch_id');
            }
        }

        // Chỉ kiểm tra job Import
        if (Cache::pull('import_job_finished')) {
            $this->dispatch('jobFinished');
        }
    }
}