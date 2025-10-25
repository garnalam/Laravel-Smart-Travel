<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'payments';

    protected $fillable = [
        'fullName',
        'email',
        'phone',
        'address',
        'user_id',
        'tour_id',
        'status',
        'created_at',
    ];
}

?>