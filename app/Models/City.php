<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class City extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'world_cities';

    protected $fillable = [
        'id',
        'city',
        'city_ascii',
        'lat',
        'lng',
        'country',
        'iso2',
        'iso3',
        'admin_name',
        'capital',
        'population',
    ];

    /**
     * Get all cities from world_cities table
     */
    public static function getAllCities()
    {
        return self::all();
    }

    /**
     * Search cities by name
     */
    public static function searchCities($searchTerm)
    {
        return self::where('city', 'like', '%' . $searchTerm . '%')
                  ->orWhere('city_ascii', 'like', '%' . $searchTerm . '%')
                  ->orWhere('country', 'like', '%' . $searchTerm . '%')
                  ->get();
    }

    /**
     * Get cities by country
     */
    public static function getCitiesByCountry($country)
    {
        return self::where('country', $country)->get();
    }
}