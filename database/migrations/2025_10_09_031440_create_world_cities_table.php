<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('world_cities', function (Blueprint $table) {
            $table->bigInteger('id')->primary();
            $table->string('city', 255);
            $table->string('city_ascii', 255)->nullable();
            $table->decimal('lat', 10, 8)->nullable();
            $table->decimal('lng', 11, 8)->nullable();
            $table->string('country', 255);
            $table->string('iso2', 10)->nullable();
            $table->string('iso3', 10)->nullable();
            $table->string('admin_name', 255)->nullable();
            $table->string('capital', 50)->nullable();
            $table->bigInteger('population')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('world_cities');
    }
};
