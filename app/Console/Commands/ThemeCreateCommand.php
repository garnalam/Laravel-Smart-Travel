<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

class ThemeCreateCommand extends Command
{
    /**
     * Tên và chữ ký của lệnh console.
     * {name} : Tên của theme (ví dụ: SummerTheme)
     */
    protected $signature = 'theme:create {name}'; // <--- Đây là tên lệnh bạn muốn

    /**
     * Mô tả lệnh.
     */
    protected $description = 'Tạo một theme module mới và sao chép các trang React mặc định (Pages)';

    /**
     * Thực thi lệnh.
     */
    public function handle()
    {
        // Lấy tên theme từ người dùng
        $name = $this->argument('name');

        // --- 1. GỌI LỆNH CÓ SẴN ĐỂ TẠO MODULE ---
        $this->info("Đang tạo module: {$name}...");
        Artisan::call('module:make', [
            'name' => [$name]
        ]);
        $this->info(Artisan::output());

        // --- 2. SAO CHÉP THƯ MỤC PAGES ---
        $this->info("Đang sao chép các trang (Pages) mặc định...");

        // Đường dẫn nguồn (app mặc định)
        $sourcePath = resource_path('js/Pages');

        // Đường dẫn đích (trong module mới)
        $destinationPath = base_path("Modules/{$name}/resources/assets/js/Pages");

        // Kiểm tra xem thư mục nguồn có tồn tại không
        if (!File::exists($sourcePath)) {
            $this->error("Lỗi: Không tìm thấy thư mục nguồn: {$sourcePath}");
            return 1;
        }

        // Tạo thư mục đích nếu nó chưa tồn tại
        File::ensureDirectoryExists($destinationPath);

        // Thực hiện sao chép
        if (File::copyDirectory($sourcePath, $destinationPath)) {
            $this->info("Đã sao chép thành công 'resources/js/Pages' vào 'Modules/{$name}/resources/assets/js/Pages'");
        } else {
            $this->error("Sao chép thất bại!");
            return 1;
        }

        $this->info("Hoàn tất tạo '{$name}' theme starter kit!");
        return 0;
    }
}