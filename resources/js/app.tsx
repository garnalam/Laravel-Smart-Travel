import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

// --- BƯỚC 1: IMPORT STORE VÀ TYPES ---
import { useAuthStore } from './store/useAuthStore'; // Đảm bảo đường dẫn này đúng
import { User } from './types/domain';           // Đảm bảo đường dẫn này đúng

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    
    // --- BƯỚC 2: CẬP NHẬT HÀM SETUP ---
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Lấy user data từ props ban đầu mà Laravel gửi qua
        // Chúng ta ép kiểu nó thành User hoặc null
        const user = props.initialPage.props.auth.user as User | null;

        // "Mớm" (seed) data này vào store ngay lập tức
        // Bằng cách này, store sẽ có data NGAY KHI tải trang
        // và Navbar sẽ đọc được ngay
        useAuthStore.getState().setUser(user);

        // Render ứng dụng React
        root.render(<App {...props} />);
    },
    // --- KẾT THÚC CẬP NHẬT ---

    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();