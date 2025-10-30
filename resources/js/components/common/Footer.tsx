
import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/Button_dashboard'
import { Input } from '@/components/ui/Input_dashboard'
import { useToast } from '@/hooks/useToast'

export function Footer() {
  const { language } = useAppStore()
  const { success, error } = useToast()
  
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      error(language === 'vi' ? 'Vui lòng nhập email' : 'Please enter your email')
      return
    }

    setIsSubscribing(true)

    try {
      success(language === 'vi' ? 'Đăng ký thành công!' : 'Successfully subscribed!')
      setEmail('')
    } catch (err) {
      error(language === 'vi' ? 'Có lỗi xảy ra khi đăng ký' : 'An error occurred during subscription')
      console.error('Newsletter subscription error:', err)
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <footer id="contact" className="dashboard-footer">
      <div className="dashboard-footer__background" aria-hidden="true" />
      <div className="dashboard-footer__inner">
        <div className="dashboard-footer__grid">
          <div className="dashboard-footer__column">
            <span className="dashboard-footer__tag">
              {language === 'vi' ? 'VietJourney' : 'VietJourney'}
            </span>
            <h3>
              {language === 'vi'
                ? 'Kết nối và khám phá Việt Nam theo cách của bạn.'
                : 'Connect and discover Vietnam, your way.'}
            </h3>
            <p>
              {language === 'vi'
                ? 'Tòa nhà E3, 144 Xuân Thủy, Cầu Giấy, Hà Nội, Việt Nam.'
                : 'E3 Building, 144 Xuan Thuy Street, Cau Giay District, Ha Noi, Vietnam.'}
            </p>
            <a href="mailto:hi@travelrecommender.com" className="dashboard-footer__link">
              hi@travelrecommender.com
            </a>
          </div>

          <div className="dashboard-footer__column">
            <h4>{language === 'vi' ? 'Nền tảng' : 'Platform'}</h4>
            <ul>
              <li>
                <a href="#dashboard-search" className="dashboard-footer__link">
                  {language === 'vi' ? 'Trải nghiệm cá nhân hóa' : 'Tailored experiences'}
                </a>
              </li>
              <li>
                <a href="#dashboard-featured" className="dashboard-footer__link">
                  {language === 'vi' ? 'Tour nổi bật' : 'Featured journeys'}
                </a>
              </li>
            </ul>
          </div>

          <div className="dashboard-footer__column">
            <h4>{language === 'vi' ? 'Hỗ trợ' : 'Support'}</h4>
            <ul>
              <li>
                <a href="#" className="dashboard-footer__link">
                  {language === 'vi' ? 'Trung tâm trợ giúp' : 'Help center'}
                </a>
              </li>
              <li>
                <a href="#" className="dashboard-footer__link">
                  {language === 'vi' ? 'Điều khoản & riêng tư' : 'Terms & privacy'}
                </a>
              </li>
            </ul>
          </div>

          <div className="dashboard-footer__column">
            <h4>{language === 'vi' ? 'Nhận bản tin' : 'Stay inspired'}</h4>
            <p>
              {language === 'vi'
                ? 'Nhận khoảnh khắc du lịch được cá nhân hóa mỗi tuần.'
                : 'Receive curated travel moments every week.'}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="dashboard-footer__form">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={language === 'vi' ? 'Email của bạn' : 'Your email'}
                className="dashboard-footer__input"
              />
              <Button 
                type="submit" 
                isLoading={isSubscribing}
                className="dashboard-footer__button"
              >
                {language === 'vi' ? 'Đăng ký' : 'Subscribe'}
              </Button>
            </form>
            <div className="dashboard-footer__social">
              <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
              <a href="#" aria-label="Instagram"><i className="fab fa-instagram" /></a>
              <a href="#" aria-label="YouTube"><i className="fab fa-youtube" /></a>
            </div>
          </div>
        </div>
        <div className="dashboard-footer__bottom">
          <p>
            {language === 'vi'
              ? '© 2025 VietJourney. Bảo lưu mọi quyền.'
              : '© 2025 VietJourney. All rights reserved.'}
          </p>
          <span>{language === 'vi' ? 'Thiết kế đồng bộ với trải nghiệm Welcome.' : 'Design aligned with the Welcome experience.'}</span>
        </div>
      </div>
    </footer>
  )
}
