<?php

namespace App\Filament\Resources;

use App\Filament\Resources\LanguageResource\Pages;
use App\Models\Language;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class LanguageResource extends Resource
{
    protected static ?string $model = Language::class;

    protected static ?string $navigationIcon = 'heroicon-o-language';

    // Nhóm các mục menu lại cho gọn gàng
    protected static ?string $navigationGroup = 'Quản trị Hệ thống';

    // Đổi tên hiển thị trên menu cho thân thiện
    protected static ?string $modelLabel = 'Ngôn ngữ';
    protected static ?string $pluralModelLabel = 'Các Ngôn ngữ';


    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->label('Tên ngôn ngữ')
                    ->placeholder('Ví dụ: Vietnamese, English'),
                Forms\Components\TextInput::make('code')
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->label('Mã ngôn ngữ (2 ký tự)')
                    ->placeholder('Ví dụ: vi, en'),
                Forms\Components\Toggle::make('is_default')
                    ->label('Đặt làm ngôn ngữ mặc định?')
                    ->helperText('Ngôn ngữ mặc định sẽ được sử dụng khi hệ thống không xác định được ngôn ngữ của người dùng.'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->label('Tên ngôn ngữ'),
                Tables\Columns\TextColumn::make('code')
                    ->label('Mã'),
                Tables\Columns\IconColumn::make('is_default')
                    ->boolean()
                    ->label('Mặc định'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime('d-m-Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true) // Ẩn cột này đi cho gọn
                    ->label('Ngày tạo'),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
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
            'index' => Pages\ListLanguages::route('/'),
            'create' => Pages\CreateLanguage::route('/create'),
            'edit' => Pages\EditLanguage::route('/{record}/edit'),
        ];
    }
}

