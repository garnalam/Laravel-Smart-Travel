<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Filament\Resources\UserResource\RelationManagers;
use Filament\Forms\Components\TextInput;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Illuminate\Support\Facades\Hash; // 
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Filament\Forms\Components\Toggle;
use Filament\Tables\Columns\IconColumn;


class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

public static function form(Form $form): Form
{
    return $form
        ->schema([
            TextInput::make('name')
                ->label('Tên người dùng')
                ->required() // Bắt buộc
                ->maxLength(255),

            TextInput::make('email')
                ->label('Email')
                ->email()
                ->unique(ignoreRecord: true) // Đảm bảo email là duy nhất (bỏ qua bản ghi hiện tại khi sửa)
                ->required()
                ->maxLength(255),

            TextInput::make('password')
                ->label('Mật khẩu')
                ->password()
                ->dehydrateStateUsing(fn (string $state): string => Hash::make($state)) // BẮT BUỘC: Mã hóa mật khẩu
                ->dehydrated(fn (?string $state): bool => filled($state)) // CHỈ LƯU khi trường có giá trị (khi sửa, người dùng không cần nhập lại)
                ->required(fn (string $operation): bool => $operation === 'create'), // BẮT BUỘC khi tạo mới


            Toggle::make('is_admin')
                ->label('Cấp quyền Quản trị viên')
                ->helperText('Người dùng này có được phép truy cập Panel Admin không?')
                ->default(false),
        ]);
}

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('_id')
                    ->label('ID'),
                Tables\Columns\TextColumn::make('created_at')
                    ->date()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('email')
                    ->searchable(),
                Tables\Columns\TextColumn::make('name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('updated_at')
                    ->date()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                IconColumn::make('is_admin')
                ->label('Admin?')
                ->boolean() // Hiển thị dưới dạng dấu check (true) hoặc X (false)
                ->sortable(),
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
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
