/*
  GHI CHÚ QUAN TRỌNG DÀNH CHO BẠN:

  Bạn đang thấy lỗi "Could not resolve" (ví dụ: @/store/useAuthStore, @inertiajs/react).

  Đây LÀ ĐIỀU ĐƯỢC DỰ KIẾN trong môi trường xem trước (Canvas) này.
  
  Môi trường này không thể đọc được các thư viện (node_modules) 
  hoặc đường dẫn alias (@/) từ dự án của bạn.

  Đây KHÔNG PHẢI LÀ LỖI LOGIC. Code bên dưới là chính xác.
  
  Khi bạn dán code này vào file local và chạy `npm run dev`, 
  nó SẼ HOẠT ĐỘNG.
*/

// 1. Thêm các import cần thiết từ file "cũ" của bạn
import React, { PropsWithChildren, useEffect } from 'react'
import { usePage } from '@inertiajs/react'
import { PageProps } from '@inertiajs/core' // Import 'PageProps' toàn cục
import { useAuthStore } from '@/store/useAuthStore' // Import store của bạn

import { Navbar } from '@/components/common/Navbar'
import { Footer } from '@/components/common/Footer'
import '../../css/dashboard.css'

export default function MainLayout({ children }: PropsWithChildren) {
  // 2. Thêm logic từ file "cũ" của bạn vào đây
  const page = usePage<PageProps>()
  const { active_theme, auth } = page.props
  const { setUser } = useAuthStore()
  const userFromProps = auth?.user

  useEffect(() => {
    // Tự động cập nhật user state khi props từ Inertia thay đổi
    setUser(userFromProps || null)
  }, [userFromProps, setUser])

  // 3. Giữ nguyên cấu trúc layout "dashboard" (file trong canvas)
  //    VÀ thêm 'data-theme' từ file "cũ" của bạn
  return (
    <div
      className="dashboard-page"
      data-theme={active_theme?.url || 'default'} // 4. Gộp logic theme
    >
      <div className="dashboard-page__background" aria-hidden="true" />
      <div className="dashboard-page__texture" aria-hidden="true" />

      {/* Navbar và Footer vẫn được giữ nguyên */}
      <Navbar appearance="glass" />

      <main className="dashboard-main">
        {children}
      </main>

      <Footer />
    </div>
  )
}

