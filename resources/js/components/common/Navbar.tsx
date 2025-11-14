import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { router } from '@inertiajs/react'

interface NavbarProps {
  appearance?: 'glass' | 'solid'
}

export function Navbar({ appearance = 'solid' }: NavbarProps) {
  const { user } = useAuthStore()
  console.log('[Navbar] Đang render với user từ store:', user);
  const { language } = useAppStore()
  const [showAuthDropdown, setShowAuthDropdown] = useState(false)

  const containerClasses = useMemo(() => {
    if (appearance === 'glass') {
      return 'navbar glass'
    }
    return 'navbar solid'
  }, [appearance])

  useEffect(() => {
    if (!showAuthDropdown) {
      return
    }
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.auth-dropdown')) {
        setShowAuthDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showAuthDropdown])

  const handleLogout = () => {
    router.post('/logout')
    setShowAuthDropdown(false)
  }

  return (
    <header className="navbar-wrapper">
      <nav className={containerClasses}>
        <div className="navbar__inner">
          <a className="navbar__brand" href="/">
            <span className="navbar__brand-tag">{language === 'vi' ? 'VietJourney' : 'VietJourney'}</span>
            <span className="navbar__brand-title">
              {language === 'vi'
                ? 'Bản đồ trải nghiệm Việt Nam'
                : 'Mapping Vietnam experiences'}
            </span>
          </a>

          <div className="navbar__links">
            <a href="/" className="navbar__link">
              {language === 'vi' ? 'Trang chủ' : 'Home'}
            </a>
            
            {user && (
              <>
                <a href="#dashboard-search" className="navbar__link">
                  {language === 'vi' ? 'Tùy chỉnh' : 'Personalize'}
                </a>
                <a href="#dashboard-featured" className="navbar__link">
                  {language === 'vi' ? 'Tour nổi bật' : 'Highlights'}
                </a>
              </>
            )}

            <a href="#contact" className="navbar__link">
              {language === 'vi' ? 'Liên hệ' : 'Contact'}
            </a>
          </div>

          <div className="navbar__actions">
            {user ? (
              // Logic khi đã đăng nhập (user = true)
              <div className="auth-dropdown">
                <button
                  onClick={() => setShowAuthDropdown((prev) => !prev)}
                  className="navbar__user"
                >
                  <span className="navbar__user-avatar" aria-hidden="true">
                    {user.name?.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="navbar__user-name">{user.name}</span>
                  <i className={`fas fa-chevron-${showAuthDropdown ? 'up' : 'down'} text-xs`} aria-hidden="true" />
                  <span className="sr-only">
                    {language === 'vi' ? 'Mở menu tài khoản' : 'Open account menu'}
                  </span>
                </button>
                
                {/* ===== BẮT ĐẦU THAY ĐỔI ===== */}
                <div className={`auth-dropdown-content ${showAuthDropdown ? 'active' : ''}`}>
                  
                  {/* Chỉ hiển thị link này nếu user.is_admin là true */}
                  {user.is_admin && (
                    <a href="/admin"> {/* <-- Đổi route '/admin' nếu cần */}
                      {language === 'vi' ? 'Trang Admin' : 'Admin Panel'}
                    </a>
                  )}

                  {user.is_admin && (
                    <a href="http://113.178.51.217:8111/"> {/* <-- Đổi route '/admin' nếu cần */}
                      {language === 'vi' ? 'Data Platform' : 'Data Platform'}
                    </a>
                  )}

                  {/* Nút Đăng xuất luôn hiển thị */}
                  <button onClick={handleLogout} className="auth-dropdown__logout">
                    {language === 'vi' ? 'Đăng xuất' : 'Logout'}
                  </button>
                </div>
                {/* ===== KẾT THÚC THAY ĐỔI ===== */}

              </div>
            ) : (
              // Logic khi chưa đăng nhập (user = false)
              <div className="navbar__auth">
                <a href="/login" className="navbar__auth-link">
                  {language === 'vi' ? 'Đăng nhập' : 'Login'}
                </a>
                <a href="/register" className="navbar__auth-button">
                  {language === 'vi' ? 'Bắt đầu' : 'Get started'}
                </a>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}