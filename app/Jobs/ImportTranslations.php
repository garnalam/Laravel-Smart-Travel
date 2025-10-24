<?php

namespace App\Jobs;

use App\Models\LanguageLine;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Bus; // <-- Thêm
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ImportTranslations implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public string $filePath;
    public $timeout = 600; // 10 phút

    public function __construct(string $filePath)
    {
        $this->filePath = $filePath;
    }

    public function handle(): void
    {
        $absolutePath = Storage::disk('local')->path($this->filePath);
        $batch = null; 

        try {
            $jsonString = file_get_contents($absolutePath);
            $allKeysFromFile = json_decode($jsonString, true);

            $fileKeys = [];
            $now = now();
            foreach ($allKeysFromFile as $group => $items) {
                if (!is_array($items)) continue;
                foreach ($items as $key => $translations) {
                    if (empty($key) || empty($translations) || !is_array($translations)) continue;
                    $fileKeys[$group . '.' . $key] = [
                        'group' => $group,
                        'key' => $key,
                        'text' => json_encode($translations),
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }

            if (empty($fileKeys)) {
                Cache::put('import_job_finished', true, 60);
                return;
            }

            $existingKeys = LanguageLine::get(['group', 'key'])
                ->mapWithKeys(fn($item) => [$item->group . '.' . $item->key => true])
                ->all();

            $newKeysToInsert = array_values(array_diff_key($fileKeys, $existingKeys));

            if (empty($newKeysToInsert)) {
                Cache::put('import_job_finished', true, 60);
                return;
            }

            $chunks = array_chunk($newKeysToInsert, 100); // Mỗi job con làm 100 key
            $jobs = [];
            foreach ($chunks as $chunk) {
                $jobs[] = new ImportTranslationChunk($chunk);
            }

            $batch = Bus::batch($jobs)
                ->name('Import Translations')
                ->finally(function () {
                    Cache::forget('import_batch_id');
                    Cache::put('import_job_finished', true, 60);
                })
                ->dispatch();

            Cache::put('import_batch_id', $batch->id, 600); 

        } catch (\Exception $e) {
            Log::error('Lỗi job ImportTranslations (cha): ' . $e->getMessage());
            if ($batch) {
                Cache::forget('import_batch_id');
            }
            Cache::put('import_job_finished', true, 60);
        } finally {
            Storage::disk('local')->delete($this->filePath);
        }
    }
}