import React, { useState, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { DataTour } from '@/types/domain'
import { useToast } from '@/hooks/useToast'
import { router } from '@inertiajs/react'
import { useTourStorage } from '@/hooks/useTourStorage'
import '../../../css/dashboard.css'

interface FlightBookingSectionProps {
  tourData: Partial<DataTour>
  onBack: () => void
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

const mockFlights: Flight[] = [
  {
    id: 1,
    airline: 'Vietnam Airlines',
    airlineCode: 'VN',
    departTime: '09:15',
    arriveTime: '11:30',
    departCode: 'SGN',
    arriveCode: 'HAN',
    duration: '2h15m',
    type: 'Direct',
    price: 95.0,
  },
  {
    id: 2,
    airline: 'VietJet Air',
    airlineCode: 'VJ',
    departTime: '14:20',
    arriveTime: '17:05',
    departCode: 'SGN',
    arriveCode: 'HAN',
    duration: '2h45m',
    type: 'Direct',
    price: 120.0,
  },
  {
    id: 3,
    airline: 'Bamboo Airways',
    airlineCode: 'QH',
    departTime: '08:00',
    arriveTime: '10:50',
    departCode: 'SGN',
    arriveCode: 'HAN',
    duration: '2h50m',
    type: 'Direct',
    price: 110.0,
  },
]

export function FlightBookingSection({ tourData, onBack }: FlightBookingSectionProps) {
  const { language } = useAppStore()
  const { success, error } = useToast()
  const { saveFlightData } = useTourStorage()

  const [isDepartureFlightOpen, setIsDepartureFlightOpen] = useState(true)
  const [isReturnFlightOpen, setIsReturnFlightOpen] = useState(false)
  const [selectedDepartureFlight, setSelectedDepartureFlight] = useState<Flight | null>(null)
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<Flight | null>(null)
  const [isSummaryOpen, setIsSummaryOpen] = useState(true)

  const calculateDays = (departureDate: string, arrivalDate: string) => {
    if (!departureDate || !arrivalDate) return 0
    if (departureDate === arrivalDate) return 1
    const departure = new Date(departureDate)
    const arrival = new Date(arrivalDate)
    const diffTime = Math.abs(arrival.getTime() - departure.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1
  }

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
    router.post('/tour/preferences', updatedFormData)
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
                <div className="flight-booking__card-title">
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
                <div className="flight-booking__card-body">
                  {mockFlights.map((flight) => (
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
                  {mockFlights.map((flight) => (
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
