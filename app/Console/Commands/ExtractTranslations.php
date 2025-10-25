<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Finder\Finder;
use App\Models\LanguageLine;
use App\Models\Language; // Import model Language
use Illuminate\Support\Facades\Log; // Thêm Log để báo lỗi CSDL

class ExtractTranslations extends Command
{
    /**
     * Tên và chữ ký của lệnh console.
     *
     * @var string
     */
    protected $signature = 'translations:extract';

    /**
     * Mô tả của lệnh console.
     *
     * @var string
     */
    protected $description = 'Scan project files and update translation keys in the database.';

    /**
     * Thực thi lệnh console.
     */
    public function handle()
    {
        // =================================================================
        // BƯỚC 1: LẤY ĐỘNG CÁC NGÔN NGỮ TỪ CSDL
        // =================================================================
        $this->info('Fetching supported languages from database...');
        $supportedLocales = [];
        try {
            // Lấy tất cả 'code' từ collection 'languages' và chuyển thành mảng
            // Ví dụ: ['vi', 'en', 'ita']
            $supportedLocales = Language::all()->pluck('code')->toArray();
        } catch (\Exception $e) {
            $this->error('Lỗi: Không thể kết nối CSDL để lấy danh sách ngôn ngữ.');
            $this->error($e->getMessage());
            Log::error('ExtractTranslations Error: ' . $e->getMessage());
            return 1; // Thoát với mã lỗi
        }

        if (empty($supportedLocales)) {
            $this->error('Lỗi: Không tìm thấy ngôn ngữ nào trong CSDL (collection: languages).');
            $this->error('Vui lòng thêm ít nhất 1 ngôn ngữ vào CSDL trước khi quét.');
            return 1; // Thoát với mã lỗi
        }
        $this->info('Supported languages found: ' . implode(', ', $supportedLocales));
        // =================================================================


        $this->info('Starting to scan for translation keys...');

        // Các thư mục cần quét
        $scanPaths = [
            app_path(),
            resource_path('views'),
            resource_path('js'), // Quét cả file JS cho Inertia/Vue/React
        ];

        // Pattern để tìm các hàm __(), trans(), @lang()
        $pattern = "/(?:__|trans|@lang)\(\s*['\"]([^'\"]+)['\"]\s*\)/";
        
        $finder = new Finder();
        $finder->in($scanPaths)->name(['*.php', '*.blade.php', '*.js', '*.vue', '*.jsx', '*.tsx'])->files();

        $foundKeys = [];

        foreach ($finder as $file) {
            $content = $file->getContents();
            if (preg_match_all($pattern, $content, $matches)) {
                foreach ($matches[1] as $key) {
                    // Bỏ qua các key động hoặc rỗng
                    if (!str_contains($key, '$') && !empty($key)) {
                        $foundKeys[] = $key;
                    }
                }
            }
        }
        
        $foundKeys = array_unique($foundKeys);
        $this->info(count($foundKeys) . ' unique keys found in your code.');
        
        if (empty($foundKeys)) {
            $this->info('No new keys to add. Exiting.');
            return 0;
        }

        $newKeysCount = 0;
        $updatedKeysCount = 0;
        $defaultText = [];

        // Chuẩn bị text mặc định (dựa trên mảng $supportedLocales vừa lấy)
        // Sẽ tạo ra: {"en": "", "vi": "", "ita": ""}
        foreach ($supportedLocales as $locale) {
            $defaultText[$locale] = ''; 
        }

        foreach ($foundKeys as $fullKey) {
            $group = 'single';
            $key = $fullKey;
            
            // Xử lý cả key có nhóm và không có nhóm
            if (str_contains($fullKey, '.')) {
                $parts = explode('.', $fullKey, 2);
                $group = $parts[0];
                $key = $parts[1];
            }
            
            // Bỏ qua nếu không thể tách key
            if (empty($group) || empty($key)) {
                continue;
            }

            // =================================================================
            // BƯỚC 2: NÂNG CẤP LOGIC TÌM VÀ CẬP NHẬT (SMART MERGE)
            // =================================================================
            
            // Tìm key đã có, hoặc tạo mới trong bộ nhớ
            $model = LanguageLine::firstOrNew([
                'group' => $group,
                'key' => $key,
            ]);

            // Lấy text hiện tại, đảm bảo nó là 1 mảng
            $currentText = $model->text ?? [];
            if (!is_array($currentText)) {
                $currentText = [];
            }

            // Gộp với mảng mặc định
            // (Toán tử '+' sẽ giữ giá trị cũ và chỉ thêm key mới)
            // Ví dụ: {"en": "Hello"} + {"en": "", "vi": "", "ita": ""}
            // Kết quả: {"en": "Hello", "vi": "", "ita": ""}
            $mergedText = $currentText + $defaultText;
            
            // Kiểm tra xem có gì thay đổi không
            if ($model->exists && $model->text === $mergedText) {
                // Không có gì thay đổi (key đã có đủ en, vi, ita), bỏ qua
                continue;
            }

            // Có thay đổi (là key mới, hoặc key cũ thiếu 'ita'), lưu lại
            $model->text = $mergedText;
            $model->save();

            if ($model->wasRecentlyCreated) {
                // Đây là key mới
                $this->line('Added new key: ' . $fullKey);
                $newKeysCount++;
            } else {
                // Đây là key cũ được cập nhật
                $this->line('Updated existing key with new locales: ' . $fullKey);
                $updatedKeysCount++;
            }
        }

        $this->info("Scan finished!");
        $this->info("Successfully added {$newKeysCount} new translation keys.");
        $this->info("Successfully updated {$updatedKeysCount} existing keys with missing languages.");
        $this->comment("Please go to the admin panel to add the translations.");
        
        return 0; // Báo thành công
    }
}