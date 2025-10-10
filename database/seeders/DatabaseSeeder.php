<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Seed world_cities table with sample data
        $this->seedWorldCities();
    }

    /**
     * Seed world_cities table with sample data
     */
    private function seedWorldCities(): void
    {
        // Check if collection exists and has data (MongoDB)
        if (DB::connection('mongodb')->table('world_cities')->count() > 0) {
            $this->command->info('world_cities collection already has data. Skipping seed.');
            return;
        }

        $cities = [];

        DB::connection('mongodb')->table('world_cities')->insert($cities);
        $this->command->info('Seeded world_cities collection with sample data.');
    }
}
