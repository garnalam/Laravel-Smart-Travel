<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Laravel\Fortify\TwoFactorAuthenticatable; // Giữ lại nếu cần 2FA


class User extends Authenticatable implements FilamentUser
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable; // Giữ lại nếu cần 2FA
    
    protected $connection = 'mongodb';
    protected $primaryKey = '_id';
    public $incrementing = false;

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_admin',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean', 
        ];
    }

    protected static function boot()
    {
        parent::boot();

        // Thiết lập giá trị mặc định cho 'is_admin' là FALSE khi một Model mới được tạo
        static::creating(function ($user) {
            // Chỉ đặt là FALSE nếu giá trị chưa được set (ví dụ: không truyền vào từ Form)
            if (!isset($user->is_admin)) {
                $user->is_admin = false;
            }
        });
    }

    public function canAccessPanel(Panel $panel): bool
    {
        if ($panel->getId() === 'admin') {
            return (bool) $this->is_admin; 
        }

        return true;
    }
}