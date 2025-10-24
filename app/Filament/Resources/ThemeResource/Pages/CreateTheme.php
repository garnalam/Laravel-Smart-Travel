<?php

namespace App\Filament\Resources\ThemeResource\Pages;

use App\Filament\Resources\ThemeResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use ZipArchive;
class CreateTheme extends CreateRecord
{
    protected static string $resource = ThemeResource::class;

        protected function mutateFormDataBeforeCreate(array $data): array
    {
        $zipPath = Storage::disk('local')->path($data['theme_zip']);
        $zip = new ZipArchive;

        if ($zip->open($zipPath) === TRUE) {
            $themeFolderName = $zip->getNameIndex(0);
            if (strpos($themeFolderName, '/') !== false) {
                $themeFolderName = substr($themeFolderName, 0, strpos($themeFolderName, '/'));
            }

            $extractPath = storage_path('app/public/themes/');

            if (File::exists($extractPath . $themeFolderName)) {
                Storage::disk('local')->delete($data['theme_zip']);
                throw new \Exception("Giao diện '{$themeFolderName}' đã tồn tại. Vui lòng xóa giao diện cũ trước khi cài đặt.");
            }

            $zip->extractTo($extractPath);
            $zip->close();

            $jsonPath = $extractPath . $themeFolderName . '/module.json';
            if (!File::exists($jsonPath)) {
                File::deleteDirectory($extractPath . $themeFolderName);
                Storage::disk('local')->delete($data['theme_zip']);
                throw new \Exception("File module.json không tồn tại trong gói giao diện.");
            }
            $meta = json_decode(file_get_contents($jsonPath), true);

            $data['name'] = $meta['name'];
            $data['path'] = $themeFolderName;
            $data['version'] = $meta['version'] ?? '1.0.0';
            $data['description'] = $meta['description'] ?? '';
            $data['author'] = $meta['author'] ?? 'Unknown';
            $data['is_active'] = false;
        }

        Storage::disk('local')->delete($data['theme_zip']);
        unset($data['theme_zip']);

        return $data;
    }
}
