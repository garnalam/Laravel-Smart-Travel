'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Tour } from '@/types/domain'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button_dashboard'

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=900&q=80',
]

export function FeaturedTours() {
  const { currency, language } = useAppStore()
  const [tours, setTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const defaultTours: Tour[] = useMemo(
    () => [
      {
        id: '1',
        title: language === 'vi' ? 'Nhịp sống Sài Gòn' : 'Saigon Rhythm',
        location: language === 'vi' ? 'Thành phố Hồ Chí Minh' : 'Ho Chi Minh City',
        duration: language === 'vi' ? '4 ngày 3 đêm' : '4 days 3 nights',
        price: 489.25,
        currency: 'USD',
        image: FALLBACK_IMAGES[0],
      },
      {
        id: '2',
        title: language === 'vi' ? 'Hơi thở biển Đà Nẵng' : 'Da Nang Sea Breeze',
        location: 'Đà Nẵng',
        duration: language === 'vi' ? '3 ngày 2 đêm' : '3 days 2 nights',
        price: 525,
        currency: 'USD',
        image: FALLBACK_IMAGES[1],
      },
      {
        id: '3',
        title: language === 'vi' ? 'Sương sớm Hà Nội' : 'Hanoi Dawn',
        location: 'Hà Nội',
        duration: language === 'vi' ? '4 ngày 3 đêm' : '4 days 3 nights',
        price: 443,
        currency: 'USD',
        image: FALLBACK_IMAGES[2],
      },
      {
        id: '4',
        title: language === 'vi' ? 'Thiên đường Phú Quốc' : 'Phu Quoc Paradise',
        location: 'Phú Quốc',
        duration: language === 'vi' ? '5 ngày 4 đêm' : '5 days 4 nights',
        price: 682,
        currency: 'USD',
        image: FALLBACK_IMAGES[3],
      },
    ],
    [language]
  )

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setTours(defaultTours)
      } catch (error) {
        console.error('Error fetching tours:', error)
        setTours(defaultTours)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTours()
  }, [defaultTours, language])

  const convertPrice = (price: number, fromCurrency: string) => {
    if (currency === 'VND' && fromCurrency === 'USD') {
      return price * 24000
    }
    if (currency === 'USD' && fromCurrency === 'VND') {
      return price / 24000
    }
    return price
  }

  const renderLoading = () => (
    <div className="dashboard-loader">
      <i className="fas fa-spinner fa-spin" aria-hidden="true" />
      <p>{language === 'vi' ? 'Đang tải dữ liệu tour...' : 'Loading tour data...'}</p>
    </div>
  )

  return (
    <section id="dashboard-featured" className="dashboard-featured">
      <div className="dashboard-featured__background" aria-hidden="true" />
      <div className="dashboard-featured__inner">
        <div className="dashboard-featured__header">
          <span className="dashboard-featured__tag">
            {language === 'vi' ? 'Được đề xuất cho bạn' : 'Curated for you'}
          </span>
          <h2>
            {language === 'vi'
              ? 'Hành trình nổi bật khắp Việt Nam'
              : 'Featured journeys across Vietnam'}
          </h2>
          <p>
            {language === 'vi'
              ? 'Tận hưởng những tuyến đường được cá nhân hóa với phong cách thiết kế đồng nhất cùng trang chào mừng.'
              : 'Enjoy journeys designed to mirror the welcoming aesthetic with immersive storytelling.'}
          </p>
        </div>

        <div className="dashboard-featured__grid">
          {isLoading
            ? renderLoading()
            : tours.map((tour, index) => (
                <article key={tour.id} className="dashboard-card">
                  <div className="dashboard-card__media">
                    <img
                      src={tour.image || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}
                      alt={tour.title}
                      loading="lazy"
                      onError={(event) => {
                        const target = event.currentTarget
                        target.src = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
                      }}
                    />
                    <div className="dashboard-card__overlay" />
                    <span className="dashboard-card__location">
                      <i className="fas fa-location-dot" aria-hidden="true" />
                      {tour.location}
                    </span>
                  </div>

                  <div className="dashboard-card__content">
                    <h3>{tour.title}</h3>
                    <p className="dashboard-card__duration">
                      <i className="fas fa-clock" aria-hidden="true" />
                      {tour.duration}
                    </p>
                    <div className="dashboard-card__footer">
                      <span className="dashboard-card__price">
                        {language === 'vi' ? 'Chỉ từ' : 'From'}{' '}
                        {formatCurrency(convertPrice(tour.price, tour.currency), currency)}
                      </span>
                      <Button
                        className="dashboard-card__button"
                        variant="outline"
                        onClick={() => {
                          console.log('View tour details:', tour.id)
                        }}
                      >
                        {language === 'vi' ? 'Xem chi tiết' : 'View details'}
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
        </div>
      </div>
    </section>
  )
}
