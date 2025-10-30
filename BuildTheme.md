### **Bước 1: Tạo Module Mới**

Sử dụng lệnh artisan của nwidart/laravel-modules để khởi tạo cấu trúc thư mục cho theme mới.

**Ví dụ:**

php artisan module:make SummerTheme

### **Bước 2: Tùy biến Giao diện**

Thực hiện các chỉnh sửa về giao diện (CSS, JS, hình ảnh...) trong thư mục resources/assets của module vừa tạo.

* **Đường dẫn:** Modules/SummerTheme/resources/assets/

### **Bước 3: Cấu hình Vite Build cho Theme**

Mở file vite.config.js trong thư mục gốc của module (Modules/SummerTheme/vite.config.js) và cập nhật hoặc thay thế khối build: {} để đảm bảo assets được biên dịch ra một thư mục riêng trong public.

build: {  
    // Sửa dòng này, tên thư mục phải là duy nhất cho mỗi theme  
    outDir: '../../public/build-summertheme',  
    emptyOutDir: true,  
    manifest: true,  
    rollupOptions: {  
        output: {  
            entryFileNames: \`assets/\[name\].js\`,  
            chunkFileNames: \`assets/\[name\].js\`,  
            assetFileNames: \`assets/\[name\].\[ext\]\`  
        }  
    }  
},

### **Bước 4: Biên dịch Assets (Build)**

Mở terminal, di chuyển vào thư mục của module và chạy các lệnh để cài đặt dependencies và biên dịch assets.

\# Di chuyển vào thư mục module  
cd Modules/SummerTheme

\# Cài đặt các gói cần thiết  
npm install

\# Chạy lệnh build  
npm run build

Sau khi hoàn tất, bạn sẽ thấy một thư mục mới public/build-summertheme chứa các file app.js và app.css đã được tối ưu.

### **Bước 5: Đóng gói Theme**

Sử dụng lệnh Artisan tùy chỉnh mà bạn đã tạo (theme:pack) để đóng gói theme thành một file zip.

php artisan theme:pack SummerTheme

Lệnh này sẽ tạo ra một file SummerTheme.zip trong thư mục storage/app.

### **Bước 6: Cài đặt và Kích hoạt Theme**

1. Truy cập vào trang quản trị của website (ví dụ: http://localhost:8000/admin).  
2. Tìm đến chức năng "Quản lý Giao diện" (Appearance) hoặc "Tải lên Theme" (Upload Theme).  
3. Tải lên file SummerTheme.zip mà bạn vừa tạo ở bước 5\.  
4. Sau khi tải lên thành công, tìm theme "SummerTheme" trong danh sách và nhấn "Kích hoạt" (Activate).

### **Bước 7: Xử lý sự cố (Nếu theme không hiển thị)**

Do cơ chế cache của Laravel, đôi khi thay đổi không được áp dụng ngay lập tức. Nếu bạn không thấy giao diện mới sau khi kích hoạt, hãy làm theo cách sau:

1. Mở một cửa sổ terminal mới.  
2. Di chuyển vào thư mục gốc của dự án Laravel.  
3. Chạy lệnh sau để xóa cache cấu hình:  
   php artisan config:clear

4. Quay lại trình duyệt và tải lại trang (F5) một hoặc hai lần. Giao diện mới sẽ được hiển thị.