<?php



namespace App\Models;



// Kế thừa từ Model của MongoDB

use MongoDB\Laravel\Eloquent\Model;



// Các use statement cần thiết khác

use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Support\Str;



// CÁC THAY ĐỔI VÀ BỔ SUNG: Thêm các use statement cho Accessor

use Illuminate\Database\Eloquent\Casts\Attribute;

use DragonCode\Support\Casts\BooleanCast;

use Cron\CronExpression;



class Connection extends Model

{

    use HasFactory;



    protected $connection = 'mongodb';

    protected $collection = 'connections';

    protected $primaryKey = '_id';



    // CÁC THAY ĐỔI VÀ BỔ SUNG: Thêm `last_run_status` vào $fillable

    protected $fillable = [

        'connection_id', 

        'name', 

        'description', 

        'apiConfig',

        'parameters', 

        'data_mapping', 

        'schedule_config',

        'is_active', 

        'last_run_at', 

        'last_run_status', // << THÊM DÒNG NÀY

        'total_runs', 

        'success_rate',

    ];



    protected $casts = [

        // 'apiConfig' => 'array',

        // 'parameters' => 'array',

        // 'data_mapping' => 'array',

        // 'schedule_config' => 'array',

        'is_active' => 'boolean',

        'last_run_at' => 'datetime',

    ];



    /**

     * Tự động tạo UUID cho connection_id khi tạo mới.

     * (Giữ nguyên code cũ của bạn)

     */

    protected static function booted(): void

    {

        static::creating(function (Connection $connection) {



            if (empty($connection->connection_id)) {

                $connection->connection_id = (string) Str::uuid();

            }



        });

    }



    // --- THÊM 2 ACCESSOR MỚI Ở ĐÂY ---



    /**

     * Accessor: Tính toán ngày chạy tiếp theo dựa trên cron expression.

     * Hoạt động tốt với cấu trúc lồng nhau của MongoDB.

     */

    protected function nextRunAt(): Attribute

    {

        return Attribute::make(

            get: function (mixed $value, array $attributes) {

                // Truy cập vào trường lồng nhau 'cronExpression' trong 'schedule_config'

                $cronExpression = $attributes['schedule_config']['cronExpression'] ?? null;

                

                // Kiểm tra nếu schedule không active hoặc không có cron

                if (empty($cronExpression) || !(bool)($attributes['is_active'] ?? false)) {

                    return null;

                }



                try {

                    // Tính toán ngày chạy tiếp theo

                    $cron = new CronExpression($cronExpression);

                    return $cron->getNextRunDate()->format('d/m/Y, g:i:s A');

                } catch (\Exception $e) {

                    // Trường hợp cron expression không hợp lệ

                    return 'Invalid Cron';

                }

            },

        );

    }



    /**

     * Accessor: Helper để lấy màu cho status badge.

     * Hoạt động tốt với MongoDB.

     */

    protected function lastRunStatusColor(): Attribute

    {

        return Attribute::make(

            get: function (mixed $value, array $attributes) {

                $status = $attributes['last_run_status'] ?? 'unknown';



                return match (strtolower($status)) {

                    'success' => 'success',

                    'failed' => 'danger',

                    default => 'secondary',

                };

            },

        );

    }
}

