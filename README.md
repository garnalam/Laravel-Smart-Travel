## Laravel Smart Travel – Installation and Usage Guide

A Laravel 12 + Inertia React + Vite + Tailwind application with Filament Admin, MongoDB support via Laravel Sail, and an optional Python API service for travel itinerary recommendations.

### Highlights
- Inertia + React (optional SSR), Vite, TailwindCSS
- Filament Admin
- Queue worker, PDF generation (barryvdh/laravel-dompdf)
- MongoDB via Docker/Sail (`mongodb/laravel-mongodb`)
- Modular architecture (`nwidart/laravel-modules`)

---

## 1) System Requirements
- PHP >= 8.2
- Composer
- Node.js >= 18 (20+ recommended)
- npm
- Python >= 3.11 and pip (REQUIRED for the Python API)
- Database: MongoDB (via Docker/Sail)

---

## 2) Quick Start (Local, without Docker)
IMPORTANT: The Python API must be installed and running before using the app.
1. Copy and configure environment file
   ```bash
   cp .env.example .env
   ```
   - Update database settings in `.env` (use MongoDB if applicable)

2. Install PHP dependencies
   ```bash
   composer install
   ```

3. Generate app key and run migrations
   ```bash
   php artisan key:generate
   php artisan migrate
   php artisan storage:link
   ```

4. Install frontend dependencies and start Vite
   ```bash
   npm install
   npm run dev
   ```

5. Start Laravel web server (new terminal)
   ```bash
   php artisan serve
   ```

6. (Recommended) Start queue worker (new terminal)
   ```bash
   php artisan queue:listen --tries=1
   ```

App will be available at: `http://127.0.0.1:8000`

---

## 3) Run with Docker (Laravel Sail + MongoDB)
This project includes `compose.yaml` to run Laravel + MongoDB.

1. Ensure Docker Desktop is running (Windows requires WSL2)
2. Copy and adjust environment variables (APP_URL, DB, MongoDB)
   ```bash
   cp .env.example .env
   ```
3. Install dependencies
   ```bash
   composer install
   npm install
   ```
4. Start services
   ```bash
   docker compose up -d
   ```
5. Run migrations and create storage symlink
   ```bash
   docker compose exec laravel.test php artisan migrate
   docker compose exec laravel.test php artisan storage:link
   ```
6. Start Vite dev (if not started automatically)
   - Vite port (`VITE_PORT`, default 5173) is mapped from container to host in `compose.yaml`.
   - You can use Composer scripts (see below) or run:
     ```bash
     docker compose exec laravel.test npm run dev
     ```

Access: `http://localhost` (port 80 mapped by Sail). Vite dev runs on `http://localhost:5173` (default).

---

## 4) Environment configuration (.env)
Common variables:

- App
  - `APP_NAME`, `APP_ENV`, `APP_KEY`, `APP_URL`
- Queue/Cache/Session: defaults are fine or adjust as needed
- MongoDB (Docker/Sail or local)
  - e.g. `MONGODB_HOST`, `MONGODB_PORT=27017`, `MONGODB_DATABASE`, `MONGODB_USERNAME`, `MONGODB_PASSWORD`

Python API integration (Laravel side):
- `PYTHON_API_URL` (default `http://localhost:8000`)
- `PYTHON_API_KEY` (must match Python API `API_KEY`)
- `PYTHON_API_TIMEOUT` (default `300` seconds)

Note: `compose.yaml` defines `mongodb` service (port 27017). Ensure `.env` matches the container settings when using MongoDB.

---

## 5) Development
Run all processes together via Composer:

```bash
composer run dev
```

Or run individually:
- Web server: `php artisan serve`
- Queue: `php artisan queue:listen --tries=1`
- Vite: `npm run dev`

### SSR (optional, for Inertia SSR)
```bash
composer run dev:ssr
```

---

## 6) Production build
1. Build frontend
   ```bash
   npm run build
   ```
2. (Optional) Build SSR
   ```bash
   npm run build:ssr
   ```

Deploy depending on your environment (Nginx/Apache/Containers). Ensure you run `php artisan migrate --force` and proper write permissions for `storage/`.

---

## 7) Useful commands
- Clear config and run tests
  ```bash
  composer test
  ```
- Asset publishing and Filament upgrade are wired via Composer post scripts

### Available scripts
- `composer dev`: run PHP server, queue, and Vite concurrently
- `composer dev:ssr`: adds logs and Inertia SSR
- `npm run dev`: Vite dev
- `npm run build`: build assets
- `npm run build:ssr`: build with SSR
- `npm run lint` / `npm run format` / `npm run types`

---

## 8) Filament Admin
- After running migrations (and seeding if applicable), sign in with an admin account to access the admin panel.
- Default path is usually `/admin` (or as configured in the project).

---

## 9) Python API service (REQUIRED)
This project depends on the Python API to generate itineraries and fetch related data. You must install, configure, and run it before using the app.

Location: `python_api`

### 9.1 Install
```bash
cd python_api
pip install -r requirements.txt
```

### 9.2 Environment (create `python_api/.env`)
Set these variables:

```env
# API server
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# Security
API_KEY=your_secret_api_key   # must match Laravel PYTHON_API_KEY
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:5173

# Gemini AI (required for recommendations)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

# Performance
REQUEST_TIMEOUT=300
MAX_WORKERS=4
```

Then configure Laravel `.env` to point to it:
```env
PYTHON_API_URL=http://localhost:8000
PYTHON_API_KEY=your_secret_api_key
PYTHON_API_TIMEOUT=300
```

### 9.3 Run the API
```bash
python main.py
# or
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Docs available at `http://localhost:8000/docs`. Health check: `http://localhost:8000/health`.

---

## 10) Troubleshooting
- Port in use: change the port or stop the process (Vite 5173, App 8000/80, MongoDB 27017)
- Vite HMR not accessible with Docker: verify `VITE_PORT` in `.env` and port mapping in `compose.yaml`
- Asset issues: rerun `npm run build` or `npm run dev`
- 500/Key missing: ensure `php artisan key:generate` and a valid `.env`
 - Python API 401 Unauthorized: ensure `PYTHON_API_KEY` (Laravel) matches `API_KEY` (Python API)
 - Python API not reachable: check `PYTHON_API_URL`, firewall/ports, and API is running

---

## 11) License
Copyright © 2025
## Laravel Smart Travel – Hướng dẫn cài đặt và sử dụng

Một ứng dụng Laravel 12 + Inertia React + Vite + Tailwind, có trang quản trị Filament, hỗ trợ MongoDB qua Laravel Sail, kèm một dịch vụ Python API (tuỳ chọn) cho gợi ý lịch trình du lịch.

### Tính năng chính
- Inertia + React (SSR tuỳ chọn), Vite, TailwindCSS
- Filament Admin (trang quản trị)
- Queue worker (xử lý nền), PDF (barryvdh/laravel-dompdf)
- MongoDB qua Docker/Sail (tích hợp `mongodb/laravel-mongodb`)
- Hệ thống modules (`nwidart/laravel-modules`)

---

## 1) Yêu cầu hệ thống
- PHP >= 8.2
- Composer
- Node.js >= 18 (khuyến nghị 20+)
- npm
- Database: MongoDB (qua Docker/Sail)
---

## 2) Cài đặt nhanh (Local, không dùng Docker)
1. Sao chép file môi trường và tuỳ chỉnh
   ```bash
   cp .env.example .env
   ```
   - Cập nhật các thông số DB trong `.env` (MySQL/SQLite tuỳ bạn dùng)
   - Nếu dùng MongoDB local, thêm/cập nhật các biến kết nối MongoDB

2. Cài đặt PHP dependencies
   ```bash
   composer install
   ```

3. Tạo key ứng dụng và chạy migrate
   ```bash
   php artisan key:generate
   php artisan migrate
   php artisan storage:link
   ```

4. Cài đặt frontend và chạy phát triển
   ```bash
   npm install
   npm run dev
   ```

5. Chạy web server Laravel (mở terminal khác)
   ```bash
   php artisan serve
   ```

6. (Khuyến nghị) Chạy queue worker (mở terminal khác)
   ```bash
   php artisan queue:listen --tries=1
   ```

Truy cập ứng dụng tại: `http://127.0.0.1:8000`

---

## 3) Chạy bằng Docker (Laravel Sail + MongoDB)
Project đã kèm `compose.yaml` để chạy Laravel + MongoDB.

1. Bật Docker Desktop (Windows cần WSL2)
2. Sao chép môi trường và cấu hình các biến cần thiết (APP_URL, DB, MongoDB)
   ```bash
   cp .env.example .env
   ```
3. Cài đặt dependencies
   ```bash
   composer install
   npm install
   ```
4. Khởi động dịch vụ
   ```bash
   docker compose up -d
   ```
5. Chạy migrate, tạo liên kết storage
   ```bash
   docker compose exec laravel.test php artisan migrate
   docker compose exec laravel.test php artisan storage:link
   ```
6. Chạy Vite dev (nếu chưa tự mở)
   - Vite đã được map port (`VITE_PORT`, mặc định 5173) từ container ra host trong `compose.yaml`.
   - Bạn có thể dùng script tổng hợp trong Composer (xem phần Scripts) hoặc chạy:
     ```bash
     docker compose exec laravel.test npm run dev
     ```

Truy cập: `http://localhost` (port 80 được map bởi Sail). Vite dev chạy trên `http://localhost:5173` (mặc định).

---

## 4) Cấu hình môi trường (.env)
Các biến thường dùng (tuỳ cơ sở dữ liệu bạn chọn):

- App
  - `APP_NAME`, `APP_ENV`, `APP_KEY`, `APP_URL`
- Database (SQL)
  - `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- Queue/Cache/Session: dùng cấu hình mặc định của Laravel hoặc tuỳ chỉnh
- MongoDB (khi dùng Sail/Docker hoặc MongoDB local)
  - Ví dụ: `MONGODB_HOST`, `MONGODB_PORT=27017`, `MONGODB_DATABASE`, `MONGODB_USERNAME`, `MONGODB_PASSWORD`

Lưu ý: `compose.yaml` đã định nghĩa service `mongodb` (port 27017). Nếu dùng MongoDB, đảm bảo các biến `.env` khớp với thông tin container.

---

## 5) Chạy ở chế độ phát triển
Bạn có thể dùng script tích hợp để chạy đồng thời server PHP, queue và Vite:

```bash
composer run dev
```

Hoặc tự chạy từng tiến trình:
- Web server: `php artisan serve`
- Queue: `php artisan queue:listen --tries=1`
- Vite: `npm run dev`

### SSR (tuỳ chọn, nếu cần Inertia SSR)
```bash
composer run dev:ssr
```

---

## 6) Build production
1. Build frontend
   ```bash
   npm run build
   ```
2. (Tuỳ chọn) Build SSR
   ```bash
   npm run build:ssr
   ```

Triển khai production tuỳ môi trường của bạn (Nginx/Apache/Container). Đảm bảo đã chạy `php artisan migrate --force` và cấu hình quyền ghi cho `storage/`.

---

## 7) Lệnh hữu ích
- Dọn cache cấu hình & chạy test
  ```bash
  composer test
  ```
- Publish assets của Laravel (được tự động khi post-update)
- Nâng cấp Filament sau autoload (được cấu hình trong composer scripts)

### Scripts có sẵn
- `composer dev`: chạy đồng thời PHP server, queue, Vite
- `composer dev:ssr`: thêm logs và Inertia SSR
- `npm run dev`: Vite dev
- `npm run build`: build assets
- `npm run build:ssr`: build kèm SSR
- `npm run lint` / `npm run format` / `npm run types`

---

## 8) Trang quản trị Filament
- Sau khi migrate và seed (nếu có), đăng nhập tài khoản admin (tuỳ thuộc dữ liệu của bạn) để truy cập trang quản trị.
- Đường dẫn thường là `/admin` (hoặc tuỳ cấu hình trong project).

---

## 9) Dịch vụ Python API (tuỳ chọn)
Dự án kèm thư mục `python_api` chứa một FastAPI service phục vụ gợi ý lịch trình du lịch.

- Cài đặt và hướng dẫn chi tiết: xem `python_api/README.md`
- Chạy nhanh:
  ```bash
  cd python_api
  pip install -r requirements.txt
  python main.py
  # hoặc: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
  ```

---

## 10) Khắc phục sự cố thường gặp
- Port bị chiếm dụng: đổi port hoặc dừng tiến trình đang dùng port đó (Vite 5173, App 8000/80, MongoDB 27017)
- Không truy cập được Vite HMR khi dùng Docker: kiểm tra biến `VITE_PORT` trong `.env` và mapping port trong `compose.yaml`
- Lỗi asset: chạy lại `npm run build` hoặc `npm run dev`
- 500/Key missing: đảm bảo đã `php artisan key:generate` và `.env` hợp lệ

---

## 11) Bản quyền
Copyright © 2025

B1 : npm install 
B2 : 
- chạy sv backend : php artisan serve
- mở 1 terminal khác chạy sv frontend : npm run dev
B3 : Nếu có lỗi gì liên hệ tớ xử lý 
(Bonus : config database ở config database.php)

