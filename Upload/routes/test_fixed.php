<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Models\User;

// Test MongoDB connection route
Route::get('/test-db', function() {
    try {
        // Test 1: Basic connection
        $connection = DB::connection('mongodb');
        $database = $connection->getMongoDB();
        
        // Test 2: List collections
        $collections = iterator_to_array($database->listCollections());
        $collectionNames = array_map(function($collection) {
            return $collection->getName();
        }, $collections);
        
        // Test 3: Try to count users using Laravel MongoDB syntax
        $userCount = User::count();
        
        // Test 4: Try a simple query using correct Laravel MongoDB syntax
        $testQuery = DB::connection('mongodb')->table('users')->count();
        
        return response()->json([
            'status' => 'success',
            'message' => 'MongoDB connection successful!',
            'database_name' => $database->getDatabaseName(),
            'collections' => $collectionNames,
            'user_count_via_model' => $userCount,
            'user_count_via_query' => $testQuery,
            'connection_info' => [
                'driver' => config('database.connections.mongodb.driver'),
                'database' => config('database.connections.mongodb.database'),
                'dsn_configured' => !empty(config('database.connections.mongodb.dsn'))
            ]
        ]);
        
    } catch (\MongoDB\Driver\Exception\AuthenticationException $e) {
        return response()->json([
            'status' => 'authentication_error',
            'message' => 'MongoDB authentication failed',
            'error' => $e->getMessage(),
            'suggestions' => [
                '1. Check username/password in .env file',
                '2. Verify user exists in MongoDB Atlas',
                '3. Check user permissions for database access',
                '4. Ensure IP whitelist includes your current IP'
            ]
        ], 500);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'connection_error',
            'message' => 'MongoDB connection failed',
            'error' => $e->getMessage(),
            'error_type' => get_class($e)
        ], 500);
    }
});

// Test simple database operations
Route::get('/test-db-simple', function() {
    try {
        // Just try to get MongoDB instance without any queries
        $connection = DB::connection('mongodb');
        $mongodb = $connection->getMongoDB();
        
        return response()->json([
            'status' => 'basic_connection_ok',
            'database_name' => $mongodb->getDatabaseName(),
            'message' => 'Basic MongoDB connection established'
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'basic_connection_failed',
            'error' => $e->getMessage(),
            'error_type' => get_class($e)
        ], 500);
    }
});