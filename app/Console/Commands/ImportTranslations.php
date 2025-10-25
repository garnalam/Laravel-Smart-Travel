<?php

namespace App\Console\Commands;

use App\Models\LanguageLine;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ImportTranslations extends Command
{
    /**
     * Chữ ký của lệnh, nhận tham số 'path'.
     */
    protected $signature = 'translations:import {path}';

    /**
     * Mô tả của lệnh.
     */
    protected $description = 'Import translations, merging new languages without overwriting existing ones.';

    /**
     * Thực thi lệnh.
     */
    public function handle()
    {
        $path = $this->argument('path');
        if (!file_exists($path)) {
            $this->error("Lỗi: File không tìm thấy tại: $path");
            return 1; // Báo lỗi
        }

        $this->info("Bắt đầu gộp thông minh (smart merge) từ: $path");

        try {
            $jsonString = file_get_contents($path);
            $allKeysFromFile = json_decode($jsonString, true);
        } catch (\Exception $e) {
            $this->error("Lỗi khi đọc hoặc giải mã file JSON: " . $e->getMessage());
            return 1;
        }

        if (!is_array($allKeysFromFile)) {
            $this->error("Lỗi: Cấu trúc file JSON không hợp lệ.");
            return 1;
        }

        $newCount = 0;
        $updatedCount = 0;
        $skippedCount = 0;

        // Bắt đầu một transaction để đảm bảo an toàn dữ liệu
        DB::beginTransaction();
        try {
            foreach ($allKeysFromFile as $group => $items) {
                if (!is_array($items)) {
                    continue; // Bỏ qua nếu cấu trúc 'group' bị sai
                }

                foreach ($items as $key => $translationsFromFile) {
                    // Bỏ qua nếu key rỗng, hoặc bản dịch rỗng (như []), hoặc không phải mảng
                    if (empty($key) || empty($translationsFromFile) || !is_array($translationsFromFile)) {
                        continue;
                    }

                    // Tìm bản ghi hiện có, hoặc tạo mới trong bộ nhớ
                    $model = LanguageLine::firstOrNew([
                        'group' => $group,
                        'key' => $key,
                    ]);

                    // Lấy bản dịch hiện có (ép kiểu (array) để đảm bảo)
                    $existingTranslations = (array) ($model->text ?? []);
                    $fileTranslations = (array) $translationsFromFile;

                    // === LOGIC GỘP THÔNG MINH ===
                    // Toán tử (+) của PHP sẽ gộp mảng:
                    // Nó giữ các key từ mảng bên trái (CSDL)
                    // và chỉ thêm các key còn thiếu từ mảng bên phải (File JSON)
                    $mergedTranslations = array_merge($existingTranslations, $fileTranslations);
                    // Kiểm tra xem có gì thay đổi không
                    if ($mergedTranslations === $existingTranslations) {
                        $skippedCount++;
                        continue; // Bỏ qua, không cần cập nhật
                    }

                    // Nếu là bản ghi mới
                    if (!$model->exists) {
                        $newCount++;
                    } else {
                        // Nếu là bản ghi cũ được cập nhật
                        $updatedCount++;
                    }

                    // Lưu dữ liệu đã gộp
                    $model->text = $mergedTranslations;
                    $model->save();
                }
            }

            // Hoàn tất transaction
            DB::commit();

            $this->info("Import hoàn tất!");
            $this->info("Đã thêm mới: $newCount key.");
            $this->info("Đã gộp (cập nhật): $updatedCount key.");
            $this->info("Đã bỏ qua (không đổi): $skippedCount key.");
            
            return 0; // Báo thành công

        } catch (\Exception $e) {
            // Có lỗi, hoàn tác mọi thay đổi
            DB::rollBack();
            $this->error("Đã xảy ra lỗi nghiêm trọng: " . $e->getMessage());
            Log::error("Lỗi ImportTranslations: " . $e->getMessage());
            return 1; // Báo lỗi
        }
    }
}