<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // THAY ĐỔI TẠI ĐÂY
        Schema::create('connections', function (Blueprint $table) {
            $table->id();
            $table->uuid('connection_id')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('base_url');
            $table->string('endpoint')->nullable();
            $table->string('method')->default('GET');
            $table->string('auth_type')->default('none');
            $table->json('auth_config')->nullable();
            $table->json('headers')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_run_at')->nullable();
            $table->unsignedInteger('total_runs')->default(0);
            $table->unsignedTinyInteger('success_rate')->default(100);
            $table->timestamps();
        });
    }

    public function down(): void
    {
         // THAY ĐỔI TẠI ĐÂY
        Schema::dropIfExists('connections');
    }
};