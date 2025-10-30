<?php

namespace App\Jobs;

use App\Models\LanguageLine;
use Illuminate\Bus\Batchable; // <-- Quan trọng
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ImportTranslationChunk implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $keysChunk;

    public function __construct(array $keysChunk)
    {
        $this->keysChunk = $keysChunk;
    }

    public function handle(): void
    {
        if ($this->batch()->cancelled()) {
            return;
        }

        try {
            LanguageLine::insert($this->keysChunk);
        } catch (\Exception $e) {
            Log::error('Lỗi ImportTranslationChunk: ' . $e->getMessage());
        }
    }
}