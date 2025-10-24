<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class CustomModuleMakeCommand extends Command
{
    protected $signature = 'module:make-theme {name : Tên của theme}';
    protected $description = 'Tạo một module theme hoàn chỉnh với Layout TSX riêng.';

    public function handle()
    {
        $name = $this->argument('name');
        $studlyName = Str::studly($name);
        $lowerName = Str::lower($name);
        $modulePath = base_path('Modules/' . $studlyName);

        // 1. GỌI LỆNH `module:make` GỐC
        $this->info("Đang tạo module cơ bản cho '$studlyName'...");
        Artisan::call('module:make', ['name' => [$name]]);
        $this->info(Artisan::output());

        // 2. TẠO CẤU TRÚC THƯ MỤC MỚI
        $this->info('Đang tạo cấu trúc thư mục tùy chỉnh...');
        File::makeDirectory($modulePath . '/resources/js/Layouts', 0755, true, true);
        File::makeDirectory($modulePath . '/resources/css', 0755, true, true);
        $this->info('-> Đã tạo: resources/js/Layouts và resources/css');

        // 3. TẠO FILE `MainLayout.tsx` TỪ KHUÔN MẪU
        $layoutStubPath = resource_path('stubs/theme/MainLayout.tsx.stub');
        if (File::exists($layoutStubPath)) {
            $stubContent = File::get($layoutStubPath);
            $layoutContent = str_replace('$STUDLY_NAME$', $studlyName, $stubContent);
            File::put($modulePath . '/resources/js/Layouts/MainLayout.tsx', $layoutContent);
            $this->info('-> Đã tạo: resources/js/Layouts/MainLayout.tsx');
        }

        // 4. TẠO CÁC FILE CSS/JS
        File::put($modulePath . '/resources/css/app.css', "/* CSS cho theme $studlyName */");
        File::put($modulePath . '/resources/js/app.js', "// JS cho theme $studlyName\nimport '../css/app.css';");
        $this->info('-> Đã tạo: app.js và app.css');

        // 5. GHI ĐÈ FILE `vite.config.js`
        $viteStubPath = resource_path('stubs/theme/vite.config.js.stub');
        if (File::exists($viteStubPath)) {
            $stubContent = File::get($viteStubPath);
            $viteContent = str_replace(['$STUDLY_NAME$', '$LOWER_NAME$'], [$studlyName, $lowerName], $stubContent);
            File::put($modulePath . '/vite.config.js', $viteContent);
            $this->info('-> Đã ghi đè: vite.config.js');
        }

        // 6. DỌN DẸP
        if (File::isDirectory($modulePath . '/resources/assets')) {
            File::deleteDirectory($modulePath . '/resources/assets');
            $this->info('-> Đã xóa: thư mục resources/assets cũ.');
        }

        $this->info("✅ Đã hoàn tất việc tạo theme '$studlyName'!");
        return 0;
    }
}