<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

/**
 * Class ApiTesterService
 * Chứa logic để gọi API bên ngoài dựa trên cấu hình (apiConfig) nhận được từ Filament/Frontend.
 * Đã sửa lỗi Livewire/Framework thêm tham số thừa vào Query String và cải thiện việc lấy giá trị Parameters.
 */
class ApiTesterService
{
    /**
     * Thực hiện một yêu cầu HTTP ra bên ngoài để kiểm tra kết nối và lấy dữ liệu mẫu.
     *
     * @param array $apiConfig Cấu hình API từ Filament Form State (bao gồm baseUrl, method, headers, authType, authConfig, parameters).
     * @return array Kết quả trả về chứa success, status, và body của response.
     */
    public function testConnection(array $apiConfig): array
    {
        $url = (string)($apiConfig['baseUrl'] ?? '');
        $method = strtoupper((string)($apiConfig['method'] ?? 'GET'));
        $headers = (array)($apiConfig['headers'] ?? []);
        $parameterDefs = (array)($apiConfig['parameters'] ?? []);
        $authType = (string)($apiConfig['authType'] ?? 'none');
        $authConfig = (array)($apiConfig['authConfig'] ?? []);
        
        if ($url === '') {
            return ['success' => false, 'status' => 400, 'message' => 'Base URL is required.', 'body' => null];
        }

        // --- 1. CHUẨN HÓA HEADERS VÀ AUTH ---
        $requestHeaders = [];
        
        // Bước 1a: Áp dụng Headers thủ công trước
        foreach ($headers as $h) {
            $key = $h['key'] ?? null;
            $value = $h['value'] ?? null;
            if ($key && $value) {
                $requestHeaders[$key] = $value;
            }
        }

        // Bước 1b: Xử lý Basic Auth
        $basicAuthUser = null;
        $basicAuthPass = null;
        if ($authType === 'basic') {
            $basicAuthUser = (string)($authConfig['username'] ?? '');
            $basicAuthPass = (string)($authConfig['password'] ?? '');
        }

        // Bước 1c: Xử lý Bearer/API Key (GHI ĐÈ Headers thủ công nếu cần)
        if ($authType === 'bearer' && ($token = ($authConfig['token'] ?? null))) {
            $requestHeaders['Authorization'] = 'Bearer ' . $token;
        } elseif ($authType === 'api_key' && ($keyName = ($authConfig['keyName'] ?? null)) && ($keyValue = ($authConfig['keyValue'] ?? null))) {
            $requestHeaders[$keyName] = $keyValue;
        }

        // --- 2. CHUẨN HÓA PARAMETERS (FIXED) ---
        $requestParams = [];
        foreach ($parameterDefs as $def) {
            if (!is_array($def)) { continue; }
            $pname = $def['name'] ?? null;
            $mode = $def['mode'] ?? 'list';
            $testValue = null;

            if (!$pname) { continue; }
            
            // Lấy giá trị mẫu dựa trên mode để test
            switch ($mode) {
                case 'list':
                case 'cartesian':
                    $rawValues = $def['values'] ?? $def['values_cartesian'] ?? null;
                    
                    if (is_string($rawValues)) {
                        // MỚI: Xử lý trường hợp $rawValues là string (từ Textarea)
                        $lines = array_filter(preg_split("/\r\n|\n|\r/", $rawValues));
                        if (count($lines) > 0) {
                            $testValue = $lines[0]; // Lấy dòng đầu tiên
                        }
                    } elseif (is_array($rawValues) && count($rawValues) > 0) {
                        // CŨ: Xử lý trường hợp $rawValues là mảng (từ DB)
                        $testValue = $rawValues[0];
                    }
                    break;

                case 'template':
                    $testValue = $def['template'] ?? null;
                    if ($testValue && Str::contains($testValue, ['{{', '}}'])) {
                        $testValue = 'test_template_value'; // Giả lập giá trị
                    }
                    break;
                
                case 'dynamic':
                    $testValue = 'test_dynamic_value'; 
                    break;
                
                default:
                    break;
            }
            
            if ($testValue !== null && $testValue !== '') {
                $requestParams[$pname] = $testValue;
            }
        }
        // --- KẾT THÚC CHUẨN HÓA PARAMETERS ---

        // --- 3. TÁCH BASE URL và LỌC PARAMETERS LIVEWIRE ---
        $finalUrl = strtok($url, '?');
        
        // --- 4. GỌI HTTP YÊU CẦU ---
        try {
            
            // ============== BẮT ĐẦU SỬA LỖI SSL (Cách 2 - An toàn) ==============
            
            // 1. Xác định đường dẫn đến file certificate
            $caBundlePath = storage_path('app/cacert.pem');

            // 2. Tạo $pendingRequest với tùy chọn 'verify'
            $pendingRequest = Http::withOptions([
                'verify' => $caBundlePath
            ])
            ->timeout(30)
            ->withHeaders($requestHeaders);
            
            // ============== KẾT THÚC SỬA LỖI SSL ==============

            // Chỉ gọi withBasicAuth nếu Basic Auth được chọn
            if ($basicAuthUser !== null) {
                $pendingRequest->withBasicAuth($basicAuthUser, $basicAuthPass);
            }
            
            // Xây dựng tham số Query và JSON
            $queryData = in_array($method, ['GET', 'DELETE']) ? $requestParams : [];
            $jsonData = in_array($method, ['POST', 'PUT', 'PATCH']) ? $requestParams : [];

            $response = $pendingRequest->send($method, $finalUrl, [ // Sử dụng $finalUrl đã được làm sạch
                'query' => $queryData,
                'json' => $jsonData,
            ]);
            
            $status = $response->status();
            $ok = $response->successful();
            $body = $response->body(); 

            if ($response->failed()) {
                $queryString = http_build_query($queryData);
                $debugInfo = " | FINAL URL GỬI ĐI: " . $finalUrl . ($queryString ? ('?' . $queryString) : '');
                $debugInfo .= " | PARAMS ĐÃ GỬI: " . json_encode($queryData);

                return [
                    'success' => false,
                    'status' => $status,
                    'message' => 'API returned error status: ' . $status . (Str::contains($body, 'validation') ? ' (Validation Error)' : '') . $debugInfo, 
                    'body' => $body,
                ];
            }

            return [
                'success' => $ok,
                'status' => $status,
                'statusText' => $response->reason(),
                'message' => 'Connection successful',
                'body' => $body,
            ];

        } catch (\Illuminate\Http\Client\RequestException $e) {
            return [
                'success' => false,
                'status' => $e->response?->status() ?? 500,
                'message' => 'Request failed: ' . $e->getMessage(),
                'body' => $e->response?->body(),
            ];
        } catch (\Throwable $e) {
            // Lỗi "cURL error 60" sẽ bị bắt ở đây nếu 'verify' bị lỗi
            return [
                'success' => false,
                'status' => 500,
                'message' => 'An unexpected error occurred: ' . $e->getMessage(),
                'body' => null,
            ];
        }
    }
}