import { useMemo, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { DataTour } from '@/types/domain'
import { useToast } from '@/hooks/useToast'
import { router } from '@inertiajs/react'
import { useTourStorage } from '@/hooks/useTourStorage'
import '../../../css/dashboard.css'
import { useEffect } from 'react'
interface FlightBookingSectionProps {
  tourData: Partial<DataTour>
  onBack: () => void
  onConfirm?: (data: Partial<DataTour> & {
    selectedDepartureFlight: Flight
    selectedReturnFlight: Flight
  }) => void
}

interface Flight {
  id: number
  airline: string
  airlineCode: string
  departTime: string
  arriveTime: string
  departCode: string
  arriveCode: string
  duration: string
  type: string
  price: number
}

// Transform API response format into Flight[]
function parseFlightsFromApiResponse(apiResponse: any): Flight[] {
  if (!apiResponse || !apiResponse.success || !apiResponse.data) return []
  const groups = apiResponse.data as Record<string, any[]>
  const flights: Flight[] = []
  let idCounter = 1
  Object.keys(groups).forEach((airlineName) => {
    const list = Array.isArray(groups[airlineName]) ? groups[airlineName] : []
    list.forEach((item) => {
      const departDate = new Date(item.dep_time)
      const arriveDate = new Date(item.arr_time)
      const diffMs = Math.max(0, arriveDate.getTime() - departDate.getTime())
      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      const duration = `${hours}h${minutes.toString().padStart(2, '0')}m`
      const stopsCount = Array.isArray(item.stops) ? item.stops.length : 0
      const type = stopsCount === 0 ? 'Direct' : `${stopsCount} stop${stopsCount > 1 ? 's' : ''}`
      const airlineCode = typeof item.flight_code === 'string' ? item.flight_code.replace(/\d+.*/, '') : ''
      flights.push({
        id: idCounter++,
        airline: item.airline || airlineName,
        airlineCode,
        departTime: new Date(item.dep_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        arriveTime: new Date(item.arr_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        departCode: item.dep_iata || '',
        arriveCode: item.arr_iata || '',
        duration,
        type,
        price: Number(item.price) || 0,
      })
    })
  })
  return flights
}

export function FlightBookingSection({ tourData, onBack, onConfirm }: FlightBookingSectionProps) {
  const { language } = useAppStore()
  const { success, error } = useToast()
  const { saveFlightData } = useTourStorage()

  const [isDepartureFlightOpen, setIsDepartureFlightOpen] = useState(true)
  const [isReturnFlightOpen, setIsReturnFlightOpen] = useState(false)
  const [selectedDepartureFlight, setSelectedDepartureFlight] = useState<Flight | null>(null)
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<Flight | null>(null)
  const [isSummaryOpen, setIsSummaryOpen] = useState(true)
  const [loadingOutbound, setLoadingOutbound] = useState(false)
  const [loadingReturn, setLoadingReturn] = useState(false)
  const [outboundFlights, setOutboundFlights] = useState<Flight[]>([])
  const [returnFlights, setReturnFlights] = useState<Flight[]>([])

  const calculateDays = (departureDate: string, arrivalDate: string) => {
    if (!departureDate || !arrivalDate) return 0
    if (departureDate === arrivalDate) return 1
    const departure = new Date(departureDate)
    const arrival = new Date(arrivalDate)
    const diffTime = Math.abs(arrival.getTime() - departure.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1
  }

  useEffect(() => {
    if (!tourData.departure || !tourData.destination || !tourData.departureDate) return
    const data_outbound = {
      departure_city: tourData.departure,
      arrival_city: tourData.destination,
      departure_date: tourData.departureDate,
    }
    const data_return = {
      departure_city: tourData.destination,
      arrival_city: tourData.departure,
      departure_date: tourData.arrivalDate,
    }
    console.log('data_outbound:', data_outbound)
    console.log('data_return:', data_return)
    setLoadingOutbound(true)
    fetch("/api/flight/search", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data_outbound),
    })
      .then(async (response) => {
        console.log('📡 Response status:', response.status, response.statusText)
        let json
        try {
          json = await response.json()
        } catch (e) {
          console.warn('⚠️ Could not parse JSON response')
          throw new Error('Invalid JSON response')
        }
        console.log('🔍 Response JSON:', json)
        return json
      })
      .then((data) => {
        if (data.success) {
          const flights = parseFlightsFromApiResponse(data)
          setOutboundFlights(flights)
          success('Flight search success')
        } else {
          console.error('❌ Flight search error:', data.error)
          error(data.error || 'Flight search failed')
        }
      })
      .catch((err) => {
        console.error('🌩️ Network/Unexpected error fetching flights:', err)
        error('Network error while searching flights')
      })
      .finally(() => setLoadingOutbound(false))

    if (!tourData.arrivalDate) return
    setLoadingReturn(true)
    fetch("/api/flight/search", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data_return),
    })
      .then(async (response) => {
        console.log('📡 Response status:', response.status, response.statusText)
        let json
        try {
          json = await response.json()
        } catch (e) {
          console.warn('⚠️ Could not parse JSON response')
          throw new Error('Invalid JSON response')
        }
        console.log('🔍 Response JSON:', json)
        return json
      })
      .then((data) => {
        if (data.success) {
          const flights = parseFlightsFromApiResponse(data)
          setReturnFlights(flights)
          success('Flight search success')
        } else {
          console.error('❌ Flight search error:', data.error)
          error(data.error || 'Flight search failed')
        }
      })
      .catch((err) => {
        console.error('🌩️ Network/Unexpected error fetching flights:', err)
        error('Network error while searching flights')
      })
      .finally(() => setLoadingReturn(false))
  }, [tourData])

  const handleSubmit = () => {
    if (!selectedDepartureFlight || !selectedReturnFlight) {
      error(language === 'vi' ? 'Vui lòng chọn cả chuyến bay đi và về' : 'Please select both departure and return flights')
      return
    }
    
    const totalPrice = selectedDepartureFlight.price + selectedReturnFlight.price
    const departureDate = tourData.departureDate || ''
    const arrivalDate = tourData.arrivalDate || ''
    const days = calculateDays(departureDate, arrivalDate)

    if (days <= 1) {
      error(language === 'vi' ? 'Ngày khởi hành và ngày đến phải lớn hơn 1 ngày' : 'Departure and arrival dates must be greater than 1 day')
      return
    }

    const adults = Number(tourData.adults) || 0
    const children = Number(tourData.children) || 0
    const infants = Number(tourData.infants) || 0
    const passengers = adults + children + infants

    const updatedFormData = {
      ...tourData,
      moneyFlight: totalPrice,
      passengers,
      days,
      departureDate,
      arrivalDate,
      adults,
      children,
      infants,
    }

    saveFlightData({
      city_id: updatedFormData.city_id || '',
      departure: updatedFormData.departure || '',
      destination: updatedFormData.destination || '',
      departureDate,
      arrivalDate,
      budget: updatedFormData.budget || 0,
      adults,
      children,
      infants,
      passengers,
      days,
      moneyFlight: totalPrice,
      selectedDepartureFlight,
      selectedReturnFlight,
    })

    success(language === 'vi' ? 'Đặt vé thành công!' : 'Booking successful!')

    if (onConfirm) {
      onConfirm({
        ...updatedFormData,
        selectedDepartureFlight,
        selectedReturnFlight,
      })
    } else {
      router.post('/tour/preferences', updatedFormData)
    }
  }

  const totalPrice = useMemo(() => {
    return (selectedDepartureFlight?.price || 0) + (selectedReturnFlight?.price || 0)
  }, [selectedDepartureFlight, selectedReturnFlight])

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

  return (
    <section className="flight-booking">
      <div className="flight-booking__halo" aria-hidden="true" />
      <div className="flight-booking__inner">
        <header className="flight-booking__header">
          <button type="button" className="flight-booking__back" onClick={onBack}>
            <i className="fas fa-arrow-left" aria-hidden="true" />
            <span>{language === 'vi' ? 'Quay lại' : 'Back'}</span>
          </button>
          <span className="flight-booking__tag">{language === 'vi' ? 'Chọn chuyến bay' : 'Flight Selection'}</span>
          <h2 className="flight-booking__title">
            {language === 'vi' ? 'Đặt vé máy bay cho hành trình' : 'Book Your Flights'}
          </h2>
          <p className="flight-booking__subtitle">
            {language === 'vi'
              ? 'Chọn chuyến bay phù hợp nhất cho chuyến đi của bạn'
              : 'Select the perfect flights for your journey'}
          </p>
        </header>

        <div className="flight-booking__content">
          <div className="flight-booking__flights">
            {/* Departure Flight */}
            <div className="flight-booking__card flight-booking__card--departure">
              <div
                className="flight-booking__card-header"
                onClick={() => setIsDepartureFlightOpen(!isDepartureFlightOpen)}
              >
                <div className="flight-booking__card-title min-w-120">
                  <i className="fas fa-plane-departure" aria-hidden="true" />
                  <div>
                    <h3>{language === 'vi' ? 'Chuyến bay đi' : 'Departure Flight'}</h3>
                    <p>
                      {tourData.departure || 'Departure'} → {tourData.destination || 'Destination'}
                    </p>
                  </div>
                </div>
                <i className={`fas fa-chevron-${isDepartureFlightOpen ? 'up' : 'down'}`} aria-hidden="true" />
              </div>

              {isDepartureFlightOpen && (
                <div className="flight-booking__card-body" role="region" aria-label={language === 'vi' ? 'Danh sách chuyến bay đi' : 'Departure flights list'}>
                  {loadingOutbound && <p>{language === 'vi' ? 'Đang tải chuyến bay...' : 'Loading flights...'}</p>}
                  {!loadingOutbound && outboundFlights.length === 0 && (
                    <p className="flight-booking__summary-empty">{language === 'vi' ? 'Không có chuyến bay phù hợp' : 'No matching flights found'}</p>
                  )}
                  {!loadingOutbound && outboundFlights.map((flight) => (
                    <div
                      key={flight.id}
                      className={`flight-booking__flight ${
                        selectedDepartureFlight?.id === flight.id ? 'flight-booking__flight--selected' : ''
                      }`}
                    >
                      <div className="flight-booking__flight-info">
                        <div className="flight-booking__airline">
                          <span className="flight-booking__airline-code">{flight.airlineCode}</span>
                          <span className="flight-booking__airline-name">{flight.airline}</span>
                        </div>

                        <div className="flight-booking__schedule">
                          <div className="flight-booking__time">
                            <span className="flight-booking__time-value">{flight.departTime}</span>
                            <span className="flight-booking__time-code">{flight.departCode}</span>
                          </div>
                          <div className="flight-booking__duration">
                            <span>{flight.duration}</span>
                            <div className="flight-booking__line" />
                            <span>{flight.type}</span>
                          </div>
                          <div className="flight-booking__time">
                            <span className="flight-booking__time-value">{flight.arriveTime}</span>
                            <span className="flight-booking__time-code">{flight.arriveCode}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flight-booking__flight-actions">
                        <span className="flight-booking__price">${flight.price.toFixed(2)}</span>
                        <button
                          type="button"
                          className="flight-booking__select"
                          onClick={() => setSelectedDepartureFlight(flight)}
                        >
                          {selectedDepartureFlight?.id === flight.id ? (
                            <>
                              <i className="fas fa-check" aria-hidden="true" />
                              {language === 'vi' ? 'Đã chọn' : 'Selected'}
                            </>
                          ) : (
                            language === 'vi' ? 'Chọn' : 'Select'
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Return Flight */}
            <div className="flight-booking__card flight-booking__card--return">
              <div
                className="flight-booking__card-header"
                onClick={() => setIsReturnFlightOpen(!isReturnFlightOpen)}
              >
                <div className="flight-booking__card-title">
                  <i className="fas fa-plane-arrival" aria-hidden="true" />
                  <div>
                    <h3>{language === 'vi' ? 'Chuyến bay về' : 'Return Flight'}</h3>
                    <p>
                      {tourData.destination || 'Destination'} → {tourData.departure || 'Departure'}
                    </p>
                  </div>
                </div>
                <i className={`fas fa-chevron-${isReturnFlightOpen ? 'up' : 'down'}`} aria-hidden="true" />
              </div>

              {isReturnFlightOpen && (
                <div className="flight-booking__card-body">
                  {loadingReturn && <p>{language === 'vi' ? 'Đang tải chuyến bay...' : 'Loading flights...'}</p>}
                  {!loadingReturn && returnFlights.length === 0 && (
                    <p className="flight-booking__summary-empty">{language === 'vi' ? 'Không có chuyến bay phù hợp' : 'No matching flights found'}</p>
                  )}
                  {!loadingReturn && returnFlights.map((flight) => (
                    <div
                      key={flight.id}
                      className={`flight-booking__flight ${
                        selectedReturnFlight?.id === flight.id ? 'flight-booking__flight--selected' : ''
                      }`}
                    >
                      <div className="flight-booking__flight-info">
                        <div className="flight-booking__airline">
                          <span className="flight-booking__airline-code">{flight.airlineCode}</span>
                          <span className="flight-booking__airline-name">{flight.airline}</span>
                        </div>

                        <div className="flight-booking__schedule">
                          <div className="flight-booking__time">
                            <span className="flight-booking__time-value">{flight.departTime}</span>
                            <span className="flight-booking__time-code">{flight.arriveCode}</span>
                          </div>
                          <div className="flight-booking__duration">
                            <span>{flight.duration}</span>
                            <div className="flight-booking__line" />
                            <span>{flight.type}</span>
                          </div>
                          <div className="flight-booking__time">
                            <span className="flight-booking__time-value">{flight.arriveTime}</span>
                            <span className="flight-booking__time-code">{flight.departCode}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flight-booking__flight-actions">
                        <span className="flight-booking__price">${flight.price.toFixed(2)}</span>
                        <button
                          type="button"
                          className="flight-booking__select"
                          onClick={() => setSelectedReturnFlight(flight)}
                        >
                          {selectedReturnFlight?.id === flight.id ? (
                            <>
                              <i className="fas fa-check" aria-hidden="true" />
                              {language === 'vi' ? 'Đã chọn' : 'Selected'}
                            </>
                          ) : (
                            language === 'vi' ? 'Chọn' : 'Select'
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking Summary */}
          <div className="flight-booking__summary">
            <div className="flight-booking__summary-header" onClick={() => setIsSummaryOpen(!isSummaryOpen)}>
              <div>
                <i className="fas fa-file-invoice" aria-hidden="true" />
                <h3>{language === 'vi' ? 'Tóm tắt đặt vé' : 'Booking Summary'}</h3>
              </div>
              <i className={`fas fa-chevron-${isSummaryOpen ? 'up' : 'down'}`} aria-hidden="true" />
            </div>

            {isSummaryOpen && (
              <div className="flight-booking__summary-body">
                {/* Selected Flights */}
                <div className="flight-booking__summary-section">
                  <h4>{language === 'vi' ? 'Chuyến bay đã chọn' : 'Selected Flights'}</h4>
                  {selectedDepartureFlight && (
                    <div className="flight-booking__summary-item">
                      <span className="flight-booking__summary-label">
                        {language === 'vi' ? 'Chuyến đi' : 'Departure'} • {formatDate(tourData.departureDate || '')}
                      </span>
                      <span className="flight-booking__summary-value">
                        {selectedDepartureFlight.airline} • {selectedDepartureFlight.departTime}
                      </span>
                    </div>
                  )}
                  {selectedReturnFlight && (
                    <div className="flight-booking__summary-item">
                      <span className="flight-booking__summary-label">
                        {language === 'vi' ? 'Chuyến về' : 'Return'} • {formatDate(tourData.arrivalDate || '')}
                      </span>
                      <span className="flight-booking__summary-value">
                        {selectedReturnFlight.airline} • {selectedReturnFlight.departTime}
                      </span>
                    </div>
                  )}
                  {!selectedDepartureFlight && !selectedReturnFlight && (
                    <p className="flight-booking__summary-empty">
                      {language === 'vi' ? 'Chưa chọn chuyến bay nào' : 'No flights selected yet'}
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="flight-booking__summary-section">
                  <h4>{language === 'vi' ? 'Chi tiết giá' : 'Price Details'}</h4>
                  <div className="flight-booking__summary-item">
                    <span>{language === 'vi' ? 'Chuyến đi' : 'Departure flight'}</span>
                    <span>${selectedDepartureFlight?.price.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flight-booking__summary-item">
                    <span>{language === 'vi' ? 'Chuyến về' : 'Return flight'}</span>
                    <span>${selectedReturnFlight?.price.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flight-booking__summary-total">
                    <span>{language === 'vi' ? 'Tổng cộng' : 'Total'}</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  type="button"
                  className="flight-booking__confirm"
                  onClick={handleSubmit}
                  disabled={!selectedDepartureFlight || !selectedReturnFlight}
                >
                  {language === 'vi' ? 'Xác nhận đặt vé' : 'Confirm Booking'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
