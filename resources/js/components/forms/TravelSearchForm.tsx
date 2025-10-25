'use client'

import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
// import { TravelService } from '@/services/travel.service'
import { City, DataTour } from '@/types/domain'
import { Button } from '@/components/ui/Button_dashboard'
import { Dropdown } from 'primereact/dropdown';
import { useToast } from '@/hooks/useToast'
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import '../../../css/GuestSelectorDropdown.css'; // File CSS cho dropdown
import GuestCounter from '@/components/ui/GuestCounter'
import useOnClickOutside from '../../js/useOnClickOutside'; // Import custom hook
import { router } from '@inertiajs/react';

export function TravelSearchForm() {
  const { language, currency } = useAppStore()
  const { success, error } = useToast()

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [dates, setDates] = useState(null);
  const [cities, setCities] = useState<City[]>([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [isOpen, setIsOpen] = useState(false);
  const guestCounterRef = useRef<HTMLDivElement>(null);
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const totalGuests = adults + children;

  const [formData, setFormData] = useState<Partial<DataTour>>({
    departure: '',
    destination: '',
    departureDate: '',
    arrivalDate: '',
    budget: 0,
    adults: 0,
    children: 0,
    infants: 0,
  })
  useOnClickOutside(guestCounterRef, () => setIsOpen(false));

  const getDisplayText = () => {
    if (totalGuests === 0 && infants === 0) return "Add guests";

    let parts = [];
    if (totalGuests > 0) {
      parts.push(`${totalGuests} ${totalGuests > 1 ? 'guests' : 'guest'}`);
    }
    if (infants > 0) {
      parts.push(`${infants} ${infants > 1 ? 'infants' : 'infant'}`);
    }
    formData.adults = adults;
    formData.children = children;
    formData.infants = infants;
    return `${adults} Adults, ${children} Children, ${infants} Infants`;
  };
  const calculateDays = (departureDate: string, arrivalDate: string) => {
    if (!departureDate || !arrivalDate) return 0;
    if (departureDate == arrivalDate) return 1;
    const departure = new Date(departureDate);
    const arrival = new Date(arrivalDate);
    const diffTime = Math.abs(arrival.getTime() - departure.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1 ;
  }
  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true)
      try {
        const cities = await fetch('/api/cities').then(r => r.json());
        setCities(cities)
      } catch (err) {
        console.error('Error fetching cities:', err)
      } finally {
        setLoadingCities(false)
      }
    }
    fetchCities()
  }, [])

  const locationOptions = cities.map((city: City) => ({
    value: city.city.toString(),
    label: `${city.city}, ${city.country}`
  }))

  const handleDropdownChange = (field: keyof DataTour) => (e: any) => {
    setFormData(prev => ({ ...prev, [field]: e.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Format date thành yyyy-mm-dd để dễ parse
    const formatDate = (date: Date | string) => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`; // ISO format yyyy-mm-dd
    };
    const departureDate = dates && dates[0] ? formatDate(dates[0]) : '';
    const arrivalDate = dates && dates[1] ? formatDate(dates[1]) : '';
    if (!formData.departure || !formData.destination || !dates || !formData.budget || !formData.adults || !departureDate || !arrivalDate) {
      error(language === 'vi' ? 'Vui lòng điền đầy đủ thông tin bắt buộc' : 'Please fill all required fields')
      return
    }
    try {
      formData.departureDate = departureDate
      formData.arrivalDate = arrivalDate
      if (calculateDays(departureDate, arrivalDate) <= 1) {
        error(language === 'vi' ? 'Ngày khởi hành và ngày đến phải lớn hơn 1 ngày' : 'Departure date and arrival date must be greater than 1 day')
        return
      }
      router.post('/tour/flight', formData)
      success(language === 'vi' ? 'Tìm kiếm chuyến bay thành công!' : 'Flight search completed successfully!')
    } catch (err) {
      error(language === 'vi' ? 'Có lỗi xảy ra khi tìm kiếm' : 'An error occurred during search')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="travel-form-containerS text-gray-800">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
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
              showClear
              loading={loadingCities}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
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
              showClear
              loading={loadingCities}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              {language === 'vi' ? 'Ngày khởi hành - Ngày đến' : 'Departure date - Arrival date'}
            </label>
            <Calendar
              placeholder={language === 'vi' ? 'Ngày khởi hành' : 'Departure date - Arrival date'}
              selectionMode="range"
              value={dates}
              onChange={(e) => setDates(e.value as any)}
              readOnlyInput
              hideOnRangeSelection
              dateFormat="dd/mm/yy"
              minDate={new Date()}
              appendTo="self"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              {language === 'vi' ? 'Số tiền' : 'Budget'}
            </label>
            <InputNumber
              placeholder={language === 'vi' ? 'Số tiền' : 'Budget'}
              onChange={(e) => setFormData(prev => ({ ...prev, budget: e.value || 0 }))}
              max={100000}
              min={0}
              mode="currency"
              currency={currency}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 w-full">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              {language === 'vi' ? 'Số lượng người' : 'Number of Passengers'}
            </label>
            <div className="guest-selector-wrapper" ref={guestCounterRef}>
              <div className="selector-trigger" onClick={() => setIsOpen(!isOpen)}>
                <span>{getDisplayText()}</span>
                <span className={`arrow ${isOpen ? 'up' : 'down'}`}></span>
              </div>
              {isOpen && (
                <GuestCounter
                  adults={adults}
                  setAdults={setAdults}
                  children={children}
                  setChildren={setChildren}
                  infants={infants}
                  setInfants={setInfants}
                  onDone={() => setIsOpen(false)}
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSubmit}
          >
            {language === 'vi' ? 'Tiếp tục' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}
