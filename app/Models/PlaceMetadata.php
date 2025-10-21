<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class PlaceMetadata extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'place_metadata'; // Tên collection trong MongoDB

    protected $fillable = [
        'place_id',
        'city',
        'text_query',
        'fetch_time',
        'search_type', // hotel, restaurant, attraction
    ];

    protected $casts = [
        'fetch_time' => 'datetime',
    ];

    /**
     * Get place metadata by city and search type
     * 
     * @param string $city
     * @param string $searchType (hotel, restaurant, attraction)
     * @param int $limit
     * @return \Illuminate\Support\Collection
     */
    public static function getPlaceIdsByCity($city, $searchType, $limit = 20)
    {
        return self::where('city', $city)
                    ->where('search_type', $searchType)
                    ->limit($limit)
                    ->get()
                    ->pluck('place_id');
    }

    /**
     * Get place metadata by ObjectId and search type
     * 
     * @param string $id MongoDB ObjectId or city name
     * @param string $searchType (hotel, restaurant, attraction)
     * @param int $limit
     * @return \Illuminate\Support\Collection
     */
    public static function getPlaceIdsById($id, $searchType, $limit = 20)
    {
        // Try to find by city name first
        $query = self::where('city', $id)
                    ->where('search_type', $searchType);
        
        // If not found and $id looks like an ObjectId, try by _id
        if ($query->count() === 0 && strlen($id) === 24) {
            $query = self::where('_id', $id)
                        ->where('search_type', $searchType);
        }
        
        return $query->limit($limit)
                    ->get()
                    ->pluck('place_id');
    }

    /**
     * Get all metadata for a city
     * 
     * @param string $city
     * @return \Illuminate\Support\Collection
     */
    public static function getAllByCityGrouped($city)
    {
        return self::where('city', $city)
                    ->get()
                    ->groupBy('search_type');
    }

    /**
     * Relationship with Place
     */
    public function place()
    {
        return $this->belongsTo(Place::class, 'place_id', 'place_id');
    }
}

