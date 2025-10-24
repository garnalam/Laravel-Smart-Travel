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
    Schema::table('connections', function (Blueprint $table) {
        // Thêm cột JSON mới mà không cần ->after()
        $table->json('apiConfig')->nullable();

        // Xóa các cột riêng lẻ cũ đi
        $table->dropColumn(['base_url', 'endpoint', 'method', 'auth_type', 'auth_config', 'headers']);
    });
}

public function down(): void
{
    Schema::table('connections', function (Blueprint $table) {
        // Làm ngược lại nếu cần rollback
        $table->dropColumn('apiConfig');
        $table->string('base_url')->nullable();
        $table->string('endpoint')->nullable();
        $table->string('method')->default('GET');
        $table->string('auth_type')->default('none');
        $table->json('auth_config')->nullable();
        $table->json('headers')->nullable();
    });
}
};
