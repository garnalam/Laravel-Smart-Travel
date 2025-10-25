import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
export function Navbar() {
  const { user, logout } = useAuthStore()
  const { currency, language } = useAppStore()
  const [showAuthDropdown, setShowAuthDropdown] = useState(false)

  // Check admin status when authentication state changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      // Only check admin if user is authenticated
      if (!user) {
        return
      }

      try {
        // Call backend directly to avoid Next.js rewrite loop
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/check-admin`, {
          credentials: "include",
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            // Add auth token if available
            ...(user && 'Authorization' in localStorage && {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            })
          }
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log('Admin check result:', data);


      } catch (e) {
        console.error('Admin check failed:', e);
      } finally {
      }
    };

    checkAdminStatus();
  }, [user]) // Re-run when auth state changes
  const handleAuthClick = (mode: 'login' | 'register') => {
    setShowAuthDropdown(false)
  }

  const handleLogout = async () => {
    await logout()
    setShowAuthDropdown(false)
  }

  return (
    <>
      <nav className="navbar py-4 px-6" style={{ backgroundColor: 'rgba(255, 255, 255)' }}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">
              {language === 'vi' ? 'Việt Nam - Du Lịch Cá Nhân' : 'Vietnam - Personalized Travel'}
            </h1>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <a href="#" className="font-medium text-gray-700 hover:text-blue-600 transition duration-300">
              {language === 'vi' ? 'Trang chủ' : 'Home'}
            </a>
            <a href="#tours" className="font-medium text-gray-700 hover:text-blue-600 transition duration-300">
              {language === 'vi' ? 'Tour' : 'Tours'}
            </a>

            <a href="#contact" className="font-medium text-gray-700 hover:text-blue-600 transition duration-300">
              {language === 'vi' ? 'Liên hệ' : 'Contact'}
            </a>

            <div className="auth-dropdown">
              <button
                onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                className="font-medium text-gray-700 hover:text-blue-600 transition duration-300 flex items-center">
                <span>{user?.name}</span>
                <i className="fas fa-chevron-down ml-1 text-xs"></i>
              </button>
              <div className={`auth-dropdown-content ${showAuthDropdown ? 'active' : ''}`}>
                <a href="/profile">
                  {language === 'vi' ? 'Hồ sơ' : 'Profile'}
                </a>
                <button onClick={handleLogout} className="w-full text-left p-2 hover:bg-gray-200 rounded-md">
                  {language === 'vi' ? 'Đăng xuất' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
