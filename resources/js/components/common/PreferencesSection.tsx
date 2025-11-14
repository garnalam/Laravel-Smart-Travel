import React, { useEffect, useMemo, useState } from 'react'
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
import { DataTour } from '@/types/domain'
import { FinalTourModal } from './FinalTourModal'
import type { TourData } from '@/pages/tour/FinalTour'
import axios from 'axios'
export type PreferencesSectionMode = 'page' | 'dashboard'

export interface PreferencesSectionProps {
  initialTourData?: Partial<DataTour>
  mode?: PreferencesSectionMode
  onBack?: () => void
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

export function PreferencesSection({ initialTourData, mode = 'page', onBack }: PreferencesSectionProps) {
  const { language } = useAppStore()
  const {
    tourData: storedTourData,
    saveTourData,
    saveDayPreferences,
    getDayPreferences,
    saveDaySchedule,
    getAllDaySchedules,
  } = useTourStorage()

  const [formData, setFormData] = useState<Partial<DataTour>>(() => {
    return initialTourData && Object.keys(initialTourData).length > 0 ? initialTourData : storedTourData || {}
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingFinal, setIsGeneratingFinal] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [categories, setCategories] = useState<CategorySection[]>([])
  const [isSummaryOpen, setIsSummaryOpen] = useState(true)
  const [currentDay, setCurrentDay] = useState<number>(1)
  const [daySchedules, setDaySchedules] = useState(() => getAllDaySchedules())
  const [showFinalTourModal, setShowFinalTourModal] = useState(false)
  const [finalTourData, setFinalTourData] = useState<TourData | null>(null)
  const [openSummaries, setOpenSummaries] = useState(categories.map(() => true));

  useEffect(() => {
    setOpenSummaries((prev) => {
      if (categories.length === prev.length) return prev;
      return categories.map(() => true);
    });
  }, [categories]);

  const ensureTourData = (data: Partial<DataTour> | null | undefined) => {
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
    setFormData(cleaned)
    saveTourData(cleaned)
  }

  useEffect(() => {
    ensureTourData(initialTourData)
  }, [initialTourData])

  useEffect(() => {
    if (!formData.destination) return

    console.log('🔄 [PreferencesSection] Checking for preferences:', {
      destination: formData.destination,
      city_id: formData.city_id,
      currentDay
    })

    const storedPreferences = getDayPreferences(currentDay)
    
    // Check if stored preferences match current destination
    const storedData = localStorage.getItem('smart_travel_tour_data')
    let shouldRefetch = false
    
    if (storedData) {
      const parsed = JSON.parse(storedData)
      if (parsed.destination !== formData.destination || parsed.city_id !== formData.city_id) {
        console.log('🗑️ [PreferencesSection] Destination changed, force refetch')
        shouldRefetch = true
      }
    }

    if (storedPreferences?.preferences && !shouldRefetch) {
      console.log('✅ [PreferencesSection] Using cached preferences')
      setCategories((prev) => {
        if (prev.length > 0) return prev
        const rebuilt = rebuildCategoriesFromStorage(storedPreferences.preferences as CategorySection[])
        return rebuilt
      })
      setIsLoading(false)
      return
    }

    const fetchPlaces = async () => {
      console.log('🌐 [PreferencesSection] Fetching new places...')
      setIsLoading(true)
      try {
        let cityId = formData.city_id
        if (!cityId && formData.destination) {
          console.log('🔍 [PreferencesSection] Fetching city_id for destination:', formData.destination)
          const cityResponse = await fetch(`/api/city?search=${encodeURIComponent(formData.destination)}`)
          const cityData = await cityResponse.json()
          if (Array.isArray(cityData) && cityData.length > 0) {
            const exactMatch = cityData.find((c: any) => c.city === formData.destination || c.city_ascii === formData.destination)
            cityId = (exactMatch || cityData[0])._id
            console.log('✅ [PreferencesSection] Found city_id:', cityId)
            saveTourData({ city_id: cityId })
            setFormData((prev) => ({ ...prev, city_id: cityId }))
          }
        }

        console.log('📡 [PreferencesSection] Calling API with:', {
          city_id: cityId,
          destination: formData.destination
        })

        const params = new URLSearchParams({
          city_id: cityId || '',
          destination: formData.destination || '',
          days: String(formData.days || 1),
          budget: String(formData.budget || 1000),
          passengers: String(formData.passengers || 1),
        })
        const response = await fetch(`/api/places/tour-preferences?${params.toString()}`)
        const data = await response.json()

        if (data.success) {
          console.log('✅ [PreferencesSection] Places loaded successfully')
          const transformed = transformCategoriesFromApi(data.data)
          restorePreferencesFromStorage(transformed, storedPreferences?.preferences)
          setCategories(transformed)
        }
      } catch (err) {
        console.error('❌ [PreferencesSection] Error fetching tour preferences:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlaces()
  }, [formData.destination, formData.city_id, formData.days, formData.budget, formData.passengers, currentDay])

  const rebuildCategoriesFromStorage = (saved: any[]): CategorySection[] => {
    return saved.map((category) => {
      const config = CATEGORY_CONFIG[category.title as CategoryKey]
      return {
        title: category.title,
        icon: config?.icon || <Activity className="w-5 h-5" />,
        bgColor: config?.bg || 'bg-slate-50',
        items: category.items || [],
      }
    })
  }

  const transformCategoriesFromApi = (data: any): CategorySection[] => {
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
  }

  const restorePreferencesFromStorage = (fetchedCategories: CategorySection[], savedPreferences?: any[]) => {
    if (!savedPreferences) return
    const synced = fetchedCategories.map((category) => {
      const savedCategory = savedPreferences.find((saved) => saved.title === category.title)
      if (!savedCategory) return category

      const items = category.items.map((item) => {
        const savedItem = savedCategory.items?.find((si: any) => si.id === item.id || si.place_id === item.place_id)
        return savedItem
          ? {
              ...item,
              liked: savedItem.liked ?? item.liked,
              disliked: savedItem.disliked ?? item.disliked,
            }
          : item
      })

      return { ...category, items }
    })

    setCategories(synced)
  }

  const togglePreference = (categoryIndex: number, itemId: string | number, type: 'like' | 'dislike') => {
    setCategories((prev) => {
      const updated = [...prev]
      const item = updated[categoryIndex].items.find((it) => it.id === itemId)
      if (item) {
        if (type === 'like') {
          const next = !item.liked
          item.liked = next
          if (next) item.disliked = false
        } else {
          const next = !item.disliked
          item.disliked = next
          if (next) item.liked = false
        }
      }
      persistPreferences(updated)
      return updated
    })
  }

  const refreshDaySchedules = () => {
    setDaySchedules(getAllDaySchedules())
  }

  const persistPreferences = (cats: CategorySection[]) => {
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
  }

  const handleBack = () => {
    if (mode === 'dashboard' && onBack) {
      onBack()
    } else {
      router.visit('/tour/flight')
    }
  }

  const currentTourDays = formData.days || 1
  const selectedDaySchedule = useMemo(() => daySchedules[currentDay], [daySchedules, currentDay])
  const totalDays = formData.days || 1
  const allDaysCompleted = useMemo(() => {
    if (!totalDays) return false
    for (let day = 1; day <= totalDays; day += 1) {
      if (!daySchedules[day]) return false
    }
    return totalDays > 0
  }, [daySchedules, totalDays])

  const formatCost = (value: number | string | undefined) => {
    const numeric = typeof value === 'string' ? parseFloat(value) : value || 0
    return isNaN(numeric) ? '0.00' : numeric.toFixed(2)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getProgressLabel = (day: number) => {
    const isCompleted = !!daySchedules[day]
    const isCurrent = day === currentDay
    if (isCompleted) return language === 'vi' ? 'Đã khóa' : 'Completed'
    if (isCurrent) return language === 'vi' ? 'Đang chỉnh' : 'In progress'
    return language === 'vi' ? 'Chưa xử lý' : 'Pending'
  }

  const likedCount = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.items.filter((item) => item.liked).length, 0)
  }, [categories])

  const dislikedCount = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.items.filter((item) => item.disliked).length, 0)
  }, [categories])

  const buildSchedulePayload = () => {
    const likedItems = categories.flatMap((cat) =>
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

    const dislikedItems = categories.flatMap((cat) =>
      cat.items
        .filter((item) => item.disliked)
        .map((item) => ({
          type: likeTypeMap[cat.title as CategoryKey] || cat.title.toLowerCase(),
          id: item.id,
          place_id: item.place_id,
          name: item.name,
        }))
    )

    return {
      likedItems,
      dislikedItems,
      payload: {
        city_id: formData.city_id,
        city_name: formData.destination,
        currentDay,
        budget: formData.budget || 0,
        passengers: formData.passengers || 0,
        restaurants: categories
          .filter((cat) => cat.title === 'Restaurants')
          .flatMap((cat) => cat.items.map((item) => item.place_id?.toString() || '')),
        hotels: categories
          .filter((cat) => cat.title === 'Hotels')
          .flatMap((cat) => cat.items.map((item) => item.place_id?.toString() || '')),
        activities: categories
          .filter((cat) => cat.title === 'Recreation Places')
          .flatMap((cat) => cat.items.map((item) => item.place_id?.toString() || '')),
        transport: categories
          .filter((cat) => cat.title === 'Local Transport')
          .flatMap((cat) => cat.items.map((item) => item.name || '')),
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
        destination: formData.destination,
        departure: formData.departure,
        budget_total: formData.budget,
        passengers_total: formData.passengers,
        days: formData.days,
        departureDate: formData.departureDate,
        arrivalDate: formData.arrivalDate,
        moneyFlight: formData.moneyFlight,
      } as PlacesData,
    }
  }

  const persistDayPreferences = () => {
    const { likedItems, dislikedItems } = buildSchedulePayload()

    saveDayPreferences(currentDay, {
      preferences: categories.map((cat) => ({
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
      })),
      likedItems,
      dislikedItems,
    })

    return { likedItems, dislikedItems }
  }

  const handleContinue = async () => {
    const { payload } = buildSchedulePayload()
    persistDayPreferences()

    if (mode === 'dashboard') {
      try {
        setIsSaving(true)
        setFeedback(null)

        // Get CSRF token from meta tag
        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content
        
        if (!csrfToken) {
          throw new Error('CSRF token not found. Please refresh the page and try again.')
        }

        const response = await fetch('/tour/generate-schedule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            ...payload,
            dashboard_mode: true,
          }),
        })

        // Check if response is actually JSON
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Response content-type:', contentType)
          throw new Error('Server returned invalid response. Please check your connection and try again.')
        }

        const data = await response.json()

        if (!response.ok) {
          const errorMessage = data.message || `Server error: ${response.status}`
          throw new Error(errorMessage)
        }

        if (!data.success) {
          throw new Error(data.message || 'Failed to generate schedule')
        }

        const schedule = Array.isArray(data.scheduleData) ? data.scheduleData[0] : data.scheduleData
        if (schedule) {
          saveDaySchedule(currentDay, schedule)
          refreshDaySchedules()
        }

        setFeedback({
          type: 'success',
          message: language === 'vi' ? 'Đã tạo lịch trình cho ngày hiện tại.' : 'Schedule generated for this day.',
        })

        if (currentDay < totalDays) {
          handleContinueToNextDay(false)
        }
      } catch (error: any) {
        console.error('Error generating schedule:', error)
        const errorMsg = error?.message || 
          (language === 'vi' 
            ? 'Không thể tạo lịch trình. Vui lòng thử lại.' 
            : 'Unable to generate schedule. Please try again.')
        
        setFeedback({
          type: 'error',
          message: errorMsg,
        })
      } finally {
        setIsSaving(false)
      }

      return
    }
    try {
      await axios.post('/api/tour/save-user-preferences', payload)
    } catch (error) {
      console.log(error)
      
    }
    router.post('/tour/generate-schedule', payload as any)
  }

  const handleContinueToNextDay = async (persist = true) => {
    const { payload } = buildSchedulePayload()
    persistDayPreferences()
    console.log(payload)
    try{
      await axios.post('/api/tour/save-user-preferences', payload)
    }
    catch(error){
      console.error(error)
    }
    if (persist) {
      persistDayPreferences()
    }

    const nextDay = Math.min(currentDay + 1, totalDays)
    if (nextDay !== currentDay) {
      setCurrentDay(nextDay)
      setFeedback(null)
      setCategories([])
      setIsLoading(true)
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 0)
    }
  }

  const handleClearAll = () => {
    saveTourData({
      dayPreferences: {},
      daySchedules: {},
      currentDay: 1,
    })
    setDaySchedules({})
    setCategories([])
    setFeedback({
      type: 'success',
      message: language === 'vi' ? 'Đã xoá toàn bộ dữ liệu từng ngày.' : 'All day preferences and schedules were cleared.',
    })
    setCurrentDay(1)
    setIsLoading(true)
  }

  const handleGenerateFinalTour = async () => {
    const schedules = Object.keys(daySchedules)
      .map((dayKey) => Number(dayKey))
      .sort((a, b) => a - b)
      .map((day) => daySchedules[day])
      .filter(Boolean)

    if (!schedules.length) {
      setFeedback({
        type: 'error',
        message: language === 'vi' ? 'Chưa có lịch trình nào được tạo.' : 'No schedule available to generate final tour.',
      })
      return
    }

    const payload = {
      schedules,
      destination: formData.destination,
      departure: formData.departure,
      days: formData.days,
      budget: formData.budget,
      passengers: formData.passengers,
      selectedDepartureFlight: storedTourData?.selectedDepartureFlight,
      selectedReturnFlight: storedTourData?.selectedReturnFlight,
    }

    setIsGeneratingFinal(true)
    try {
      // Get CSRF token from meta tag
      const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content
      
      if (!csrfToken) {
        throw new Error('CSRF token not found. Please refresh the page and try again.')
      }

      const response = await fetch('/tour/generate-final', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify(payload),
      })

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response content-type:', contentType)
        throw new Error('Server returned invalid response. Please check your connection and try again.')
      }

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.message || `Server error: ${response.status}`
        throw new Error(errorMessage)
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to generate final tour')
      }

      const finalData = data.tourData || data.finalTourData

      setFeedback({
        type: 'success',
        message: language === 'vi' ? 'Đã tạo tour hoàn chỉnh!' : 'Final tour generated successfully!',
      })

      if (!finalData) {
        throw new Error(language === 'vi' ? 'Không nhận được dữ liệu tour' : 'No final tour data received')
      }

      // Show FinalTourModal in dashboard mode, or redirect in page mode
      if (mode === 'dashboard') {
        setFinalTourData(finalData)
        setShowFinalTourModal(true)
      } else {
        // Fallback to navigation for non-dashboard mode
        router.visit('/tour/final', { data: { tourData: finalData } })
      }
    } catch (error: any) {
      console.error('Error generating final tour:', error)
      setFeedback({
        type: 'error',
        message: error?.message || (language === 'vi' ? 'Không thể tạo tour hoàn chỉnh. Vui lòng thử lại.' : 'Unable to generate final tour. Please try again.'),
      })
    } finally {
      setIsGeneratingFinal(false)
    }
  }

  const renderPrimaryAction = () => {
    const hasSchedule = !!daySchedules[currentDay]
    const isLastDay = currentDay === totalDays

    if (isGeneratingFinal) {
      return (
        <button type="button" className="dashboard-preferences__primary" disabled>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{language === 'vi' ? 'Đang tạo tour cuối' : 'Generating final tour...'}</span>
        </button>
      )
    }

    if (isSaving) {
      return (
        <button type="button" className="dashboard-preferences__primary" disabled>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{language === 'vi' ? 'Đang xử lý...' : 'Processing...'}</span>
        </button>
      )
    }

    if (hasSchedule && isLastDay && allDaysCompleted) {
      return (
        <button type="button" className="dashboard-preferences__primary" onClick={handleGenerateFinalTour}>
          <span>{language === 'vi' ? 'Hoàn tất & tạo tour cuối' : 'Generate final tour'}</span>
          <Check className="w-5 h-5" />
        </button>
      )
    }

    if (hasSchedule && currentDay < totalDays) {
      return (
        <button type="button" className="dashboard-preferences__primary" onClick={() => handleContinueToNextDay()}>
          <span>{language === 'vi' ? 'Tiếp tục sang ngày kế' : 'Continue to next day'}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      )
    }

    return (
      <button type="button" className="dashboard-preferences__primary" onClick={handleContinue}>
        <span>{language === 'vi' ? 'Tiếp tục tạo lịch trình' : 'Continue to build schedule'}</span>
        <ChevronRight className="w-5 h-5" />
      </button>
    )
  }

  useEffect(() => {
    const loadDataForDay = async () => {
      if (!formData.destination) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      const storedPreferences = getDayPreferences(currentDay)
      if (storedPreferences?.preferences) {
        const rebuilt = rebuildCategoriesFromStorage(storedPreferences.preferences as CategorySection[])
        setCategories(rebuilt)
        setIsLoading(false)
        return
      }

      try {
        let cityId = formData.city_id
        if (!cityId && formData.destination) {
          const cityResponse = await fetch(`/api/city?search=${encodeURIComponent(formData.destination)}`)
          const cityData = await cityResponse.json()
          if (Array.isArray(cityData) && cityData.length > 0) {
            const exactMatch = cityData.find((c: any) => c.city === formData.destination || c.city_ascii === formData.destination)
            cityId = (exactMatch || cityData[0])._id
            saveTourData({ city_id: cityId })
            setFormData((prev) => ({ ...prev, city_id: cityId }))
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

        if (data.success) {
          const transformed = transformCategoriesFromApi(data.data)
          setCategories(transformed)
          saveDayPreferences(currentDay, {
            preferences: transformed,
            likedItems: [],
            dislikedItems: [],
          })
        }
      } catch (err) {
        console.error('Error fetching tour preferences:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadDataForDay()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDay, formData.destination, formData.city_id, formData.days, formData.budget, formData.passengers])

  useEffect(() => {
    setDaySchedules(getAllDaySchedules())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDay])

  return (
    <section id="dashboard-preferences" className="dashboard-preferences">
      <div className="dashboard-preferences__halo" aria-hidden="true" />
      <div className="dashboard-preferences__inner">
        <header className="dashboard-preferences__header">
          {feedback && (
            <div className={`dashboard-preferences__feedback is-${feedback.type}`}>
              {feedback.message}
            </div>
          )}
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
                    {formData.departureDate ? `${formatDate(formData.departureDate)} — ${formatDate(formData.arrivalDate || '')}` : '—'}
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
                    const schedule = daySchedules[day]
                    const isCompleted = !!schedule
                    const isCurrent = day === currentDay
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setCurrentDay(day)}
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

              {selectedDaySchedule ? (
                <div className="dashboard-preferences__schedule">
                  <h4>{language === 'vi' ? 'Tóm tắt lịch trong ngày' : 'Day schedule summary'}</h4>
                  {selectedDaySchedule.items?.length ? (
                    <ul>
                      {selectedDaySchedule.items.map((item: any) => (
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
                  ) : (
                    <p className="dashboard-preferences__schedule-empty">
                      {language === 'vi'
                        ? 'Ngày này chưa có lịch trình. Hãy nhấn Tiếp tục để tạo lịch trình.'
                        : 'No schedule saved for this day yet. Press Continue to build one.'}
                    </p>
                  )}
                  <footer>
                    <span>{language === 'vi' ? 'Tổng chi phí' : 'Total cost'}</span>
                    <strong>${formatCost(selectedDaySchedule.totalCost)}</strong>
                  </footer>
                </div>
              ) : (
                <div className="dashboard-preferences__schedule">
                  <h4>{language === 'vi' ? 'Tóm tắt lịch trong ngày' : 'Day schedule summary'}</h4>
                  <p className="dashboard-preferences__schedule-empty">
                    {language === 'vi'
                      ? 'Chưa có lịch trình cho ngày này.'
                      : 'No schedule available for this day yet.'}
                  </p>
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
                  <article
                    key={category.title}
                    className="dashboard-preferences__card"
                    role="region"
                    aria-label={`${category.title} suggestions`}
                    tabIndex={0}
                  >
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
                        onClick={() => {
                          setOpenSummaries(prev => prev.map((open, i) =>
                            i === categoryIndex ? !open : open
                          ));
                        }}
                      >
                        <ChevronRight className={`w-4 h-4 ${openSummaries[categoryIndex] ? 'rotate-90' : ''}`} />
                      </button>
                    </header>
                    {openSummaries[categoryIndex] && (
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
                    )}
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
                    {currentDay}/{totalDays}
                  </strong>
                </div>
              </div>
              <div className="dashboard-preferences__footer-actions">
                <button
                  type="button"
                  className="dashboard-preferences__ghost"
                  onClick={handleClearAll}
                  disabled={isSaving || isGeneratingFinal}
                >
                  <span>{language === 'vi' ? 'Reset toàn bộ' : 'Clear all days'}</span>
                </button>

                {renderPrimaryAction()}
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* Final Tour Modal */}
      <FinalTourModal
        tourData={finalTourData}
        isOpen={showFinalTourModal}
        onClose={() => {
          setShowFinalTourModal(false)
          setFinalTourData(null)
        }}
        language={language as 'vi' | 'en'}
        onBookTour={(tourData) => {
          const data_payment = {
            departure: tourData.departure,
            days: tourData.schedules?.length || 1,
            passengers: tourData.passengers,
            days_cost: tourData.schedules?.map((s) => s.totalCost) || [],
            total_cost:
              (tourData.schedules?.reduce((sum, s) => sum + s.totalCost, 0) || 0) +
              ((tourData?.selectedDepartureFlight?.price ?? 0) + (tourData?.selectedReturnFlight?.price ?? 0)),
            flight_cost: (tourData?.selectedDepartureFlight?.price ?? 0) + (tourData?.selectedReturnFlight?.price ?? 0),
            start_date: tourData.schedules?.[0]?.date?.split(',')[1]?.trim() || new Date().toISOString().split('T')[0],
            itinerary:
              tourData.schedules?.map((s) => ({
                day: s.day,
                date: s.date,
                completed: s.completed,
                totalCost: s.totalCost,
                hotel_id: s.items.filter((item) => item.type === 'hotel').map((item) => item.place_id),
                restaurants_id: s.items.filter((item) => item.type === 'meal').map((item) => item.place_id),
                activities_id: s.items.filter((item) => item.type === 'activity').map((item) => item.place_id),
                transportation_mode: s.items.filter((item) => item.type === 'transfer').map((item) => item.transport_mode),
              })) || [],
            flights: {
              selectedDepartureFlight: tourData.selectedDepartureFlight,
              selectedReturnFlight: tourData.selectedReturnFlight,
            },
            schedules:
              tourData.schedules?.map((s) => ({
                day: s.day,
                totalCost: s.totalCost,
                items: s.items.map((i) => ({
                  id: i.id,
                  place_id: i.place_id,
                  type: i.type,
                  startTime: i.startTime,
                  endTime: i.endTime,
                  title: i.title,
                  cost: i.cost,
                  transport_mode: i.transport_mode,
                })),
              })) || [],
          }

          router.post('/tour/save-tour-data', data_payment, {
            onSuccess: () => {
              setShowFinalTourModal(false)
              setFinalTourData(null)
            },
            onError: (errors) => {
              console.error('Error saving tour:', errors)
              setFeedback({
                type: 'error',
                message: language === 'vi' ? 'Không thể lưu dữ liệu tour' : 'Failed to save tour data',
              })
            },
          })
        }}
      />
    </section>
  )
}

export default PreferencesSection
