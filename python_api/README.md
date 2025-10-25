# Smart Travel Recommendation API - Python Service

API service sử dụng FastAPI và Gemini AI để tạo lịch trình du lịch thông minh.

## 🚀 Cài đặt và Chạy Local

### 1. Cài đặt Dependencies

```bash
cd python_api
pip install -r requirements.txt
```

### 2. Cấu hình Environment Variables

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin của bạn:

```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# Gemini AI (BẮT BUỘC)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Security
API_KEY=your_secret_api_key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Performance
REQUEST_TIMEOUT=300
MAX_WORKERS=4
```

### 3. Chạy Server Local

```bash
python main.py
```

Hoặc sử dụng uvicorn trực tiếp:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

API sẽ chạy tại: `http://localhost:8000`

Documentation: `http://localhost:8000/docs`

---

## 🖥️ Deploy lên Server Production

### A. Cấu hình Port trên Server

#### 1. **Sử dụng Port Mặc định (8000)**

Trong file `.env`:
```env
API_PORT=8000
```

Chạy:
```bash
python main.py
```

#### 2. **Thay đổi Port (ví dụ: 8080, 5000, 3001)**

Trong file `.env`:
```env
API_PORT=8080
```

Hoặc chỉ định trực tiếp khi chạy:
```bash
uvicorn main:app --host 0.0.0.0 --port 8080
```

#### 3. **Sử dụng Port 80 (HTTP) hoặc 443 (HTTPS)**

⚠️ **Lưu ý**: Cần quyền root để bind port < 1024

**Option 1: Chạy với sudo**
```bash
sudo API_PORT=80 python main.py
```

**Option 2: Sử dụng Nginx làm Reverse Proxy** (Khuyến nghị)

### B. Deploy với Nginx Reverse Proxy (Khuyến nghị)

#### 1. Cài đặt Nginx

```bash
sudo apt update
sudo apt install nginx
```

#### 2. Cấu hình Nginx

Tạo file cấu hình: `/etc/nginx/sites-available/travel-api`

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Hoặc IP của bạn

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 3. Kích hoạt cấu hình

```bash
sudo ln -s /etc/nginx/sites-available/travel-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. Cấu hình SSL với Let's Encrypt (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Sau khi cài đặt SSL, Nginx config sẽ tự động được cập nhật:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### C. Chạy như Service với Systemd (Khuyến nghị)

#### 1. Tạo file service: `/etc/systemd/system/travel-api.service`

```ini
[Unit]
Description=Smart Travel API Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/your/Laravel-Smart-Travel/python_api
Environment="PATH=/usr/bin:/usr/local/bin"
EnvironmentFile=/path/to/your/Laravel-Smart-Travel/python_api/.env
ExecStart=/usr/bin/python3 /path/to/your/Laravel-Smart-Travel/python_api/main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Lưu ý**: Thay đổi đường dẫn phù hợp với server của bạn.

#### 2. Kích hoạt và chạy service

```bash
sudo systemctl daemon-reload
sudo systemctl enable travel-api
sudo systemctl start travel-api
sudo systemctl status travel-api
```

#### 3. Quản lý service

```bash
# Xem logs
sudo journalctl -u travel-api -f

# Restart service
sudo systemctl restart travel-api

# Stop service
sudo systemctl stop travel-api

# Kiểm tra status
sudo systemctl status travel-api
```

### D. Deploy với Docker (Tuỳ chọn)

#### 1. Tạo `Dockerfile` trong thư mục `python_api`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["python", "main.py"]
```

#### 2. Tạo `docker-compose.yml` trong thư mục `python_api`

```yaml
version: '3.8'

services:
  travel-api:
    build: .
    ports:
      - "8000:8000"  # host_port:container_port
    env_file:
      - .env
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
    networks:
      - travel-network

networks:
  travel-network:
    driver: bridge
```

#### 3. Chạy với Docker

```bash
# Build và chạy
docker-compose up -d

# Xem logs
docker-compose logs -f

# Stop
docker-compose down

# Rebuild
docker-compose up -d --build
```

#### 4. Thay đổi Port với Docker

Chỉnh sửa `ports` trong `docker-compose.yml`:

```yaml
ports:
  - "8080:8000"  # API sẽ chạy trên port 8080 của host
```

Hoặc sử dụng biến môi trường:

```yaml
ports:
  - "${API_PORT:-8000}:8000"
```

Trong file `.env`:
```env
API_PORT=8080
```

---

## 🔧 Cấu hình Port cho các Môi trường khác nhau

### Development
```env
API_HOST=127.0.0.1
API_PORT=8000
DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

### Staging
```env
API_HOST=0.0.0.0
API_PORT=8001
DEBUG=False
ALLOWED_ORIGINS=https://staging.yourdomain.com
API_KEY=your_staging_api_key
```

### Production
```env
API_HOST=127.0.0.1  # Chỉ cho phép local nếu dùng Nginx
API_PORT=8000
DEBUG=False
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
API_KEY=your_production_api_key_very_strong
```

---

## 🔒 Bảo mật

### 1. Firewall Configuration

Chỉ mở port cần thiết:

```bash
# Nếu dùng Nginx (chỉ mở port 80/443)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Nếu chạy trực tiếp Python API (mở port API)
sudo ufw allow 8000/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 2. API Key Authentication

Luôn đặt `API_KEY` mạnh trong production:

```env
API_KEY=your-very-strong-random-api-key-here-min-32-chars
```

Gửi API key trong header khi gọi API:

```bash
curl -H "X-API-Key: your-api-key" http://localhost:8000/api/recommendations
```

### 3. CORS Configuration

Chỉ cho phép origins cần thiết:

```env
# Development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 4. SSL/TLS Configuration

Luôn sử dụng HTTPS trong production với Let's Encrypt (miễn phí) hoặc SSL certificate khác.

---

## 📊 Monitoring và Logs

### Xem logs realtime

```bash
# Nếu chạy với systemd
sudo journalctl -u travel-api -f

# Xem 100 dòng cuối
sudo journalctl -u travel-api -n 100

# Xem logs theo thời gian
sudo journalctl -u travel-api --since "1 hour ago"

# Nếu chạy với Docker
docker-compose logs -f travel-api

# Nếu chạy trực tiếp
tail -f /path/to/logs/api.log
```

### Check API Health

```bash
# Local
curl http://localhost:8000/health

# Remote
curl https://your-domain.com/health

# With API key
curl -H "X-API-Key: your-key" http://localhost:8000/health
```

Response mẫu:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-10-25T10:30:00",
  "gemini_ai": {
    "configured": true
  },
  "message": "API is running. Database not required - all data provided by Laravel."
}
```

---

## 🐛 Troubleshooting

### Port đã được sử dụng

```bash
# Kiểm tra port đang được sử dụng bởi process nào
sudo lsof -i :8000

# Hoặc trên Windows
netstat -ano | findstr :8000

# Trên Linux
sudo netstat -tuln | grep 8000

# Kill process trên Linux
sudo kill -9 <PID>

# Kill process trên Windows
taskkill /PID <PID> /F
```

### Không thể bind port < 1024

**Giải pháp:**
1. **Sử dụng Nginx reverse proxy** (Khuyến nghị)
2. Chạy với sudo (Không khuyến nghị cho production)
3. Sử dụng authbind:
   ```bash
   sudo apt install authbind
   sudo touch /etc/authbind/byport/80
   sudo chmod 500 /etc/authbind/byport/80
   sudo chown www-data /etc/authbind/byport/80
   authbind --deep python main.py
   ```

### API không thể kết nối từ bên ngoài

1. **Kiểm tra firewall**:
   ```bash
   sudo ufw status
   ```

2. **Kiểm tra API đang chạy**:
   ```bash
   sudo systemctl status travel-api
   ```

3. **Kiểm tra logs**:
   ```bash
   sudo journalctl -u travel-api -n 50
   ```

4. **Kiểm tra port đang listen**:
   ```bash
   sudo netstat -tuln | grep 8000
   ```

5. **Kiểm tra host binding** trong `.env`:
   ```env
   API_HOST=0.0.0.0  # Không phải 127.0.0.1
   ```

### Gemini API Key không hoạt động

1. Kiểm tra API key trong file `.env`
2. Tạo key mới tại: https://makersuite.google.com/app/apikey
3. Kiểm tra quota và limits
4. Test với curl:
   ```bash
   curl "https://generativelanguage.googleapis.com/v1/models?key=YOUR_API_KEY"
   ```

### Service không tự động khởi động sau khi reboot

```bash
# Enable service
sudo systemctl enable travel-api

# Kiểm tra
sudo systemctl is-enabled travel-api
```

---

## 📞 API Endpoints

### Public Endpoints

- **Root**: `GET /`
  - Thông tin cơ bản về API

- **Health Check**: `GET /health`
  - Kiểm tra trạng thái API

- **API Documentation**: `GET /docs`
  - Swagger UI interactive documentation

- **ReDoc**: `GET /redoc`
  - Alternative API documentation

### Protected Endpoints (Require API Key)

- **Generate Recommendations**: `POST /api/recommendations`
  - Tạo lịch trình du lịch thông minh
  - Header: `X-API-Key: your_api_key`
  - Body: JSON với travel preferences

**Example Request:**

```bash
curl -X POST "http://localhost:8000/api/recommendations" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "user_id": "user123",
    "city_name": "Da Nang",
    "duration_days": 3,
    "guest_count": 2,
    "target_budget": 5000000,
    "activities": [...],
    "restaurants": [...],
    "hotels": [...]
  }'
```

---

## 🚀 Performance Tuning

### 1. Số lượng Workers

Trong file `.env`:
```env
MAX_WORKERS=4  # Tăng lên nếu có nhiều CPU cores
```

Hoặc chạy với uvicorn:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 2. Timeout Configuration

```env
REQUEST_TIMEOUT=300  # 5 phút cho các request phức tạp
```

### 3. Nginx Caching (Optional)

Thêm vào nginx config:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;

location /api {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_methods GET HEAD;
    # ... other proxy settings
}
```

### 4. Load Balancing với Multiple Instances

Chạy nhiều instance trên các port khác nhau và dùng Nginx load balancing:

```nginx
upstream travel_api_backend {
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}

server {
    listen 80;
    location / {
        proxy_pass http://travel_api_backend;
    }
}
```

---

## 💡 Best Practices

1. **Môi trường Production**: 
   - ✅ Sử dụng Nginx reverse proxy
   - ✅ Enable SSL/HTTPS
   - ✅ Set DEBUG=False
   - ✅ Sử dụng API Key authentication
   - ✅ Giới hạn ALLOWED_ORIGINS

2. **Process Management**:
   - ✅ Sử dụng systemd hoặc Docker
   - ✅ Enable auto-restart on failure
   - ✅ Setup log rotation

3. **Security**:
   - ✅ Không expose port trực tiếp ra internet
   - ✅ Sử dụng firewall
   - ✅ Keep dependencies updated
   - ✅ Regular security audits

4. **Monitoring**:
   - ✅ Setup health check monitoring
   - ✅ Log aggregation và analysis
   - ✅ Alert on failures
   - ✅ Monitor resource usage (CPU, RAM, Disk)

5. **Backup**:
   - ✅ Backup file `.env` securely
   - ✅ Backup nginx configuration
   - ✅ Version control codebase
   - ✅ Document deployment process

---

## 🔄 Update và Deployment

### Update Code

```bash
# Pull latest code
git pull origin main

# Restart service
sudo systemctl restart travel-api

# Hoặc với Docker
docker-compose down
docker-compose up -d --build
```

### Zero-Downtime Deployment

Sử dụng Blue-Green deployment hoặc Rolling deployment với load balancer.

---

## 📋 Checklist Deploy Production

- [ ] Đã tạo file `.env` với thông tin production
- [ ] Đã set GEMINI_API_KEY
- [ ] Đã set API_KEY mạnh
- [ ] Đã cấu hình ALLOWED_ORIGINS đúng
- [ ] Đã cài đặt Nginx
- [ ] Đã cấu hình Nginx reverse proxy
- [ ] Đã setup SSL/HTTPS với Let's Encrypt
- [ ] Đã tạo systemd service
- [ ] Đã enable service auto-start
- [ ] Đã cấu hình firewall
- [ ] Đã test health check endpoint
- [ ] Đã test API functionality
- [ ] Đã setup monitoring và logging
- [ ] Đã backup configuration files

---

## 📚 Tài liệu tham khảo

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Uvicorn Deployment](https://www.uvicorn.org/deployment/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Systemd Service](https://www.freedesktop.org/software/systemd/man/systemd.service.html)
- [Let's Encrypt](https://letsencrypt.org/)
- [Gemini AI Documentation](https://ai.google.dev/docs)

---

## 📧 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs: `sudo journalctl -u travel-api -n 100`
2. Kiểm tra health endpoint: `curl http://localhost:8000/health`
3. Xem API docs: `http://localhost:8000/docs`

---

## 📝 License

Copyright © 2025 Smart Travel Team

