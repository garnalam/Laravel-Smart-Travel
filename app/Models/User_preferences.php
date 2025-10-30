<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class User_preferences extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'user_preferences';

    protected $fillable = [
        'user_id',
        'city_id',
        'city_name', // Thêm city_name để fallback khi không có city_id
        'liked_restaurants',
        'disliked_restaurants',
        'liked_hotels',
        'disliked_hotels',
        'liked_activities',
        'disliked_activities',
        'liked_transport',
        'disliked_transport',
        'created_at',
        'updated_at',
    ];

    /**
     * Get user preferences by user_id and city (city_id or city_name)
     * 
     * @param string $userId
     * @param string $cityIdentifier (có thể là city_id hoặc city_name)
     * @return User_preferences|null
     */
    public static function getPreferences($userId, $cityIdentifier)
    {
        // Thử tìm theo city_id trước
        $preferences = self::where('user_id', $userId)
            ->where('city_id', $cityIdentifier)
            ->first();
        
        // Nếu không tìm thấy, thử tìm theo city_name
        if (!$preferences) {
            $preferences = self::where('user_id', $userId)
                ->where('city_name', $cityIdentifier)
                ->first();
        }
        
        return $preferences;
    }
}
?>