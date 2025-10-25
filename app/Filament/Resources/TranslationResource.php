<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TranslationResource\Pages;
use App\Models\Language;
use App\Models\LanguageLine;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Forms\Components\Tabs;

class TranslationResource extends Resource
{
    protected static ?string $model = LanguageLine::class;

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';

    protected static ?string $navigationGroup = 'Quản trị Hệ thống';

    protected static ?string $modelLabel = 'Bản dịch';
    protected static ?string $pluralModelLabel = 'Các Bản dịch';

    public static function form(Form $form): Form
    {
        $languageTabs = [];
        try {
            $activeLanguages = Language::all();
            foreach ($activeLanguages as $language) {
                 $languageTabs[] = Tabs\Tab::make($language->name)
                    ->schema([
                        Forms\Components\Textarea::make("text.{$language->code}")
                            ->label("Nội dung dịch ({$language->code})")
                            ->rows(3),
                    ]);
            }
        } catch (\Exception $e) {
            // No action needed if the languages table doesn't exist yet
        }

        return $form
            ->schema([
                Forms\Components\TextInput::make('group')
                    ->required()
                    ->label('Nhóm')
                    ->helperText('Nhóm các bản dịch lại với nhau. Ví dụ: homepage, validation, auth...'),
                Forms\Components\TextInput::make('key')
                    ->required()
                    ->label('Key (Khóa)')
                    ->helperText('Tên định danh duy nhất cho chuỗi dịch này. Ví dụ: welcome_message, invalid_email...'),
                Tabs::make('Translations')
                    ->tabs($languageTabs)
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        // Lấy ngôn ngữ mặc định để hiển thị cột xem trước
        $defaultLanguage = Language::where('is_default', true)->first();
        // Fallback về 'en' nếu không có ngôn ngữ mặc định nào
        $defaultLangCode = $defaultLanguage->code ?? 'en';
        $defaultLangLabel = strtoupper($defaultLangCode);

        return $table
            ->columns([
                Tables\Columns\TextColumn::make('group')
                    ->sortable()
                    ->searchable()
                    ->label('Nhóm'),
                Tables\Columns\TextColumn::make('key')
                    ->sortable()
                    ->searchable()
                    ->label('Key'),
                // SỬA LỖI: Hiển thị cột xem trước theo ngôn ngữ mặc định một cách linh động
                Tables\Columns\TextColumn::make("text.{$defaultLangCode}")
                    ->label("Bản dịch ({$defaultLangLabel})")
                    ->limit(50)
                    ->placeholder('Chưa có bản dịch'),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime('d-m-Y H:i')
                    ->sortable()
                    ->label('Cập nhật lần cuối'),
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
            'index' => Pages\ListTranslations::route('/'),
            'create' => Pages\CreateTranslation::route('/create'),
            'edit' => Pages\EditTranslation::route('/{record}/edit'),
        ];
    }
}

