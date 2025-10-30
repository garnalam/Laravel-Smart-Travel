<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Place extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'places'; // Tên collection trong MongoDB
    protected $primaryKey = '_id'; // Use MongoDB _id as primary key, so 'id' field is queryable

    protected $fillable = [
        'place_id',
        'name',
        'displayName', // Updated field name
        'rating',
        'user_ratings_total',
        'price_level',
        'types',
        'primary_type',
        'primary_type_display_name',
        'location',
        'geo',
        'business_status',
        'opening_hours',
        'current_opening_hours',
        'international_phone_number',
        'address_components',
        'city', // Thành phố
        'country', // Quốc gia
        'avg_price'
    ];

    /**
     * Get places by place IDs
     * 
     * @param array $placeIds
     * @return \Illuminate\Support\Collection
     */
    public static function getByPlaceIds($placeIds)
    {
        if (empty($placeIds)) {
            \Log::warning('getByPlaceIds called with empty placeIds');
            return collect([]);
        }

        \Log::info('Querying places by IDs', [
            'place_ids' => $placeIds,
            'count' => count($placeIds),
        ]);

        // Use raw MongoDB query because Laravel MongoDB has issues with 'id' field
        $results = self::raw(function($collection) use ($placeIds) {
            return $collection->find([
                'id' => ['$in' => $placeIds],
                'rating' => ['$ne' => null]
            ])->toArray();
        });

        // Convert to collection and sort by rating
        $collection = collect($results)->map(function($item) {
            // Convert MongoDB document to array and create model instance
            $attributes = [];
            foreach ($item as $key => $value) {
                if ($value instanceof \MongoDB\BSON\ObjectId) {
                    $attributes[$key] = (string)$value;
                } elseif (is_object($value)) {
                    $attributes[$key] = json_decode(json_encode($value), true);
                } else {
                    $attributes[$key] = $value;
                }
            }
            
            $place = new self();
            $place->setRawAttributes($attributes);
            $place->exists = true;
            return $place;
        })->sortByDesc('rating')->values();

        \Log::info('Places query results', [
            'found' => $collection->count(),
            'sample' => $collection->first() ? [
                'id' => $collection->first()->id,
                'name' => $collection->first()->displayName['text'] ?? $collection->first()->name ?? 'N/A',
                'rating' => $collection->first()->rating,
            ] : null,
        ]);

        return $collection;
    }
    
    public static function getPlaceByIds($placeIds)
    {
        if (empty($placeIds)) {
            \Log::warning('getByPlaceIds called with empty placeIds');
            return collect([]);
        }

        \Log::info('Querying places by IDs', [
            'place_ids' => $placeIds,
            'count' => count($placeIds),
        ]);

        // Use raw MongoDB query because Laravel MongoDB has issues with 'id' field
        $results = self::raw(function($collection) use ($placeIds) {
            return $collection->find([
                'id' => ['$in' => $placeIds],
                'rating' => ['$ne' => null]
            ])->toArray();
        });

        // Convert to collection and sort by rating
        $collection = collect($results)->map(function($item) {
            // Convert MongoDB document to array and create model instance
            $attributes = [];
            foreach ($item as $key => $value) {
                if ($value instanceof \MongoDB\BSON\ObjectId) {
                    $attributes[$key] = (string)$value;
                } elseif (is_object($value)) {
                    $attributes[$key] = json_decode(json_encode($value), true);
                } else {
                    $attributes[$key] = $value;
                }
            }
            
            $place = new self();
            $place->setRawAttributes($attributes);
            $place->exists = true;
            return $place;
        })->sortByDesc('rating')->values();

        \Log::info('Places query results', [
            'found' => $collection->count(),
            'sample' => $collection->first() ? [
                'id' => $collection->first()->id,
                'name' => $collection->first()->displayName['text'] ?? $collection->first()->name ?? 'N/A',
                'rating' => $collection->first()->rating,
            ] : null,
        ]);

        return $collection;
    }

    /**
     * Get restaurants by city (using PlaceMetadata)
     */
    public static function getRestaurants($city, $limit = 20)
    {
        $placeIds = PlaceMetadata::getPlaceIdsByCity($city, 'restaurant', $limit);
        return self::getByPlaceIds($placeIds->toArray());
    }

    /**
     * Get hotels by city (using PlaceMetadata)
     */
    public static function getHotels($city, $limit = 20)
    {
        $placeIds = PlaceMetadata::getPlaceIdsByCity($city, 'hotel', $limit);
        return self::getByPlaceIds($placeIds->toArray());
    }

    /**
     * Get tourist attractions by city (using PlaceMetadata)
     */
    public static function getTouristAttractions($city, $limit = 20)
    {
        $placeIds = PlaceMetadata::getPlaceIdsByCity($city, 'attraction', $limit);
        return self::getByPlaceIds($placeIds->toArray());
    }

    /**
     * Get all places grouped by type
     */
    public static function getAllPlacesByCity($city)
    {
        return [
            'restaurants' => self::getRestaurants($city),
            'hotels' => self::getHotels($city),
            'tourist_attractions' => self::getTouristAttractions($city),
        ];
    }

    /**
     * Relationship with PlaceMetadata
     */
    public function metadata()
    {
        return $this->hasMany(PlaceMetadata::class, 'place_id', 'place_id');
    }
}

