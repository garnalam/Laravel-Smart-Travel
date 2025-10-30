'use client'

// 1. Thêm import cho useMemo, useCallback, NumericFormat
import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { City, DataTour } from '@/types/domain'
import { Button } from '@/components/ui/Button_dashboard'
import { Dropdown } from 'primereact/dropdown'
import { useToast } from '@/hooks/useToast'
import { Calendar } from 'primereact/calendar'
// import { InputNumber } from 'primereact/inputnumber' // 2. Xóa InputNumber
import '../../../css/GuestSelectorDropdown.css'
import GuestCounter from '@/components/ui/GuestCounter'
import useOnClickOutside from '../../js/useOnClickOutside'
import { router } from '@inertiajs/react'
import { InputText } from 'primereact/inputtext'
// Thay đổi dòng import này
import { NumericFormat, NumberFormatValues } from 'react-number-format'
// 3. Chuyển các hàm thuần túy ra ngoài component
// Chúng không cần phải được tạo lại mỗi lần render
const formatDate = (date: Date | string) => {
  if (!date) return ''
  const current = new Date(date)
  const year = current.getFullYear()
  const month = String(current.getMonth() + 1).padStart(2, '0')
  const day = String(current.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const calculateDays = (departureDate: string, arrivalDate: string) => {
  if (!departureDate || !arrivalDate) return 0
  const departure = new Date(departureDate)
  const arrival = new Date(arrivalDate)
  const diffTime = Math.abs(arrival.getTime() - departure.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1
}

interface TravelSearchFormProps {
  onShowFlightBooking?: (data: any) => void
}

export function TravelSearchForm({ onShowFlightBooking }: TravelSearchFormProps) {
  console.log('🟡 [TravelSearchForm] Component được render với callback:', !!onShowFlightBooking, typeof onShowFlightBooking)
  const { language, currency } = useAppStore()
  const { success, error } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [dates, setDates] = useState<any>(null)
  const [cities, setCities] = useState<City[]>([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [isGuestOpen, setIsGuestOpen] = useState(false)
  const guestCounterRef = useRef<HTMLDivElement>(null)

  // 4. Xóa 3 state riêng lẻ
  // const [adults, setAdults] = useState(0)
  // const [children, setChildren] = useState(0)
  // const [infants, setInfants] = useState(0)

  const [formData, setFormData] = useState<Partial<DataTour>>({
    departure: '',
    destination: '',
    departureDate: '', // Những cái này sẽ được set trong handleSubmit
    arrivalDate: '', // Những cái này sẽ được set trong handleSubmit
    budget: undefined, // Dùng undefined cho ô trống
    adults: 0,
    children: 0,
    infants: 0,
  })

  useOnClickOutside(guestCounterRef, () => setIsGuestOpen(false))

  // 5. Xóa useEffect đồng bộ state (anti-pattern)
  // useEffect(() => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     adults,
  //     children,
  //     infants,
  //   }))
  // }, [adults, children, infants])

  // 6. Tạo các hàm setter được memoize để truyền cho GuestCounter
  const setAdults = useCallback((value: number | ((prev: number) => number)) => {
    setFormData(prev => ({
      ...prev,
      adults: typeof value === 'function' ? value(prev.adults ?? 0) : value
    }))
  }, [])

  const setChildren = useCallback((value: number | ((prev: number) => number)) => {
    setFormData(prev => ({
      ...prev,
      children: typeof value === 'function' ? value(prev.children ?? 0) : value
    }))
  }, [])

  const setInfants = useCallback((value: number | ((prev: number) => number)) => {
    setFormData(prev => ({
      ...prev,
      infants: typeof value === 'function' ? value(prev.infants ?? 0) : value
    }))
  }, [])

  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true)
      try {
        const response = await fetch('/api/cities')
        const data = await response.json()
        setCities(data)
      } catch (err) {
        console.error('Error fetching cities:', err)
      } finally {
        setLoadingCities(false)
      }
    }

    fetchCities()
  }, [])

  // 7. Memoize các giá trị tính toán
  const locationOptions = useMemo(() => cities.map((city: City) => ({
    value: city.city,
    label: `${city.city}, ${city.country}`,
    id: city.id,
    country: city.country,
  })), [cities]) // Thêm id/country vào option

  const handleDropdownChange = useCallback((field: keyof DataTour) => (event: any) => {
    if (field === 'destination') {
      const selectedCity = cities.find(city => city.city === event.value)
      setFormData((prev) => ({
        ...prev,
        destination: event.value,
        city_id: selectedCity ? selectedCity.id : undefined,
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: event.value }))
    }
  }, [cities]); // Memo lại khi cities thay đổi

  const renderGuestLabel = useCallback(() => {
    // 8. Đọc state trực tiếp từ formData
    const totalGuests = (formData.adults ?? 0) + (formData.children ?? 0)
    const numInfants = formData.infants ?? 0

    if (totalGuests === 0 && numInfants === 0) {
      return language === 'vi' ? 'Thêm hành khách' : 'Add guests'
    }

    const guestLabel = `${totalGuests} ${totalGuests > 1
      ? language === 'vi'
        ? 'khách'
        : 'guests'
      : language === 'vi'
        ? 'khách'
        : 'guest'
      }`
    const infantLabel =
      numInfants > 0
        ? `, ${numInfants} ${numInfants > 1
          ? language === 'vi'
            ? 'trẻ nhỏ'
            : 'infants'
          : language === 'vi'
            ? 'trẻ nhỏ'
            : 'infant'
        }`
        : ''

    return `${guestLabel}${infantLabel}`
  }, [formData.adults, formData.children, formData.infants, language]) // Chỉ tạo lại hàm khi state liên quan thay đổi

  const handleSubmit = useCallback(async () => {
    const departureDate = dates && dates[0] ? formatDate(dates[0]) : ''
    const arrivalDate = dates && dates[1] ? formatDate(dates[1]) : ''

    if (
      !formData.departure ||
      !formData.destination ||
      !departureDate ||
      !arrivalDate ||
      !formData.budget || // Vẫn kiểm tra budget
      !formData.adults // Đọc từ formData
    ) {
      error(
        language === 'vi'
          ? 'Vui lòng điền đầy đủ thông tin bắt buộc'
          : 'Please fill all required fields'
      )
      return
    }

    if (calculateDays(departureDate, arrivalDate) <= 1) {
      error(
        language === 'vi'
          ? 'Ngày khởi hành và ngày đến phải lớn hơn 1 ngày'
          : 'Departure and arrival dates must span at least two days'
      )
      return
    }

    setIsLoading(true)

    try {
      const dataToSend = {
        ...formData,
        departureDate,
        arrivalDate,
      }


      if (onShowFlightBooking) {
        // Use callback instead of routing

        onShowFlightBooking(dataToSend)
        success(
          language === 'vi'
            ? 'Tìm kiếm chuyến đi thành công!'
            : 'Journey search completed successfully!'
        )
      } else {
        // Fallback to routing if no callback
        console.log('🔴 [TravelSearchForm] Không có callback, sử dụng router.post')
        router.post('/tour/flight', dataToSend)
        success(
          language === 'vi'
            ? 'Tìm kiếm chuyến đi thành công!'
            : 'Journey search completed successfully!'
        )
      }
    } catch (err) {
      error(language === 'vi' ? 'Có lỗi xảy ra khi tìm kiếm' : 'An error occurred during search')
    } finally {
      setIsLoading(false)
    }
  }, [dates, formData, language, error, success, onShowFlightBooking]) // Thêm dependencies cho useCallback

  const locale = language === 'vi' ? 'vi-VN' : 'en-US'

  // 9. Memoize các giá trị tóm tắt
  const dateSummary = useMemo(() => {
    if (!dates || !dates[0] || !dates[1]) {
      return language === 'vi' ? 'Chưa chọn ngày' : 'Awaiting selection'
    }

    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' }
    const start = new Date(dates[0])
    const end = new Date(dates[1])

    return `${start.toLocaleDateString(locale, options)} — ${end.toLocaleDateString(locale, options)}`
  }, [dates, language, locale])

  const travellersSummary = useMemo(() => {
    // 10. Đọc state trực tiếp từ formData
    const travellers = (formData.adults ?? 0) + (formData.children ?? 0)
    const numInfants = formData.infants ?? 0

    if (travellers === 0 && numInfants === 0) {
      return language === 'vi' ? 'Chưa thêm khách' : 'No guests added'
    }

    const base = language === 'vi'
      ? `${travellers} ${travellers === 1 ? 'khách' : 'khách'}`
      : `${travellers} ${travellers === 1 ? 'guest' : 'guests'}`

    if (numInfants > 0) {
      const infantLabel = language === 'vi'
        ? `${numInfants} ${numInfants === 1 ? 'trẻ nhỏ' : 'trẻ nhỏ'}`
        : `${numInfants} ${numInfants === 1 ? 'infant' : 'infants'}`
      return `${base} · ${infantLabel}`
    }

    return base
  }, [formData.adults, formData.children, formData.infants, language])

  const budgetSummary = useMemo(() => {
    if (formData.budget && formData.budget > 0) {
      try {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          maximumFractionDigits: currency === 'VND' ? 0 : 2,
        }).format(formData.budget)
      } catch (error) {
        console.error('Error formatting budget:', error)
        return `${formData.budget.toLocaleString(locale)} ${currency}`
      }
    }

    return language === 'vi' ? 'Chưa đặt ngân sách' : 'Budget pending'
  }, [formData.budget, currency, language, locale])

  return (
    <section className="travel-search">
      {/* ... (Phần header không đổi) ... */}
      <div className="travel-search__halo" aria-hidden="true" />
      <div className="travel-search__inner">
        <header className="travel-search__header">
          <span className="travel-search__tag">
            {language === 'vi' ? 'Chỉnh chu hành trình' : 'Curated journey builder'}
          </span>
          <h2 className="travel-search__title">
            {language === 'vi'
              ? 'Cá nhân hóa chuyến đi đẳng cấp của bạn'
              : 'Craft your signature journey'}
          </h2>
          <p className="travel-search__subtitle">
            {language === 'vi'
              ? 'Chọn tuyến đường, thời gian và mức đầu tư để chúng tôi tạo nên trải nghiệm sang trọng đúng gu của bạn.'
              : 'Define routes, travel window and investment so we can choreograph a bespoke escape in your style.'}
          </p>
        </header>

        <div className="travel-search__panels">
          {/* ... (Phần Card 1 - Lộ trình không đổi) ... */}
          <div className="travel-search__card travel-search__card--primary">
            <div className="travel-search__card-header">
              <span className="travel-search__card-step">
                {language === 'vi' ? 'Mốc 01' : 'Chapter 01'}
              </span>
              <h3>
                {language === 'vi'
                  ? 'Lộ trình và lịch trình mong muốn'
                  : 'Route & preferred schedule'}
              </h3>
              <p>
                {language === 'vi'
                  ? 'Chúng tôi kết nối những điểm dừng tinh tế của bạn và cân đối từng khoảnh khắc lưu trú.'
                  : 'We connect every crafted stop while balancing each moment across your stay.'}
              </p>
            </div>

            <div className="travel-search__grid travel-search__grid--two">
              <div className="travel-search__field dashboard-form__field">
                <label className="dashboard-form__label">
                  {language === 'vi' ? 'Điểm khởi hành *' : 'Departure *'}
                </label>
                <Dropdown
                  value={formData.departure || ''}
                  onChange={handleDropdownChange('departure')}
                  options={locationOptions}
                  optionLabel="label"
                  optionValue="value"
                  placeholder={language === 'vi' ? 'Tìm kiếm điểm khởi hành...' : 'Search departure...'}
                  filter
                  showClear={false}
                  loading={loadingCities}
                  className="dashboard-form__prime"
                  panelClassName="dashboard-form__prime-panel"
                />
              </div>

              <div className="travel-search__field dashboard-form__field">
                <label className="dashboard-form__label">
                  {language === 'vi' ? 'Điểm đến *' : 'Destination *'}
                </label>
                <Dropdown
                  value={formData.destination || ''}
                  onChange={handleDropdownChange('destination')}
                  options={locationOptions}
                  optionLabel="label"
                  optionValue="value"
                  placeholder={language === 'vi' ? 'Tìm kiếm điểm đến...' : 'Search destination...'}
                  filter
                  showClear={false}
                  loading={loadingCities}
                  className="dashboard-form__prime"
                  panelClassName="dashboard-form__prime-panel"
                />
              </div>
            </div>

            <div className="travel-search__field travel-search__field--full dashboard-form__field">
              <label className="dashboard-form__label">
                {language === 'vi' ? 'Ngày khởi hành - Ngày đến' : 'Departure - Arrival dates'}
              </label>
              <Calendar
                placeholder={language === 'vi' ? 'Chọn khoảng ngày...' : 'Select your date range...'}
                selectionMode="range"
                value={dates}
                onChange={(event) => setDates(event.value as any)}
                readOnlyInput
                hideOnRangeSelection
                dateFormat="dd/mm/yy"
                minDate={new Date()}
                appendTo="self"
                className="dashboard-form__prime"
              />
            </div>

            <Button

              onClick={handleSubmit}

              isLoading={isLoading}

              disabled={isLoading}

              className="travel-search__button"

            >

              {language === 'vi' ? 'Tạo lịch trình' : 'Build itinerary'}

            </Button>
          </div>

          <div className="travel-search__card travel-search__card--secondary">
            {/* ... (Phần header Card 2 không đổi) ... */}
            <div className="travel-search__card-header">
              <span className="travel-search__card-step">
                {language === 'vi' ? 'Mốc 02' : 'Chapter 02'}
              </span>
              <h3>
                {language === 'vi'
                  ? 'Ngân sách và nhóm khách đồng hành'
                  : 'Investment & travel party'}
              </h3>
              <p>
                {language === 'vi'
                  ? 'Điều chỉnh ngân sách dự kiến và số lượng khách để chúng tôi cá nhân hóa dịch vụ.'
                  : 'Refine the planned investment and company so every service feels personal.'}
              </p>
            </div>

            <div className="travel-search__grid travel-search__grid--two travel-search__grid--balanced">

              {/* 11. BẮT ĐẦU THAY THẾ CHO INPUTNUMBER */}
              <div className="travel-search__field dashboard-form__field">
                <label className="dashboard-form__label">
                  {language === 'vi' ? 'Ngân sách mong muốn' : 'Preferred budget'}
                </label>
                <NumericFormat
                  customInput={InputText}
                  className="dashboard-form__prime"
                  placeholder={language === 'vi' ? 'Nhập ngân sách...' : 'Enter your budget...'}
                  value={formData.budget || ''}

                  // THÊM KIỂU DỮ LIỆU TẠI ĐÂY
                  onValueChange={(values: NumberFormatValues) => {
                    setFormData((prev) => ({ ...prev, budget: values.floatValue || 0 }))
                  }}

                  thousandSeparator={language === 'vi' ? '.' : ','}
                  decimalSeparator={language === 'vi' ? ',' : '.'}
                  suffix={currency === 'VND' ? ' ₫' : (currency === 'USD' ? ' $' : ` ${currency}`)}
                  allowNegative={false}
                />
              </div>
              {/* KẾT THÚC THAY THẾ */}

              <div className="travel-search__field travel-search__field--guests dashboard-form__field">
                <label className="dashboard-form__label">
                  {language === 'vi' ? 'Số lượng hành khách' : 'Travelers'}
                </label>
                <div className="guest-selector" ref={guestCounterRef}>
                  <button
                    type="button"
                    className="guest-selector__trigger"
                    onClick={() => setIsGuestOpen((prev) => !prev)}
                  >
                    {/* 12. Hàm này đã được memoize */}
                    <span>{renderGuestLabel()}</span>
                    <i className={`fas fa-chevron-${isGuestOpen ? 'up' : 'down'}`} aria-hidden="true" />
                  </button>
                  {isGuestOpen && (
                    <GuestCounter
                      // 13. Đọc state từ formData và truyền hàm setter mới
                      adults={formData.adults ?? 0}
                      setAdults={setAdults}
                      children={formData.children ?? 0}
                      setChildren={setChildren}
                      infants={formData.infants ?? 0}
                      setInfants={setInfants}
                      onDone={() => setIsGuestOpen(false)}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="travel-search__meta">
              <div>
                <span className="travel-search__meta-label">
                  {language === 'vi' ? 'Khoảng thời gian' : 'Time frame'}
                </span>
                {/* 14. Các giá trị tóm tắt này đã được memoize */}
                <span className="travel-search__meta-value">{dateSummary}</span>
              </div>
              <div>
                <span className="travel-search__meta-label">
                  {language === 'vi' ? 'Nhóm khách' : 'Travel party'}
                </span>
                <span className="travel-search__meta-value">{travellersSummary}</span>
              </div>
              <div>
                <span className="travel-search__meta-label">
                  {language === 'vi' ? 'Ngân sách dự kiến' : 'Planned budget'}
                </span>
                <span className="travel-search__meta-value">{budgetSummary}</span>
              </div>
            </div>


          </div>
        </div>
      </div>
    </section>
  )
}
