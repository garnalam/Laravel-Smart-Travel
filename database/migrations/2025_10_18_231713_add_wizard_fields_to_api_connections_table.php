<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
// Sửa lại hàm up() như sau:
        public function up(): void
        {
            Schema::table('connections', function (Blueprint $table) {
                // Chỉ cần định nghĩa các cột, không cần ->after()
                $table->json('parameters')->nullable();
                $table->json('data_mapping')->nullable();
                $table->json('schedule_config')->nullable();
            });
        }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('connections', function (Blueprint $table) {
            //
        });
    }
};
