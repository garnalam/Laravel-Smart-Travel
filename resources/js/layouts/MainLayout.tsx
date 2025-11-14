// E:\Laravel-Smart-Travel\resources\js\layouts\MainLayout.tsx

import React, { PropsWithChildren, useEffect } from 'react'

import { usePage } from '@inertiajs/react'

import { PageProps } from '@inertiajs/core'

import { useAuthStore } from '@/store/useAuthStore'

import { Navbar } from '@/components/common/Navbar'

import { Footer } from '@/components/common/Footer'

import '../../css/dashboard.css'



export default function MainLayout({ children }: PropsWithChildren) {

  const page = usePage<PageProps>()

  

  // 'auth' là object từ props

  const { active_theme, auth } = page.props 

  const { setUser } = useAuthStore()



  // ===== BẮT ĐẦU DEBUG =====

  // Log ngay khi render để xem props là gì

  console.log('[MainLayout] RENDER. Props.auth.user là:', auth?.user);

  // ===== KẾT THÚC DEBUG =====



  useEffect(() => {

    // ===== BẮT ĐẦU DEBUG =====

    // Log khi effect chạy

    console.log('[MainLayout] USE_EFFECT CHẠY. Props.auth.user là:', auth?.user);

    // ===== KẾT THÚC DEBUG =====



    // Luôn gọi setUser với giá trị mới nhất từ props

    setUser(auth?.user || null)

    

  // ===== THAY ĐỔI QUAN TRỌNG =====

  }, [auth, setUser]) // <-- THAY ĐỔI: Dùng [auth] thay vì [userFromProps]



  return (

    <div

      className="dashboard-page"

      data-theme={active_theme?.url || 'default'}

    >

      <div className="dashboard-page__background" aria-hidden="true" />

      <div className="dashboard-page__texture" aria-hidden="true" />



      <Navbar appearance="glass" />



      <main className="dashboard-main">

        {children}

      </main>



      <Footer />

    </div>

  )

}