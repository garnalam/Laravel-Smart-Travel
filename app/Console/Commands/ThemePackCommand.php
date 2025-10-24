<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use ZipArchive;
use Nwidart\Modules\Facades\Module; // Thêm dòng này

class ThemePackCommand extends Command
{
    /**
     * Tên và chữ ký của lệnh console.
     * {moduleName} : Tên của Module cần đóng gói (ví dụ: DefaultTheme)
     */
    protected $signature = 'theme:pack {moduleName}';

    /**
     * Mô tả của lệnh console.
     */
    protected $description = 'Đóng gói một module theme thành file .zip để phân phối';

    /**
     * Thực thi lệnh console.
     */
    public function handle()
    {
        $moduleName = $this->argument('moduleName');
        $module = Module::find($moduleName);

        if (!$module) {
            $this->error("Module '{$moduleName}' không tồn tại!");
            return 1;
        }

        // Đường dẫn tới các file đã build trong thư mục public
        $buildPath = public_path('build-' . strtolower($moduleName));
        $manifestPath = $module->getPath() . '/module.json';

        if (!File::isDirectory($buildPath)) {
            $this->error("Thư mục build '{$buildPath}' không tồn tại. Bạn đã chạy 'npm run build' chưa?");
            return 1;
        }

        $zip = new ZipArchive;
        $zipFileName = storage_path('app/' . $moduleName . '.zip');

        if (File::exists($zipFileName)) {
            File::delete($zipFileName);
        }

        if ($zip->open($zipFileName, ZipArchive::CREATE | ZipArchive::OVERWRITE) === TRUE) {
            // Thêm các file đã build vào zip
            $files = File::allFiles($buildPath);
            foreach ($files as $file) {
                $relativePath = $file->getRelativePathname();
                $zip->addFile($file->getRealPath(), $moduleName . '/build/' . str_replace('\\', '/', $relativePath));
            }

            // Thêm file module.json
            $zip->addFile($manifestPath, $moduleName . '/module.json');

            $zip->close();
            $this->info("✅ Đã đóng gói theme '{$moduleName}' thành công!");
            $this->line("   File được lưu tại: {$zipFileName}");
        } else {
            $this->error('Không thể tạo file .zip.');
            return 1;
        }

        return 0;
    }

}