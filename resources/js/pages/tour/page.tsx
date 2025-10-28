import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, MapPin, Users, DollarSign, Plane, Star, Eye, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Navbar } from '../../components/common/Navbar';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import '../../../css/GuestSelectorDropdown.css'; // File CSS cho dropdown\
import '../../../css/app.css'; // File CSS cho dropdown
import '../../../css/dashboard.css'; // File CSS cho dropdown
import { DataTour, City } from '@/types/domain';
import { Dropdown } from 'primereact/dropdown';
import GuestCounter from '@/components/ui/GuestCounter';
import useOnClickOutside from '../../js/useOnClickOutside';
import { useToast } from '@/hooks/useToast';
import { router, usePage } from '@inertiajs/react';
import { useTourStorage } from '../../hooks/useTourStorage';

export default function TravelDashboard() {
  const { success, error } = useToast()
  const { props } = usePage<{ tourData?: Partial<DataTour> }>()
  const { saveFlightData, tourData: storedTourData, loadTourData } = useTourStorage();
  const [budget, setBudget] = useState(0);
  const [passengers, setPassengers] = useState(1);

  const [dates, setDates] = useState<Date[] | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const guestCounterRef = useRef<HTMLDivElement>(null);
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [selectedFlight, setSelectedFlight] = useState(false);
  const [outboundFlights, setOutboundFlights] = useState<any[]>([]);
  const [returnFlights, setReturnFlights] = useState<any[]>([]);
  const [isDepartureFlightOpen, setIsDepartureFlightOpen] = useState(false);
  const [selectedDepartureFlight, setSelectedDepartureFlight] = useState<any>(null);
  const [isReturnFlightOpen, setIsReturnFlightOpen] = useState(false);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<any>(null);
  const [isFlightSummaryOpen, setIsFlightSummaryOpen] = useState(false);
  const totalGuests = adults + children;
  const [formData, setFormData] = useState<Partial<DataTour>>({
    city_id: '',
    departure: '',
    destination: '',
    departureDate: '',
    arrivalDate: '',
    budget: 0,
    days: 0,
    moneyFlight: 0,
    passengers: 0,
    adults: 0,
    children: 0,
    infants: 0,
  })

  // Helpers to map API flights to UI model
  const formatTime = (iso?: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }
  const diffDuration = (startIso?: string, endIso?: string) => {
    if (!startIso || !endIso) return ''
    const start = new Date(startIso).getTime()
    const end = new Date(endIso).getTime()
    const mins = Math.max(0, Math.round((end - start) / 60000))
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h${m.toString().padStart(2, '0')}m`
  }
  const mapApiFlightToUI = (f: any, idx: number) => {
    const airlineCode = (f.flight_code || '').slice(0, 2) || (f.airline || '?').slice(0, 2)
    return {
      id: `${f.flight_code || 'FL'}_${idx}`,
      airline: f.airline,
      airlineCode,
      departTime: formatTime(f.dep_time),
      arriveTime: formatTime(f.arr_time),
      departCode: f.dep_iata,
      arriveCode: f.arr_iata,
      duration: diffDuration(f.dep_time, f.arr_time),
      type: Array.isArray(f.stops) && f.stops.length > 0 ? `${f.stops.length} stop${f.stops.length > 1 ? 's' : ''}` : 'Direct',
      price: Number(f.price || 0),
      raw: f,
    }
  }
  const flattenGroupedFlights = (grouped: any) => {
    if (!grouped || typeof grouped !== 'object') return []
    const all = Object.values(grouped).flat() as any[]
    return all.map((f, i) => mapApiFlightToUI(f, i))
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

  // Lấy tourData từ props hoặc localStorage
  useEffect(() => {
    // Priority: props.tourData > localStorage
    let dataToLoad: Partial<DataTour> | undefined;
    
    if (props.tourData && Object.keys(props.tourData).length > 0) {
      // Load from props and ensure all fields are properly set
      dataToLoad = {
        city_id: props.tourData.city_id || storedTourData?.city_id || '',
        departure: props.tourData.departure,
        destination: props.tourData.destination,
        departureDate: props.tourData.departureDate,
        arrivalDate: props.tourData.arrivalDate,
        budget: props.tourData.budget,
        adults: props.tourData.adults,
        children: props.tourData.children,
        infants: props.tourData.infants,
        passengers: props.tourData.passengers,
        days: props.tourData.days,
        moneyFlight: props.tourData.moneyFlight,
      };
    } else if (storedTourData) {
      // Load from localStorage if no props data
      dataToLoad = {
        city_id: storedTourData.city_id,
        departure: storedTourData.departure,
        destination: storedTourData.destination,
        departureDate: storedTourData.departureDate,
        arrivalDate: storedTourData.arrivalDate,
        budget: storedTourData.budget,
        adults: storedTourData.adults,
        children: storedTourData.children,
        infants: storedTourData.infants,
        passengers: storedTourData.passengers,
        days: storedTourData.days,
        moneyFlight: storedTourData.moneyFlight,
      };
    }
    
    if (dataToLoad) {
      // If city_id is missing but destination exists, try to find it from cities list
      if (!dataToLoad.city_id && dataToLoad.destination && cities.length > 0) {
        const destinationCity = cities.find(city => city.city === dataToLoad.destination);
        if (destinationCity) {
          dataToLoad.city_id = destinationCity.id;
          console.log('🔍 Found city_id for destination:', destinationCity.id);
        }
      }
      
      setFormData(dataToLoad);

      // Cập nhật các state khác
      if (dataToLoad.budget) {
        setBudget(dataToLoad.budget);
      }
      if (dataToLoad.adults) {
        setAdults(dataToLoad.adults);
      }
      if (dataToLoad.children) {
        setChildren(dataToLoad.children);
      }
      if (dataToLoad.infants) {
        setInfants(dataToLoad.infants);
      }
      if (dataToLoad.departureDate && dataToLoad.arrivalDate) {
        setDates([new Date(dataToLoad.departureDate), new Date(dataToLoad.arrivalDate)]);
      }
      
      // Restore selected flights if available
      if (storedTourData?.selectedDepartureFlight) {
        setSelectedDepartureFlight(storedTourData.selectedDepartureFlight);
      }
      if (storedTourData?.selectedReturnFlight) {
        setSelectedReturnFlight(storedTourData.selectedReturnFlight);
      }
    }
  }, [props.tourData, storedTourData, cities]);


  const handleDropdownChange = (field: keyof DataTour) => (e: any) => {
    setFormData(prev => ({ ...prev, [field]: e.value }))
  }
  
  // Custom handler for destination to save city_id
  const handleDestinationChange = (e: any) => {
    const selectedCity = cities.find(city => city.city === e.value);
    setFormData(prev => ({ 
      ...prev, 
      destination: e.value,
      city_id: selectedCity?.id || ''
    }));
  }
  
  const locationOptions = cities.map((city: City) => ({
    value: city.city.toString(),
    label: `${city.city}, ${city.country}`
  }))
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
  const handleBudgetChange = (budget: number) => {
    setBudget(budget);
    setFormData(prev => ({ ...prev, budget: budget }));
  }
  const calculateDays = (departureDate: string, arrivalDate: string) => {
    if (!departureDate || !arrivalDate) return 0;
    if (departureDate == arrivalDate) return 1;
    const departure = new Date(departureDate);
    const arrival = new Date(arrivalDate);
    const diffTime = Math.abs(arrival.getTime() - departure.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1 ;
  }
  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();

    // Format date thành yyyy-mm-dd
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

    if(calculateDays(departureDate, arrivalDate) <= 1){
      return error('Departure date and arrival date must be greater than 1 day');
    }
    if (
      !formData.departure ||
      !formData.destination ||
      !departureDate ||
      !arrivalDate ||
      !formData.budget ||
      !formData.adults
    ) {
      error('Please fill all required fields');
      return;
    }
    
    // Cập nhật formData với tất cả thông tin
    setFormData(prev => ({
      ...prev,
      budget: budget,
      adults: adults,
      children: children,
      infants: infants,
      departureDate: departureDate,
      arrivalDate: arrivalDate
    }));
    const data_outbound = {
      departure_city: formData.departure,
      arrival_city: formData.destination,
      departure_date: departureDate,
    }
    const data_return = {
      departure_city: formData.destination,
      arrival_city: formData.departure,
      departure_date: arrivalDate,
    }

    console.group('✈️ Flight Search Request')
    console.log('data_outbound:', data_outbound)
    console.log('data_return:', data_return)
    console.groupEnd()

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
          setSelectedFlight(data.data)
          setOutboundFlights(flattenGroupedFlights(data.data))
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
          setSelectedFlight(data.data)
          setReturnFlights(flattenGroupedFlights(data.data))
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
    // setSelectedFlight(true)
    // success('Form submitted successfully')
  }
  const submitFormTour = (e: React.FormEvent) => {
    e.preventDefault();
    const totalPrice = (selectedDepartureFlight?.price || 0) + (selectedReturnFlight?.price || 0);

    // Ensure that departureDate and arrivalDate are both defined strings before calling calculateDays
    const departureDate = formData.departureDate || '';
    const arrivalDate = formData.arrivalDate || '';
    const days = (departureDate && arrivalDate) ? calculateDays(departureDate, arrivalDate) : 0;
    if (days <=1 ){
      return error('Departure date and arrival date must be greater than 1 day');
    }
    // Safely handle possible undefined values and correct passenger calculation
    const adults = Number(formData.adults) || 0;
    const children = Number(formData.children) || 0;
    const infants = Number(formData.infants) || 0;
    const passengers = adults + children + infants;
    console.log('Passengers:', passengers);

    const updatedFormData = {
      ...formData,
      moneyFlight: totalPrice ? totalPrice : 0,
      passengers,
      days,
      departureDate,
      arrivalDate,
      adults,
      children,
      infants,
    };

    // Save to localStorage
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
    });

    console.log('Current formData:', updatedFormData);
    console.log('Saved to localStorage');
    success('Form submitted successfully');
    router.post('/tour/preferences', updatedFormData)
  }
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Advanced Personalized Tour Planning */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">✓</div>
              <h2 className="text-2xl font-bold text-gray-900">Advanced Personalized Tour Planning</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Tell us your preferences and we'll create the perfect itinerary for you
            </p>

            {/* Travel Route + Dates Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Travel Route */}
              <div className="bg-blue-50 rounded-lg p-4 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Travel Route</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Departure City *</label>
                    <Dropdown
                      value={formData.departure || ''}
                      onChange={handleDropdownChange('departure')}
                      options={locationOptions}
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Search departure..."
                      filter
                      showClear
                      loading={loadingCities}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Destination City *</label>
                    <Dropdown
                      value={formData.destination || ''}
                      onChange={handleDestinationChange}
                      options={locationOptions}
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Search destination..."
                      filter
                      showClear
                      loading={loadingCities}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              {/* Dates */}
              <div className="bg-blue-50 rounded-lg p-4 flex flex-col justify-center">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Departure date - Arrival date
                </label>
                <Calendar
                  placeholder="Departure date - Arrival date"
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
            </div>
            {/* Travelers and Budget (Row) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10 text-gray-700">
              {/* Travelers */}
              <div className="bg-orange-50 rounded-2xl px-10 py-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Users className="w-7 h-7 text-orange-600" />
                    <h3 className="font-bold text-lg text-gray-900">Travelers Information</h3>
                  </div>
                  <div className="flex flex-col gap-4">
                    <label className="text-base font-semibold text-gray-700">
                      Number of Passengers
                    </label>
                    <div className="guest-selector-wrapper mt-2" ref={guestCounterRef}>
                      <div
                        className="selector-trigger flex items-center justify-between bg-white px-5 py-3 rounded-lg border border-orange-300 cursor-pointer shadow-sm min-h-[54px]"
                        onClick={() => setIsOpen(!isOpen)}
                      >
                        <span className="font-medium text-gray-900">{getDisplayText()}</span>
                        <span className={`arrow ml-4 ${isOpen ? "up" : "down"}`}></span>
                      </div>
                      {isOpen && (
                        <div className="mt-4">
                          <GuestCounter
                            adults={adults}
                            setAdults={setAdults}
                            children={children}
                            setChildren={setChildren}
                            infants={infants}
                            setInfants={setInfants}
                            onDone={() => setIsOpen(false)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Budget Planning */}
              <div className="bg-pink-50 rounded-2xl px-10 py-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <DollarSign className="w-7 h-7 text-pink-600" />
                    <h3 className="font-bold text-lg text-gray-900">Budget Planning &amp; Estimate</h3>
                  </div>
                  <label className="block text-base font-semibold text-gray-700 mb-5">
                    Total Budget <span className="text-xs text-pink-500 font-normal">*</span>
                  </label>
                  <div className="flex gap-4 items-center mb-4">
                    <div className="relative flex-1">
                      <InputNumber
                        placeholder="Type budget here..."
                        value={budget}
                        onChange={(e) => handleBudgetChange(e.value || 0)}
                        max={100000}
                        min={0}
                        mode="currency"
                        currency="USD"
                        className="w-full text-lg font-semibold rounded-md bg-white border-pink-200"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-5 text-xs">
                    <button className="px-4 py-2 bg-red-100 text-red-600 rounded-full font-medium hover:bg-red-200 transition" onClick={() => handleBudgetChange(500)}>$500</button>
                    <button className="px-4 py-2 bg-red-100 text-pink-600 rounded-full font-medium hover:bg-red-200 transition" onClick={() => handleBudgetChange(1000)}>$1,000</button>
                    <button className="px-4 py-2 bg-red-100 text-pink-600 rounded-full font-medium hover:bg-red-200 transition" onClick={() => handleBudgetChange(2000)}>$2,000</button>
                    <button className="px-4 py-2 bg-red-100 text-red-600 rounded-full font-medium hover:bg-red-200 transition" onClick={() => handleBudgetChange(5000)}>$5,000</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <div className="mt-6">
              <button onClick={submitForm} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition">
                <Plane className="w-5 h-5" />
                Continue to Flight Booking
              </button>
            </div>
          </div>

          {/* Flight Booking Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <Plane className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Flight Booking</h2>
            </div>
            <p className="text-gray-600 mb-6">Select your flights for the perfect journey</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Flights List */}
              <div className="lg:col-span-2 space-y-3">
                {selectedFlight && (
                  <div className="bg-white rounded-xl border-2 border-teal-400 shadow-md overflow-hidden">
                    {/* Flight Header - Collapsible */}
                    <div
                      className="bg-gradient-to-r from-teal-50 to-teal-100 p-4 cursor-pointer hover:from-teal-100 hover:to-teal-200 transition-all"
                      onClick={() => setIsDepartureFlightOpen(!isDepartureFlightOpen)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center">
                            <Plane className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">Departure Flight</h3>
                            <p className="text-gray-700 font-semibold">
                              {formData.departure || 'Alexandria'} (ALE) → {formData.destination || 'Ahmedabad'} (AHM)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Select flight</p>
                            <p className="text-teal-600 font-bold">3-5 options</p>
                          </div>
                          {isDepartureFlightOpen ? (
                            <ChevronUp className="w-6 h-6 text-teal-600" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-teal-600" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Flight Options - Expandable */}
                    {isDepartureFlightOpen && (
                      <div className="p-4 space-y-3 bg-gray-50">
                        {outboundFlights.length === 0 && (
                          <div className="text-sm text-gray-500">No outbound flights found</div>
                        )}
                        {outboundFlights.map((flight) => (
                          <div
                            key={flight.id}
                            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-400 hover:shadow-md transition-all"
                          >
                            {/* Airline Info */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-lg">{flight.airlineCode}</span>
                              </div>
                              <span className="text-gray-900 font-medium">{flight.airline}</span>
                            </div>

                            {/* Flight Details */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-gray-900">{flight.departTime}</p>
                                  <p className="text-sm text-blue-600 font-semibold">{flight.departCode}</p>
                                </div>

                                <div className="flex-1 flex flex-col items-center">
                                  <p className="text-xs text-gray-500 mb-1">{flight.duration}</p>
                                  <div className="w-full h-1 bg-blue-500 rounded relative">
                                    <div className="absolute left-0 w-2 h-2 bg-blue-500 rounded-full -top-0.5"></div>
                                    <div className="absolute right-0 w-2 h-2 bg-blue-500 rounded-full -top-0.5"></div>
                                  </div>
                                  <p className="text-sm text-gray-700 font-medium mt-1">{flight.type}</p>
                                </div>

                                <div className="text-center">
                                  <p className="text-2xl font-bold text-gray-900">{flight.arriveTime}</p>
                                  <p className="text-sm text-blue-600 font-semibold">{flight.arriveCode}</p>
                                </div>
                              </div>
                            </div>

                            {/* Tabs and Price */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className="flex gap-2">
                                <button className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 transition flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  Details
                                </button>
                                <button className="px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-sm font-medium hover:bg-green-100 transition flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  Fare
                                </button>
                                <button className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-md text-sm font-medium hover:bg-orange-100 transition flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  Baggage
                                </button>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-3xl font-bold text-blue-600">${flight.price.toFixed(2)}</p>
                                  <p className="text-xs text-gray-500">/ Guest</p>
                                </div>
                                <button
                                  onClick={() => setSelectedDepartureFlight(flight)}
                                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                                >
                                  <span className="text-lg">✓</span>
                                  Select
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Return Flight */}
                {selectedFlight && (
                  <div className="bg-white rounded-xl border-2 border-orange-400 shadow-md overflow-hidden">
                    {/* Flight Header - Collapsible */}
                    <div
                      className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 cursor-pointer hover:from-orange-100 hover:to-orange-200 transition-all"
                      onClick={() => setIsReturnFlightOpen(!isReturnFlightOpen)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                            <Plane className="w-6 h-6 text-white transform rotate-180" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">Return Flight</h3>
                            <p className="text-gray-700 font-semibold">
                              {formData.destination || 'Ahmedabad'} (AHM) → {formData.departure || 'Alexandria'} (ALE)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Select flight</p>
                            <p className="text-orange-600 font-bold">3-5 options</p>
                          </div>
                          {isReturnFlightOpen ? (
                            <ChevronUp className="w-6 h-6 text-orange-600" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-orange-600" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Flight Options - Expandable */}
                {isReturnFlightOpen && (
                      <div className="p-4 space-y-3 bg-gray-50">
                        {returnFlights.length === 0 && (
                          <div className="text-sm text-gray-500">No return flights found</div>
                        )}
                        {returnFlights.map((flight) => (
                          <div
                            key={flight.id}
                            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-orange-400 hover:shadow-md transition-all"
                          >
                            {/* Airline Info */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-orange-100 rounded-md flex items-center justify-center">
                                <span className="text-orange-600 font-bold text-lg">{flight.airlineCode}</span>
                              </div>
                              <span className="text-gray-900 font-medium">{flight.airline}</span>
                            </div>

                            {/* Flight Details */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-gray-900">{flight.departTime}</p>
                                  <p className="text-sm text-orange-600 font-semibold">{flight.arriveCode}</p>
                                </div>

                                <div className="flex-1 flex flex-col items-center">
                                  <p className="text-xs text-gray-500 mb-1">{flight.duration}</p>
                                  <div className="w-full h-1 bg-orange-500 rounded relative">
                                    <div className="absolute left-0 w-2 h-2 bg-orange-500 rounded-full -top-0.5"></div>
                                    <div className="absolute right-0 w-2 h-2 bg-orange-500 rounded-full -top-0.5"></div>
                                  </div>
                                  <p className="text-sm text-gray-700 font-medium mt-1">{flight.type}</p>
                                </div>

                                <div className="text-center">
                                  <p className="text-2xl font-bold text-gray-900">{flight.arriveTime}</p>
                                  <p className="text-sm text-orange-600 font-semibold">{flight.departCode}</p>
                                </div>
                              </div>
                            </div>

                            {/* Tabs and Price */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className="flex gap-2">
                                <button className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 transition flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  Details
                                </button>
                                <button className="px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-sm font-medium hover:bg-green-100 transition flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  Fare
                                </button>
                                <button className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-md text-sm font-medium hover:bg-orange-100 transition flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  Baggage
                                </button>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-3xl font-bold text-orange-600">${flight.price.toFixed(2)}</p>
                                  <p className="text-xs text-gray-500">/ Guest</p>
                                </div>
                                <button
                                  onClick={() => setSelectedReturnFlight(flight)}
                                  className="bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition flex items-center gap-2"
                                >
                                  <span className="text-lg">✓</span>
                                  Select
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Booking Summary */}
              <div className="bg-gradient-to-b from-purple-500 to-purple-600 rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-xl">Booking Summary</h3>
                      <p className="text-purple-100 text-sm">Your selected flights</p>
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="px-4 pb-4">
                  <div className="bg-white rounded-2xl p-5 shadow-lg">
                    {/* Selected Flights Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200"
                      onClick={() => setIsFlightSummaryOpen(!isFlightSummaryOpen)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"

                        >
                          <Plane className="w-5 h-5 text-purple-600" />
                        </div>
                        <div
                          className="flex flex-col justify-center"
                        >
                          <div>
                            <h4 className="font-bold text-gray-900 text-xl">Your Selected Flights</h4>
                            <p className="text-base text-gray-500">Review your selections</p>
                          </div>
                        </div>
                      </div>
                      {isFlightSummaryOpen ? (
                        <ChevronUp className="w-5 h-5 text-purple-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-purple-600" />
                      )}
                    </div>

                    {/* Flight List */}
                    {isFlightSummaryOpen && (
                      <div className="space-y-4 mb-5">
                        {/* Departure Flight */}
                        {selectedDepartureFlight && (
                          <div className="flex gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                1
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-600 mb-1">
                                {dates && dates[0] ? new Date(dates[0]).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' }) : 'Friday, 29/08/2025'}
                              </p>
                              <p className="font-semibold text-gray-900">
                                {selectedDepartureFlight.airline} <span className="mx-2">→</span> {selectedDepartureFlight.departTime} - {selectedDepartureFlight.arriveTime}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Return Flight */}
                        {selectedReturnFlight && (
                          <div className="flex gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                2
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-600 mb-1">
                                {dates && dates[1] ? new Date(dates[1]).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' }) : 'Wednesday, 10/09/2025'}
                              </p>
                              <p className="font-semibold text-gray-900">
                                {selectedReturnFlight.airline} <span className="mx-2">→</span> {selectedReturnFlight.departTime} - {selectedReturnFlight.arriveTime}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* No flights selected */}
                        {!selectedDepartureFlight && !selectedReturnFlight && (
                          <div className="text-center py-4">
                            <p className="text-gray-400 text-sm">No flights selected yet</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-4"></div>

                    {/* Total Price Section */}
                    <div className="bg-purple-50 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-bold text-gray-900">Total Price:</span>
                        </div>
                        <span className="text-2xl font-bold text-purple-600">
                          ${((selectedDepartureFlight?.price || 0) + (selectedReturnFlight?.price || 0)).toFixed(2)}
                        </span>
                      </div>

                      {/* Price Breakdown */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-700">
                          <span>Departure flight</span>
                          <span className="font-semibold">${selectedDepartureFlight?.price.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span>Return flight</span>
                          <span className="font-semibold">${selectedReturnFlight?.price.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="border-t border-purple-200 pt-2 flex justify-between text-gray-900 font-bold">
                          <span>Total</span>
                          <span>${((selectedDepartureFlight?.price || 0) + (selectedReturnFlight?.price || 0)).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    {/* Confirm Button */}
                    <button
                      disabled={!selectedDepartureFlight || !selectedReturnFlight}
                      onClick={submitFormTour}
                      className={`w-full py-3 rounded-xl font-bold text-white transition-all ${selectedDepartureFlight && selectedReturnFlight
                          ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                          : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    >
                      Confirm Booking
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}