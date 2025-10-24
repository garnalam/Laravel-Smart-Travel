// File: Modules/WinterTheme/resources/assets/js/app.js

// Yêu cầu Vite biên dịch file SCSS
import '../sass/app.scss';

document.addEventListener('DOMContentLoaded', function() {
    function createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.innerHTML = '❄'; // Ký tự bông tuyết
        snowflake.classList.add('snowflake');

        // Vị trí và thuộc tính ngẫu nhiên
        snowflake.style.left = Math.random() * window.innerWidth + 'px';
        snowflake.style.animationDuration = (Math.random() * 5 + 5) + 's'; // Rơi từ 5-10 giây
        snowflake.style.opacity = Math.random();
        snowflake.style.fontSize = (Math.random() * 10 + 10) + 'px'; // Kích thước từ 10-20px
        snowflake.style.animationDelay = (Math.random() * 5) + 's'; // Xuất hiện ngẫu nhiên

        document.body.appendChild(snowflake);

        // Xóa bông tuyết sau khi nó rơi xong để tiết kiệm bộ nhớ
        setTimeout(() => {
            snowflake.remove();
        }, 10000); // 10 giây
    }

    // Tạo một bông tuyết mới mỗi 300ms
    setInterval(createSnowflake, 300);
});

console.log('WinterTheme JS Loaded!');