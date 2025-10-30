import { useMemo, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { TravelSearchForm } from '@/components/forms/TravelSearchForm'
import { HotelSearchForm } from '@/components/forms/HotelSearchForm'
import { AirlineSearchForm } from '@/components/forms/AirlineSearchForm'

type TabType = 'travel' | 'hotel' | 'airline' | 'package' | 'restaurant'

interface SearchSectionProps {
  onShowFlightBooking?: (data: any) => void
}

export function SearchSection({ onShowFlightBooking }: SearchSectionProps) {
  // console.log('🟢 [SearchSection] Nhận được callback:', !!onShowFlightBooking, typeof onShowFlightBooking)
  const { language } = useAppStore()
  const [activeTab, setActiveTab] = useState<TabType>('travel')

  const tabs = useMemo(
    () => [
      {
        id: 'travel' as TabType,
        icon: 'fas fa-route',
        label: language === 'vi' ? 'Tour cá nhân hóa' : 'Personal tours',
        description:
          language === 'vi'
            ? 'Kết hợp hoạt động, lịch trình và cảm hứng riêng của bạn'
            : 'Blend activities, schedules and your personal inspiration',
      },
      {
        id: 'hotel' as TabType,
        icon: 'fas fa-building',
        label: language === 'vi' ? 'Khách sạn' : 'Hotels',
        description:
          language === 'vi'
            ? 'Chọn nơi lưu trú tinh tế phù hợp ngân sách'
            : 'Find curated stays aligned with your budget',
      },
      {
        id: 'airline' as TabType,
        icon: 'fas fa-plane-departure',
        label: language === 'vi' ? 'Vé máy bay' : 'Flights',
        description:
          language === 'vi'
            ? 'Kết nối các chặng bay tối ưu cho hành trình'
            : 'Optimise flight legs for your journey',
      },
      {
        id: 'package' as TabType,
        icon: 'fas fa-suitcase-rolling',
        label: language === 'vi' ? 'Tour trọn gói' : 'Packages',
        description:
          language === 'vi'
            ? 'Gói trải nghiệm toàn diện sẽ ra mắt'
            : 'Full experience bundles coming soon',
      },
      {
        id: 'restaurant' as TabType,
        icon: 'fas fa-utensils',
        label: language === 'vi' ? 'Ẩm thực & dịch vụ' : 'Food & services',
        description:
          language === 'vi'
            ? 'Khám phá dịch vụ bổ sung trong thời gian tới'
            : 'Supplementary services arriving soon',
      },
    ],
    [language]
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'travel':
        // console.log('🟢 [SearchSection] Truyền callback xuống TravelSearchForm:', !!onShowFlightBooking)
        return <TravelSearchForm onShowFlightBooking={onShowFlightBooking} />
      case 'hotel':
        return <HotelSearchForm />
      case 'airline':
        return <AirlineSearchForm />
      case 'package':
        return (
          <div className="dashboard-placeholder">
            <i className="fas fa-suitcase-rolling" aria-hidden="true" />
            <h3>
              {language === 'vi'
                ? 'Tour trọn gói đang được chuẩn bị'
                : 'Package tours are being refined'}
            </h3>
            <p>
              {language === 'vi'
                ? 'Chúng tôi đang tạo nên các hành trình đầy cảm hứng dành cho bạn.'
                : 'We are crafting curated journeys designed around your passions.'}
            </p>
          </div>
        )
      case 'restaurant':
        return (
          <div className="dashboard-placeholder">
            <i className="fas fa-concierge-bell" aria-hidden="true" />
            <h3>
              {language === 'vi'
                ? 'Dịch vụ ẩm thực & trải nghiệm sẽ sớm ra mắt'
                : 'Dining & experience services launching soon'}
            </h3>
            <p>
              {language === 'vi'
                ? 'Theo dõi bảng điều khiển để nhận cập nhật sớm nhất.'
                : 'Stay tuned to your dashboard for the earliest updates.'}
            </p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <section id="dashboard-search" className="dashboard-search">
      <div className="dashboard-search__glow" aria-hidden="true" />
      <div className="dashboard-search__inner">
        <div className="dashboard-tabs" role="tablist" aria-label="Search categories">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                className={`dashboard-tab ${isActive ? 'dashboard-tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={isActive}
                aria-selected={isActive}
                role="tab"
              >
                <span className="dashboard-tab__icon" aria-hidden="true">
                  <i className={tab.icon} />
                </span>
                <span className="dashboard-tab__body">
                  <span className="dashboard-tab__label">{tab.label}</span>
                  <span className="dashboard-tab__description">{tab.description}</span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="dashboard-search__panel" role="tabpanel">
          {renderContent()}
        </div>
      </div>
    </section>
  )
}
