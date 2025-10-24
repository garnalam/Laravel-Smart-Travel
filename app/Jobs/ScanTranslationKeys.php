<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ScanTranslationKeys implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // Cho phép job chạy tối đa 5 phút
    public $timeout = 300; 

    public function handle(): void
    {
        // 1. Đặt cờ báo "đang chạy"
        Cache::put('scan_job_running', true, 600); // 10 phút

        try {
            // 2. Chạy logic Artisan của bạn
            Artisan::call('translations:extract');

        } catch (\Exception $e) {
            Log::error('Lỗi job ScanTranslationKeys: ' . $e->getMessage());
        } finally {
            // 3. Xóa cờ "đang chạy" và đặt cờ "đã xong"
            Cache::forget('scan_job_running');
            Cache::put('scan_job_finished', true, 60);
        }
    }
}