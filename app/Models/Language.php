<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Language extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'languages';

    protected $fillable = [
        'name',
        'code',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];
}

