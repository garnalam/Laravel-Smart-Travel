<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ThemeResource\Pages;
use App\Models\Theme;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Actions\Action;
use Filament\Tables\Columns\IconColumn;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Cache; // Thêm dòng này

class ThemeResource extends Resource
{
    protected static ?string $model = Theme::class;

    protected static ?string $navigationIcon = 'heroicon-o-paint-brush';
    protected static ?string $navigationLabel = 'Quản lý Giao diện';
    protected static ?string $label = 'Giao diện';


public static function form(Form $form): Form
{
    return $form
        ->schema([
            FileUpload::make('theme_zip')
                ->label('Tải lên file .zip Giao diện')
                ->acceptedFileTypes(['application/zip', 'application/x-zip-compressed', 'application/octet-stream'])
                ->disk('local')
                ->directory('theme-uploads')
                ->required()
                ->helperText('Tải lên gói giao diện đã được đóng gói từ module.'),
        ]);
}

public static function table(Table $table): Table
{
    return $table
        ->columns([
            Tables\Columns\TextColumn::make('name')->label('Tên Giao diện')->searchable()->sortable(),
            Tables\Columns\TextColumn::make('path')->label('Thư mục'),
            Tables\Columns\TextColumn::make('version')->label('Phiên bản'),
            Tables\Columns\TextColumn::make('author')->label('Tác giả'),

            // SỬ DỤNG TOGGLE COLUMN THAY THẾ CHO ICON VÀ NÚT BẤM
            ToggleColumn::make('is_active')
                ->label('Trạng thái')
                ->onColor('success') // Màu khi bật
                ->offColor('danger')  // Màu khi tắt
                ->updateStateUsing(function ($record, $state): void {
                    // Nếu người dùng BẬT toggle
                    if ($state) {
                        // Tìm và tắt tất cả các theme khác
                        Theme::where('is_active', true)->where('_id', '!=', $record->id)->update(['is_active' => false]);
                    }

                    // Cập nhật trạng thái cho theme hiện tại
                    $record->is_active = $state;
                    $record->save();

                    // Xóa cache để áp dụng thay đổi ngay lập tức
                    Cache::forget('active_theme');
                }),
        ])
        ->actions([
            // GIỮ NGUYÊN NÚT XÓA
            Tables\Actions\DeleteAction::make()
                ->after(function (Theme $record) {
                    File::deleteDirectory(storage_path('app/public/themes/' . $record->path));
                    Cache::forget('active_theme'); // Xóa cache khi xóa theme
                }),
        ]);
}

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListThemes::route('/'),
            'create' => Pages\CreateTheme::route('/create'),
        ];
    }
}