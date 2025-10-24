<?php

namespace App\Filament\Resources\TranslationResource\Pages;

use App\Filament\Resources\TranslationResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
use App\Models\LanguageLine;
use Filament\Actions\Action;
use Filament\Forms\Components\FileUpload;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ListTranslations extends ListRecords
{
    protected static string $resource = TranslationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),

            // NÚT MỚI: Quét key dịch thuật từ mã nguồn
            Action::make('scan')
                ->label('Quét Keys Mới')
                ->color('primary') // <-- SỬA LỖI: Đổi màu từ 'secondary' sang 'primary'
                ->icon('heroicon-o-magnifying-glass')
                ->requiresConfirmation()
                ->modalHeading('Quét mã nguồn tìm key dịch?')
                ->modalDescription('Hành động này sẽ quét các file trong dự án để tìm các key dịch thuật mới và tự động thêm chúng vào cơ sở dữ liệu. Quá trình này có thể mất một vài giây.')
                ->action(function () {
                    set_time_limit(300);
                    try {
                        // Gọi lệnh Artisan mà chúng ta đã tạo
                        Artisan::call('translations:extract');
                        $output = Artisan::output();

                        // Trích xuất số lượng key mới đã thêm từ output của lệnh
                        preg_match('/Successfully added (\d+) new translation keys/', $output, $matches);
                        $newKeysCount = $matches[1] ?? 0;

                        Notification::make()
                            ->title('Quét Hoàn Tất')
                            ->body("Đã quét xong. Thêm mới {$newKeysCount} key dịch thuật.")
                            ->success()
                            ->send();
                    } catch (\Exception $e) {
                        Notification::make()
                            ->title('Quét Thất Bại')
                            ->body('Đã xảy ra lỗi trong quá trình quét. Vui lòng kiểm tra file log.')
                            ->danger()
                            ->send();
                        Log::error('Lỗi khi chạy translations:extract từ admin: ' . $e->getMessage());
                    }
                    
                    // Tải lại trang để hiển thị các key mới
                    return redirect(static::getUrl());
                }),

            Action::make('import')
                ->label('Import JSON')
                ->color('primary')
                ->icon('heroicon-o-arrow-up-tray')
                ->form([
                    FileUpload::make('attachment')
                        ->label('File JSON Bản dịch')
                        ->required()
                        ->acceptedFileTypes(['application/json'])
                        ->disk('local')
                        ->directory('imports')
                        ->visibility('private'),
                ])
                ->action(function (array $data) {
                    set_time_limit(300);
                    $relativePath = $data['attachment'];
                    $disk = 'local';
                        
                    try {
                        $absolutePath = Storage::disk($disk)->path($relativePath);

                        if (!Storage::disk($disk)->exists($relativePath)) {
                            throw new \Exception('File tạm thời không được tìm thấy sau khi tải lên.');
                        }

                        $exitCode = Artisan::call('translations:import', [
                            'path' => $absolutePath,
                        ]);

                        if ($exitCode === 0) {
                            Notification::make()
                                ->title('Import Thành công')
                                ->body('Đã import và cập nhật thành công các key dịch thuật từ file.')
                                ->success()
                                ->send();
                        } else {
                            Notification::make()
                                ->title('Import Thất bại')
                                ->body('Đã xảy ra lỗi trong quá trình xử lý file. Vui lòng kiểm tra file log để biết chi tiết.')
                                ->danger()
                                ->send();
                        }
                    } catch (\Exception $e) {
                        Notification::make()
                            ->title('Lỗi Hệ thống')
                            ->body('Đã xảy ra lỗi không mong muốn. Lỗi: ' . $e->getMessage())
                            ->danger()
                            ->send();
                        Log::error('Lỗi khi import file dịch thuật: ' . $e->getMessage());
                    } finally {
                        if (Storage::disk($disk)->exists($relativePath)) {
                            Storage::disk($disk)->delete($relativePath);
                        }
                    }
                }),

            Action::make('export')
                ->label('Export JSON')
                ->color('primary')
                ->icon('heroicon-o-arrow-down-tray')
                ->action(function () {
                    $translations = LanguageLine::all()
                        ->groupBy('group')
                        ->map(function ($group) {
                            return $group->keyBy('key')->map(function ($line) {
                                return $line->text;
                            });
                        })
                        ->toJson(JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

                    return response()->streamDownload(function () use ($translations) {
                        echo $translations;
                    }, 'translations-' . now()->format('Y-m-d-H-i') . '.json');
                }),
        ];
    }
}

