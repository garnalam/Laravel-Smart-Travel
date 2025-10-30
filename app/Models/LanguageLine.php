<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class LanguageLine extends Model
{
    /**
     * Ghi đè model của Spatie để dùng MongoDB
     */
    protected $connection = 'mongodb';
    protected $collection = 'language_lines';

    public $timestamps = true;

    protected $fillable = [
        'group',
        'key',
        'text',
    ];

    protected $casts = [
        'text' => 'array',
    ];
}

