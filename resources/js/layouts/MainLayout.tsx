// File: resources/js/Layouts/MainLayout.tsx

import React, { PropsWithChildren, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

// 1. SỬA LỖI: Import 'PageProps' từ '@inertiajs/core'
// File 'inertia.d.ts' của bạn đã tự động "thêm" (augment) type này
import { PageProps } from '@inertiajs/core'; 

import { useAuthStore } from '@/store/useAuthStore';
import { Navbar } from '@/components/common/Navbar'; 

// 2. Xóa tất cả interface 'SharedProps' hoặc import 'User',
// vì 'PageProps' từ '@inertiajs/core' đã chứa tất cả

export default function MainLayout({ children }: PropsWithChildren) {
    
    // 3. Giờ đây 'usePage<PageProps>()' sẽ hoạt động
    // và 'props' sẽ có đầy đủ các type từ file .d.ts của bạn
    const { active_theme, auth } = usePage<PageProps>().props;
    
    const { setUser } = useAuthStore();
    
    // 4. LƯU Ý QUAN TRỌNG:
    // Dùng 'auth?.user' (optional chaining) để tránh lỗi nếu 'auth' là null
    const userFromProps = auth?.user; 

    useEffect(() => {
        // Truyền 'userFromProps || null' để đảm bảo
        // 'undefined' (từ auth?.user) sẽ trở thành 'null'
        setUser(userFromProps || null); 
    }, [userFromProps, setUser]);

    return (
        // 5. LƯU Ý QUAN TRỌNG:
        // 'active_theme' là object, nên chúng ta cần '.url'
        <div data-theme={active_theme?.url || 'default'}> 
            <div className="themeable-container">
                
                <Navbar appearance="solid" /> 

                <aside className="themeable-sidebar">
                    <h2>Sidebar</h2>
                    <ul>
                        <li>Menu Item 1</li>
                        <li>Menu Item 2</li>
                    </ul>
                </aside>
                <main className="themeable-content">
                    {children}
                </main>
                <footer className="themeable-footer">
                    <p>Đây là Footer Cố Định</p>
                </footer>
            </div>
        </div>
    );
}