import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  Bus,
  Check,
  ChevronLeft,
  ChevronRight,
  Hotel,
  Loader2,
  MapPin,
  Star,
  ThumbsDown,
  ThumbsUp,
  Utensils,
} from 'lucide-react'
import { router } from '@inertiajs/react'
import { useAppStore } from '@/store/useAppStore'
import { useTourStorage } from '@/hooks/useTourStorage'
import { useToast } from '@/hooks/useToast'
import { DataTour } from '@/types/domain'

export type PreferencesSectionMode = 'page' | 'dashboard'

export interface PreferencesSectionProps {
  initialTourData?: Partial<DataTour>
  mode?: PreferencesSectionMode
  onBack?: () => void
  selectedDay?: number
  onDayChange?: (day: number) => void
  onScheduleGenerated?: (payload: {
    currentDay: number
    scheduleData: DaySchedule[]
    tourData?: Partial<DataTour>
  }) => void
}

interface PlacesData {
  currentDay: number
  budget: number
  passengers: number
  restaurants: string[]
  hotels: string[]
  activities: string[]
  transport: string[]
  liked_restaurants: string[]
  disliked_restaurants: string[]
  liked_hotels: string[]
  disliked_hotels: string[]
  liked_activities: string[]
  disliked_activities: string[]
  liked_transport: string[]
  disliked_transport: string[]
}

interface PlaceItem {
  id: string | number
  place_id?: string
  name: string
  category: string
  rating: number
  reviews: number
  price: string
  info?: string
  liked?: boolean
  disliked?: boolean
}

interface CategorySection {
  title: string
  icon: React.ReactNode
  bgColor: string
  items: PlaceItem[]
}

export interface DaySchedule {
  day: number
  date: string
  completed: boolean
  items: Array<{
    id: string | number
    place_id?: string
    type: 'meal' | 'transfer' | 'activity' | 'hotel'
    startTime: string
    endTime: string
    title: string
    cost: number
    transport_mode?: string
    distance?: string
  }>
  totalCost: number
}

const CATEGORY_CONFIG = {
  Restaurants: {
    icon: <Utensils className="w-5 h-5" />,
    bg: 'bg-red-50',
  },
  Hotels: {
    icon: <Hotel className="w-5 h-5" />,
    bg: 'bg-blue-50',
  },
  'Recreation Places': {
    icon: <MapPin className="w-5 h-5" />,
    bg: 'bg-green-50',
  },
  'Local Transport': {
    icon: <Bus className="w-5 h-5" />,
    bg: 'bg-yellow-50',
  },
} as const

type CategoryKey = keyof typeof CATEGORY_CONFIG

const categoryTitleMap: Record<string, CategoryKey> = {
  restaurants: 'Restaurants',
  hotels: 'Hotels',
  tourist_attractions: 'Recreation Places',
  transport: 'Local Transport',
}

const likeTypeMap: Record<CategoryKey, string> = {
  Restaurants: 'restaurants',
  Hotels: 'hotels',
  'Recreation Places': 'recreation_places',
  'Local Transport': 'local_transport',
}

const isDayScheduleArray = (payload: unknown): payload is DaySchedule[] => {
  if (!Array.isArray(payload)) return false
  return payload.every(
    (item) =>
      item &&
      typeof item === 'object' &&
      'day' in item &&
      'items' in item &&
      'totalCost' in item
  )
}

const extractScheduleData = (payload: any): DaySchedule[] => {
  if (!payload) return []
  if (isDayScheduleArray(payload)) return payload
  if (isDayScheduleArray(payload?.scheduleData)) return payload.scheduleData
  if (isDayScheduleArray(payload?.props?.scheduleData)) return payload.props.scheduleData
  if (isDayScheduleArray(payload?.props?.data)) return payload.props.data
  if (isDayScheduleArray(payload?.props?.data?.scheduleData)) return payload.props.data.scheduleData
  if (
    payload?.props?.data?.scheduleData?.data &&
    isDayScheduleArray(payload.props.data.scheduleData.data)
  ) {
    return payload.props.data.scheduleData.data
  }
  return []
}

const extractTourData = (payload: any): Partial<DataTour> | undefined => {
  if (!payload) return undefined
  const candidates = [
    payload?.tourData,
    payload?.props?.tourData,
    payload?.props?.data?.tourData,
    payload?.props?.data,
    payload?.props,
  ]

  for (const candidate of candidates) {
    if (candidate && typeof candidate === 'object') {
      if (
        'destination' in candidate ||
        'departure' in candidate ||
        'days' in candidate ||
        'budget' in candidate ||
        'passengers' in candidate
      ) {
        return candidate as Partial<DataTour>
      }
    }
  }

  return undefined
}

type ScheduleItem = DaySchedule['items'][number]

type ScheduleSuccessPayload = NonNullable<PreferencesSectionProps['onScheduleGenerated']> extends (
  payload: infer P,
) => void
  ? P
  : { currentDay: number; scheduleData: DaySchedule[]; tourData?: Partial<DataTour> }

export function PreferencesSection({
  initialTourData,
  mode = 'page',
  onBack,
  selectedDay,
  onDayChange,
  onScheduleGenerated,
}: PreferencesSectionProps) {
  const { language } = useAppStore()
  const { success, error } = useToast()
  const {
    tourData: storedTourData,
    saveTourData,
    saveDayPreferences,
    getDayPreferences,
    getAllDaySchedules,
    saveDaySchedule,
  } = useTourStorage()

  const [formData, setFormData] = useState<Partial<DataTour>>(() => {
    if (initialTourData && Object.keys(initialTourData).length > 0) {
      return initialTourData
    }
    return storedTourData || {}
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<CategorySection[]>([])
  const [isSummaryOpen, setIsSummaryOpen] = useState(true)
  const [currentDay, setCurrentDay] = useState<number>(selectedDay || 1)
  const [scheduleVersion, setScheduleVersion] = useState(0)

  useEffect(() => {
    if (mode === 'dashboard' && selectedDay && selectedDay !== currentDay) {
      setCurrentDay(selectedDay)
    }
  }, [mode, selectedDay, currentDay])

  useEffect(() => {
    if (initialTourData && Object.keys(initialTourData).length > 0) {
      setFormData((prev) => ({ ...prev, ...initialTourData }))
    }
  }, [initialTourData])

  const daySchedules = useMemo(
    () => getAllDaySchedules(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scheduleVersion, currentDay, formData.days]
  )

  const selectedDaySchedule = useMemo(
    () => daySchedules?.[currentDay],
    [daySchedules, currentDay]
  )

  const rebuildCategoriesFromStorage = useCallback((saved: any[]): CategorySection[] => {
    return saved.map((category) => {
      const config = CATEGORY_CONFIG[category.title as CategoryKey]
      return {
        title: category.title,
        icon: config?.icon || <Activity className="w-5 h-5" />,
        bgColor: config?.bg || 'bg-slate-50',
        items: (category.items || []).map((item: any) => ({
          id: item.id,
          place_id: item.place_id,
          name: item.name,
          category: item.category,
          rating: item.rating,
          reviews: item.reviews,
          price: item.price,
          info: item.info,
          liked: item.liked ?? false,
          disliked: item.disliked ?? false,
        })),
      }
    })
  }, [])

  const transformCategoriesFromApi = useCallback((data: any): CategorySection[] => {
    return Object.entries(data).reduce<CategorySection[]>((acc, [key, list]) => {
      const title = categoryTitleMap[key] || key
      const config = CATEGORY_CONFIG[title as CategoryKey] || {
        icon: <Activity className="w-5 h-5" />,
        bg: 'bg-slate-50',
      }

      const items = (list as any[]).map((place) => ({
        id: place.id,
        place_id: place.place_id,
        name: place.name,
        category: place.type_display || title,
        rating: place.rating || 0,
        reviews: place.user_ratings_total || 0,
        price: place.avg_price ? `${place.avg_price}$` : place.price_level || '$$',
        info: place.info,
        liked: place.liked ?? false,
        disliked: place.disliked ?? false,
      }))

      acc.push({
        title,
        icon: config.icon,
        bgColor: config.bg,
        items,
      })
      return acc
    }, [])
  }, [])

  const ensureTourData = useCallback(
    (data: Partial<DataTour> | null | undefined) => {
      if (!data) return
      const cleaned: Partial<DataTour> = {
        city_id: data.city_id || '',
        budget: data.budget || 0,
        passengers: data.passengers || 0,
        days: data.days || 0,
        moneyFlight: data.moneyFlight || 0,
        departure: data.departure || '',
        destination: data.destination || '',
        departureDate: data.departureDate || '',
        arrivalDate: data.arrivalDate || '',
        adults: data.adults || 0,
        children: data.children || 0,
        infants: data.infants || 0,
      }
      setFormData((prev) => ({ ...prev, ...cleaned }))
      saveTourData(cleaned)
    },
    [saveTourData]
  )

  useEffect(() => {
    let cancelled = false

    const loadPreferences = async () => {
      if (!formData.destination) {
        setCategories([])
        setIsLoading(false)
        return
      }

      const storedPreferences = getDayPreferences(currentDay)
      if (storedPreferences?.preferences) {
        if (!cancelled) {
          setCategories(rebuildCategoriesFromStorage(storedPreferences.preferences as CategorySection[]))
          setIsLoading(false)
        }
        return
      }

      setIsLoading(true)
      try {
        let cityId = formData.city_id
        if (!cityId && formData.destination) {
          const cityResponse = await fetch(`/api/city?search=${encodeURIComponent(formData.destination)}`)
          const cityData = await cityResponse.json()
          if (Array.isArray(cityData) && cityData.length > 0) {
            const exactMatch = cityData.find(
              (c: any) => c.city === formData.destination || c.city_ascii === formData.destination
            )
            cityId = (exactMatch || cityData[0])._id
            if (!cancelled) {
              saveTourData({ city_id: cityId })
              setFormData((prev) => ({ ...prev, city_id: cityId }))
            }
          }
        }

        const params = new URLSearchParams({
          city_id: cityId || '',
          destination: formData.destination || '',
          days: String(formData.days || 1),
          budget: String(formData.budget || 1000),
          passengers: String(formData.passengers || 1),
        })
        const response = await fetch(`/api/places/tour-preferences?${params.toString()}`)
        const data = await response.json()

        if (data.success && !cancelled) {
          setCategories(transformCategoriesFromApi(data.data))
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching tour preferences:', err)
          error(
            language === 'vi'
              ? 'Không thể tải dữ liệu đề xuất, vui lòng thử lại.'
              : 'Unable to fetch personalised suggestions. Please try again.'
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadPreferences()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDay, formData.destination, formData.city_id, formData.days, formData.budget, formData.passengers, language])

  const persistPreferences = useCallback(
    (cats: CategorySection[]) => {
      const preferencesData = cats.map((cat) => ({
        title: cat.title,
        items: cat.items.map((item) => ({
          id: item.id,
          place_id: item.place_id,
          name: item.name,
          category: item.category,
          rating: item.rating,
          reviews: item.reviews,
          price: item.price,
          info: item.info,
          liked: item.liked || false,
          disliked: item.disliked || false,
        })),
      }))

      const likedItems = cats.flatMap((cat) =>
        cat.items
          .filter((item) => item.liked)
          .map((item) => ({
            type: likeTypeMap[cat.title as CategoryKey] || cat.title.toLowerCase(),
            id: item.id,
            place_id: item.place_id,
            name: item.name,
            category: item.category,
            rating: item.rating,
            price: item.price,
            info: item.info,
          }))
      )

      const dislikedItems = cats.flatMap((cat) =>
        cat.items
          .filter((item) => item.disliked)
          .map((item) => ({
            type: likeTypeMap[cat.title as CategoryKey] || cat.title.toLowerCase(),
            id: item.id,
            place_id: item.place_id,
            name: item.name,
          }))
      )

      saveDayPreferences(currentDay, {
        preferences: preferencesData,
        likedItems,
        dislikedItems,
      })

      return { likedItems, dislikedItems }
    },
    [currentDay, saveDayPreferences]
  )

  const changeDay = useCallback(
    (day: number) => {
      if (day === currentDay) return
      persistPreferences(categories)
      setCurrentDay(day)
      onDayChange?.(day)
      setIsSummaryOpen(true)
    },
    [categories, currentDay, onDayChange, persistPreferences]
  )

  const togglePreference = useCallback(
    (categoryIndex: number, itemId: string | number, type: 'like' | 'dislike') => {
      setCategories((prev) => {
        const updated = prev.map((category, idx) => {
          if (idx !== categoryIndex) return category
          return {
            ...category,
            items: category.items.map((item) => {
              if (item.id !== itemId) return item
              if (type === 'like') {
                const next = !item.liked
                return {
                  ...item,
                  liked: next,
                  disliked: next ? false : item.disliked,
                }
              }
              const next = !item.disliked
              return {
                ...item,
                disliked: next,
                liked: next ? false : item.liked,
              }
            }),
          }
        })
        persistPreferences(updated)
        return updated
      })
    },
    [persistPreferences]
  )

  const handleBack = useCallback(() => {
    if (mode === 'dashboard' && onBack) {
      onBack()
    } else {
      router.visit('/tour/flight')
    }
  }, [mode, onBack])

  const currentTourDays = formData.days || storedTourData?.days || 1

  const formatCost = useCallback((value: number | string | undefined) => {
    const numeric = typeof value === 'string' ? parseFloat(value) : value || 0
    return Number.isFinite(numeric) ? numeric.toFixed(2) : '0.00'
  }, [])

  const formatDate = useCallback(
    (dateString: string) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    },
    [language]
  )

  const getProgressLabel = useCallback(
    (day: number) => {
      const isCompleted = !!daySchedules?.[day]
      const isCurrent = day === currentDay
      if (isCompleted) return language === 'vi' ? 'Đã khóa' : 'Completed'
      if (isCurrent) return language === 'vi' ? 'Đang chỉnh' : 'In progress'
      return language === 'vi' ? 'Chưa xử lý' : 'Pending'
    },
    [currentDay, daySchedules, language]
  )

  const likedCount = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.items.filter((item) => item.liked).length, 0)
  }, [categories])

  const dislikedCount = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.items.filter((item) => item.disliked).length, 0)
  }, [categories])

    const requestScheduleGeneration = useCallback(
    (payload: PlacesData) =>
      new Promise((resolve, reject) => {
        router.post(
          '/tour/generate-schedule',
          payload as any,
          {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => resolve(page),
            onError: () => reject(new Error('Schedule generation failed')),
            onCancel: () => reject(new Error('Schedule generation cancelled')),
          },
        )
      }),
    [],
  )

  const handleScheduleSuccess = useCallback(
    (payload: unknown, likedItems: unknown[], dislikedItems: unknown[]) => {
      const scheduleData = extractScheduleData(payload)
      const tourPayload = extractTourData(payload)

      if (scheduleData.length > 0) {
        scheduleData.forEach((schedule) => {
          if (schedule && typeof schedule.day === 'number') {
            saveDaySchedule(schedule.day, schedule)
          }
        })
        setScheduleVersion((prev) => prev + 1)
      }

      if (tourPayload) {
        ensureTourData(tourPayload)
      }

      const successPayload: ScheduleSuccessPayload = {
        currentDay,
        scheduleData,
        tourData: tourPayload,
      }

      onScheduleGenerated?.(successPayload)

      success(
        language === 'vi'
          ? 'Đã tạo lịch trình cho ngày này, kéo xuống để xem chi tiết.'
          : 'Schedule generated. Scroll down to review the details.'
      )
    },
    [currentDay, ensureTourData, language, onScheduleGenerated, saveDaySchedule, success]
  )

    const buildPlacesPayload = useCallback(() => {
    const restaurants = categories
      .filter((cat) => cat.title === 'Restaurants')
      .flatMap((cat) =>
        cat.items
          .filter((item) => item.liked)
          .map((item) => item.place_id?.toString() || '')
      )
    const hotels = categories
      .filter((cat) => cat.title === 'Hotels')
      .flatMap((cat) =>
        cat.items
          .filter((item) => item.liked)
          .map((item) => item.place_id?.toString() || '')
      )
    const activities = categories
      .filter((cat) => cat.title === 'Recreation Places')
      .flatMap((cat) =>
        cat.items
          .filter((item) => item.liked)
          .map((item) => item.place_id?.toString() || '')
      )
    const transports = categories
      .filter((cat) => cat.title === 'Local Transport')
      .flatMap((cat) =>
        cat.items
          .filter((item) => item.liked)
          .map((item) => item.name || '')
      )

    const { likedItems, dislikedItems } = persistPreferences(categories)

    const payload: PlacesData = {
      currentDay,
      budget: formData.budget || 0,
      passengers: formData.passengers || 0,
      restaurants,
      hotels,
      activities,
      transport: transports,
      disliked_restaurants: dislikedItems
        .filter((item) => item.type === 'restaurants')
        .map((item) => item.place_id?.toString() || ''),
      disliked_hotels: dislikedItems
        .filter((item) => item.type === 'hotels')
        .map((item) => item.place_id?.toString() || ''),
      disliked_activities: dislikedItems
        .filter((item) => item.type === 'recreation_places')
        .map((item) => item.place_id?.toString() || ''),
      disliked_transport: dislikedItems
        .filter((item) => item.type === 'local_transport')
        .map((item) => item.name?.toString() || ''),
      liked_restaurants: likedItems
        .filter((item) => item.type === 'restaurants')
        .map((item) => item.place_id?.toString() || ''),
      liked_hotels: likedItems
        .filter((item) => item.type === 'hotels')
        .map((item) => item.place_id?.toString() || ''),
      liked_activities: likedItems
        .filter((item) => item.type === 'recreation_places')
        .map((item) => item.place_id?.toString() || ''),
      liked_transport: likedItems
        .filter((item) => item.type === 'local_transport')
        .map((item) => item.name?.toString() || ''),
    }

    return { payload, likedItems, dislikedItems }
  }, [categories, currentDay, formData.budget, formData.passengers, persistPreferences])

  const handleContinue = useCallback(async () => {
    if (categories.length === 0) {
      error(
        language === 'vi'
          ? 'Hiện chưa có gợi ý để tiếp tục.'
          : 'There are no suggestions available to continue.'
      )
      return
    }

    const { payload, likedItems, dislikedItems } = buildPlacesPayload()

    if (mode === 'dashboard') {
      setIsSubmitting(true)
      try {
        const response = await requestScheduleGeneration(payload)
        handleScheduleSuccess(response, likedItems, dislikedItems)
      } catch (err) {
        console.error(err)
        error(
          language === 'vi'
            ? 'Không thể tạo lịch trình ngay lúc này. Vui lòng thử lại.'
            : 'Unable to build the schedule right now. Please try again.'
        )
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    router.post('/tour/generate-schedule', payload as any)
  }, [
    buildPlacesPayload,
    error,
    handleScheduleSuccess,
    language,
    mode,
    requestScheduleGeneration,
  ])

  return (
    <section id="dashboard-preferences" className="dashboard-preferences">
      <div className="dashboard-preferences__halo" aria-hidden="true" />
      <div className="dashboard-preferences__inner">
        <header className="dashboard-preferences__header">
          <div className="dashboard-preferences__chip">
            <span>{language === 'vi' ? 'Tinh chỉnh ưu tiên' : 'Refine preferences'}</span>
            <span className="dashboard-preferences__chip-sep" />
            <span>
              {currentDay}/{formData.days || 1}{' '}
              {language === 'vi' ? 'ngày' : 'days'}
            </span>
          </div>
          <div className="dashboard-preferences__titles">
            <h2>
              {language === 'vi'
                ? 'Chọn trải nghiệm phù hợp với phong cách của bạn'
                : 'Curate the experiences that fit your travel style'}
            </h2>
            <p>
              {language === 'vi'
                ? 'Đánh giá nhà hàng, khách sạn, hoạt động và phương tiện để hệ thống đề xuất lịch trình sát gu nhất.'
                : 'Evaluate restaurants, hotels, activities and transfers so the system can tailor the itinerary around your preferences.'}
            </p>
          </div>
        </header>

        <div className="dashboard-preferences__grid">
          <aside className="dashboard-preferences__summary">
            <div className="dashboard-preferences__summary-card">
              <div className="dashboard-preferences__summary-header">
                <span>{language === 'vi' ? 'Thông tin hành trình' : 'Trip overview'}</span>
                <button type="button" onClick={handleBack}>
                  <ChevronLeft className="w-4 h-4" />
                  <span>{language === 'vi' ? 'Quay lại' : 'Back'}</span>
                </button>
              </div>

              <ul>
                <li>
                  <span>{language === 'vi' ? 'Điểm đến' : 'Destination'}</span>
                  <strong>{formData.destination || '—'}</strong>
                </li>
                <li>
                  <span>{language === 'vi' ? 'Lịch trình' : 'Dates'}</span>
                  <strong>
                    {formData.departureDate
                      ? `${formatDate(formData.departureDate)} — ${formatDate(formData.arrivalDate || '')}`
                      : '—'}
                  </strong>
                </li>
                <li>
                  <span>{language === 'vi' ? 'Số khách' : 'Guests'}</span>
                  <strong>{formData.passengers || 0}</strong>
                </li>
                <li>
                  <span>{language === 'vi' ? 'Ngân sách' : 'Budget'}</span>
                  <strong>
                    {formData.budget
                      ? new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(formData.budget as number)
                      : '—'}
                  </strong>
                </li>
              </ul>

              <div className="dashboard-preferences__summary-stat">
                <div>
                  <span>{language === 'vi' ? 'Ưa thích' : 'Likes'}</span>
                  <strong>{likedCount}</strong>
                </div>
                <div>
                  <span>{language === 'vi' ? 'Tránh' : 'Dislikes'}</span>
                  <strong>{dislikedCount}</strong>
                </div>
              </div>

              <div className="dashboard-preferences__progress">
                <header>
                  <h4>{language === 'vi' ? 'Tiến độ từng ngày' : 'Day progress'}</h4>
                  <span>
                    {currentDay}/{formData.days || 1}
                  </span>
                </header>

                <div className="dashboard-preferences__progress-steps">
                  {Array.from({ length: formData.days || 1 }, (_, idx) => idx + 1).map((day) => {
                    const isCompleted = !!daySchedules?.[day]
                    const isCurrent = day === currentDay
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => changeDay(day)}
                        className={`dashboard-preferences__progress-step ${isCompleted ? 'is-complete' : ''} ${
                          isCurrent ? 'is-active' : ''
                        }`}
                      >
                        <span>{day}</span>
                        <small>{getProgressLabel(day)}</small>
                      </button>
                    )
                  })}
                </div>
              </div>

              {selectedDaySchedule && (
                <div className="dashboard-preferences__schedule">
                  <h4>{language === 'vi' ? 'Tóm tắt lịch trong ngày' : 'Day schedule summary'}</h4>
                  <ul>
                    {selectedDaySchedule.items?.map((item: ScheduleItem) => (
                      <li key={`${item.id}-${item.startTime}`}>
                        <div>
                          <span>{item.title}</span>
                          <small>
                            {item.startTime} – {item.endTime}
                          </small>
                        </div>
                        <strong>${formatCost(item.cost)}</strong>
                      </li>
                    ))}
                  </ul>
                  <footer>
                    <span>{language === 'vi' ? 'Tổng chi phí' : 'Total cost'}</span>
                    <strong>${formatCost(selectedDaySchedule.totalCost)}</strong>
                  </footer>
                </div>
              )}
            </div>
          </aside>

          <div className="dashboard-preferences__content">
            {isLoading ? (
              <div className="dashboard-preferences__loading">
                <Loader2 className="w-12 h-12 animate-spin" />
                <p>{language === 'vi' ? 'Đang tải gợi ý...' : 'Fetching personalised suggestions...'}</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="dashboard-preferences__empty">
                <MapPin className="w-16 h-16" />
                <h3>{language === 'vi' ? 'Chưa có gợi ý' : 'No suggestions yet'}</h3>
                <p>
                  {language === 'vi'
                    ? 'Vui lòng điều chỉnh thông tin hành trình để nhận được gợi ý phù hợp.'
                    : 'Adjust your trip details to receive matching recommendations.'}
                </p>
              </div>
            ) : (
              <div className="dashboard-preferences__cards">
                {categories.map((category, categoryIndex) => (
                  <article key={category.title} className="dashboard-preferences__card">
                    <header>
                      <div className="dashboard-preferences__icon">{category.icon}</div>
                      <div>
                        <h3>{category.title}</h3>
                        <p>
                          {language === 'vi'
                            ? 'Tương tác để cá nhân hoá sở thích và loại bỏ những lựa chọn không phù hợp.'
                            : 'Interact to highlight favourites and remove options that do not resonate.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="dashboard-preferences__collapse"
                        onClick={() => setIsSummaryOpen((prev) => !prev)}
                      >
                        <ChevronRight className={`w-4 h-4 ${isSummaryOpen ? 'rotate-90' : ''}`} />
                      </button>
                    </header>

                    <div className="dashboard-preferences__list">
                      {category.items.map((item) => (
                        <div key={item.id} className="dashboard-preferences__item">
                          <div className="dashboard-preferences__item-body">
                            <h4>{item.name}</h4>
                            <p>{item.category}</p>
                            <div className="dashboard-preferences__item-meta">
                              <span>
                                <Star className="w-4 h-4" /> {item.rating.toFixed(1)}
                              </span>
                              <span>{item.reviews.toLocaleString()} reviews</span>
                              {item.price && <span>{item.price}</span>}
                              {item.info && <span>{item.info}</span>}
                            </div>
                          </div>

                          <div className="dashboard-preferences__item-actions">
                            <button
                              type="button"
                              onClick={() => togglePreference(categoryIndex, item.id, 'like')}
                              className={`dashboard-preferences__pill ${item.liked ? 'is-active' : ''}`}
                            >
                              <ThumbsUp className="w-4 h-4" />
                              <span>{language === 'vi' ? 'Ưa thích' : 'Like'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => togglePreference(categoryIndex, item.id, 'dislike')}
                              className={`dashboard-preferences__pill ${item.disliked ? 'is-active' : ''}`}
                            >
                              <ThumbsDown className="w-4 h-4" />
                              <span>{language === 'vi' ? 'Tránh' : 'Skip'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}

            <footer className="dashboard-preferences__footer">
              <div className="dashboard-preferences__footer-meta">
                <button type="button" onClick={handleBack}>
                  <ChevronLeft className="w-4 h-4" />
                  <span>{language === 'vi' ? 'Quay về chọn chuyến bay' : 'Back to flight selection'}</span>
                </button>
                <div>
                  <span>{language === 'vi' ? 'Ngày đang xử lý' : 'Editing day'}</span>
                  <strong>
                    {currentDay}/{formData.days || 1}
                  </strong>
                </div>
              </div>
              <div className="dashboard-preferences__footer-actions">
                <button
                  type="button"
                  className="dashboard-preferences__primary"
                  onClick={handleContinue}
                  disabled={isSubmitting}
                >
                  <span>
                    {isSubmitting
                      ? language === 'vi'
                        ? 'Đang tạo lịch trình...'
                        : 'Building schedule...'
                      : language === 'vi'
                        ? 'Tiếp tục tạo lịch trình'
                        : 'Continue to build schedule'}
                  </span>
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PreferencesSection
