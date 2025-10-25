<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class tour_user extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'user_tours';

    protected $fillable = [
        'user_id',
        'tour_id',
        'tour_data',
        'title',
        'duration_days',
        'start_date',
        'destination',
        'user_preferences',
        'itinerary',
        'flights',
        'schedules',
        'created_at',
        'updated_at',
    ];
}

?>