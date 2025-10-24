<?php

namespace App\Jobs;

use App\Models\Connection;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels; // <- Không cần trait này nữa
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class RunConnectionJob implements ShouldQueue
{
    // Bỏ trait SerializesModels vì chúng ta không truyền model trực tiếp
    use Dispatchable, InteractsWithQueue, Queueable;

    /**
     * Chỉ lưu ID của connection, không lưu cả object.
     * @var string
     */
    public string $connectionId;

    /**
     * Create a new job instance.
     * Hàm khởi tạo giờ sẽ nhận một chuỗi ID, không phải một object.
     */
    public function __construct(string $connectionId)
    {
        $this->connectionId = $connectionId;
    }

    /**
     * Execute the job.
     */
    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Bước 1: Tìm lại connection
        $connection = Connection::where('connection_id', $this->connectionId)->first();

        if (!$connection) {
            Log::error("RunConnectionJob failed: Could not find Connection with connection_id {$this->connectionId}");
            // Không cần fail() ở đây vì không có record để cập nhật
            return;
        }

        Log::info("Running connection job for: {$connection->name} ({$connection->connectionId})");

        // Bước 2: Lấy cấu hình API (code cũ của bạn đã tốt)
        $apiConfig = $connection->apiConfig ?? []; // Đảm bảo là array nếu null
        $baseUrl = $apiConfig['baseUrl'] ?? null;
        // $endpoint = $apiConfig['endpoint'] ?? ''; // Endpoint thường nằm trong baseUrl hoặc parameters?
        $method = strtolower($apiConfig['method'] ?? 'get');
        $headers = collect($apiConfig['headers'] ?? [])
            ->pluck('value', 'key')
            ->filter() // Loại bỏ các header có key/value rỗng
            ->all();

        // TODO: Xử lý parameters (query, path, body...) nếu cần
        // $parameters = $connection->parameters ?? [];
        // Xây dựng $queryParams, $pathParams, $bodyData từ $parameters...

        if (!$baseUrl) {
            Log::error("Connection {$connection->name} has no base URL defined in apiConfig.");
             // Cập nhật trạng thái thất bại TRƯỚC KHI return
            $connection->update([
                'last_run_at' => now(),
                'last_run_status' => 'failed',
                // Không tăng total_runs nếu cấu hình sai
            ]);
            // Không cần fail() job ở đây, chỉ cần ghi nhận lỗi
            return;
        }

        // $fullUrl = rtrim($baseUrl, '/') . '/' . ltrim($endpoint, '/'); // Ghép URL đúng cách
        $fullUrl = $baseUrl; // Giả sử baseUrl đã bao gồm endpoint

        // Bước 3: Gọi API và cập nhật trạng thái
        $status = 'success'; // Giả định thành công

        try {
            // Tạo request, thêm headers và auth nếu cần
            $request = Http::withHeaders($headers);
            // TODO: Thêm logic Authentication dựa trên $apiConfig['authType'] và $apiConfig['authConfig']
            // Ví dụ: if ($apiConfig['authType'] === 'bearer') { $request->withToken(...); }

            // Thực hiện gọi API
            // TODO: Thêm ->withQueryParameters($queryParams) hoặc ->post($fullUrl, $bodyData) nếu cần
            $response = $request->$method($fullUrl);

            // Kiểm tra kết quả
            if ($response->successful()) {
                Log::info("Connection {$connection->name} ran successfully. Status: " . $response->status());
                // TODO: Xử lý dữ liệu $response->json() nếu cần (lưu vào DB khác, etc.)

            } else {
                // API gọi không thành công (status 4xx, 5xx)
                $status = 'failed';
                Log::error("Connection {$connection->name} API call failed. Status: " . $response->status() . " Body: " . $response->body());
                // Không cần gọi $this->fail() ở đây, chỉ cần ghi nhận status
            }

        } catch (Throwable $e) {
            // Lỗi khi thực hiện request (vd: network error, DNS error)
            $status = 'failed';
            Log::error("Exception running connection {$connection->name}: " . $e->getMessage());
             // Không cần gọi $this->fail($e) ở đây, chỉ cần ghi nhận status
        } finally {
            // Bước 4: Luôn luôn cập nhật CSDL sau khi chạy
            $connection->update([
                'last_run_at' => now(),
                'last_run_status' => $status, // <-- CẬP NHẬT STATUS
                '$inc' => ['total_runs' => 1] // Tăng total_runs lên 1 (dùng $inc của MongoDB)
            ]);

            Log::info("Finished connection job for: {$connection->name} ({$connection->connectionId}) with status: {$status}");
        }
    }
}