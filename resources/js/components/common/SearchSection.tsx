
import { useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { TravelSearchForm } from '@/components/forms/TravelSearchForm'
import { HotelSearchForm } from '@/components/forms/HotelSearchForm'
import { AirlineSearchForm } from '@/components/forms/AirlineSearchForm'

type TabType = 'travel' | 'hotel' | 'airline' | 'package' | 'restaurant'

export function SearchSection() {
  const { isAuthenticated } = useAuthStore()
  const { language } = useAppStore()

  const [activeTab, setActiveTab] = useState<TabType>('travel')

  const tabs = [
    {
      id: 'travel' as TabType,
      icon: 'fas fa-car',
      label: language === 'vi' ? 'Tour du lịch cá nhân' : 'Personalized Travel tour'
    },
    {
      id: 'hotel' as TabType,
      icon: 'fas fa-building',
      label: language === 'vi' ? 'Khách sạn' : 'Hotel'
    },
    {
      id: 'airline' as TabType,
      icon: 'fas fa-plane',
      label: language === 'vi' ? 'Vé máy bay' : 'Airlines tickets'
    },
    {
      id: 'package' as TabType,
      icon: 'fas fa-suitcase-rolling',
      label: language === 'vi' ? 'Tour trọn gói' : 'Package tour'
    },
    {
      id: 'restaurant' as TabType,
      icon: 'fas fa-utensils',
      label: language === 'vi' ? 'Dịch vụ khác' : 'Restaurant'
    }
  ]


  const renderContent = () => {

    switch (activeTab) {
      case 'travel':
        return <TravelSearchForm />
      case 'hotel':
        return <HotelSearchForm />
      case 'airline':
        return <AirlineSearchForm />
      case 'package':
        return (
          <div className="text-center py-12">
            <i className="fas fa-suitcase-rolling text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {language === 'vi' ? 'Tour Trọn Gói Sắp Ra Mắt' : 'Package Tours Coming Soon'}
            </h3>
            <p className="text-gray-500">
              {language === 'vi'
                ? 'Chúng tôi đang chuẩn bị những gói tour tuyệt vời cho bạn!'
                : "We're working on amazing package deals for you!"
              }
            </p>
          </div>
        )
      case 'restaurant':
        return (
          <div className="text-center py-12">
            <i className="fas fa-concierge-bell text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {language === 'vi' ? 'Dịch Vụ Bổ Sung' : 'Restaurant'}
            </h3>
            <p className="text-gray-500">
              {language === 'vi'
                ? 'Nhà hàng sẽ sớm được cung cấp!'
                : 'Restaurant will be available soon!'
              }
            </p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <section className="py-8 bg-gray-50 relative text-gray-950">
        <div className="container mx-auto px-4">
          <div className="search-container p-8 relative">
            <div>
              {/* Tab Navigation */}
              <div className="flex flex-wrap justify-between border-b border-gray-200 mb-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-button flex items-center font-medium ${activeTab === tab.id ? 'tab-active' : 'tab-inactive'
                      }`}
                  >
                    <i className={`${tab.icon} mr-2 ${tab.id === 'airline' ? 'text-orange-500' : ''}`}></i>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="relative">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
