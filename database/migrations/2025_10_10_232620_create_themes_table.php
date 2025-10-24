    <?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration
    {
        public function up(): void
        {
            Schema::create('themes', function (Blueprint $table) {
                $table->id();
                $table->string('name'); // Tên giao diện, ví dụ: "Giao diện Công ty A"
                $table->boolean('is_active')->default(false); // Đánh dấu giao diện đang được sử dụng
                $table->json('colors'); // Lưu các mã màu dưới dạng JSON
                $table->timestamps();
            });
        }

        public function down(): void
        {
            Schema::dropIfExists('themes');
        }
    };