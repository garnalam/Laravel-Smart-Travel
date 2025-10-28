import { User } from '@/types/domain'; // Import kiểu User của bạn

// Định nghĩa các props được chia sẻ từ HandleInertiaRequests.php
interface SharedPageProps {
  auth: {
    user: (User & { is_admin: boolean }) | null; // <-- CẬP NHẬT DÒNG NÀY
  };
  name: string;
  quote: {
    message: string;
    author: string;
  };
  sidebarOpen: boolean;
  translations: Record<string, string>; // Dạng { key: value }
  active_theme: {
    url: string;
  } | null;
}

// Bổ sung module của Inertia
declare module '@inertiajs/core' {
  // Mở rộng interface PageProps mặc định
  export interface PageProps extends SharedPageProps {
    // errors: Errors & ErrorBag; // 'errors' đã được tự động bao gồm
  }
}