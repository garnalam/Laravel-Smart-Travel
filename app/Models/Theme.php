<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Theme extends Model
{
    /**
     * Tên kết nối tới MongoDB (định nghĩa trong config/database.php)
     */
    protected $connection = 'mongodb';

    /**
     * Tên collection (bảng) trong database
     */
    protected $collection = 'themes';

    /**
     * Các trường được phép gán hàng loạt (mass assignment)
     */
    protected $fillable = [
        'name',
        'path', // Tên thư mục của theme, ví dụ: 'DefaultTheme'
        'version',
        'is_active',
        'author',
        'description',
    ];

    /**
     * Ép kiểu dữ liệu để đảm bảo 'is_active' luôn là true/false
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];
}