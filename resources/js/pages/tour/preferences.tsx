import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, Utensils, Hotel, MapPin, Bus, Star, Loader2, Check, Activity } from 'lucide-react';
import { Navbar } from '../../components/common/Navbar';
import { router, usePage } from '@inertiajs/react';
import { DataTour } from '../../types/domain';
import { useTourStorage } from '../../hooks/useTourStorage';

interface PlacesData {
  currentDay: number;
  budget: number;
  passengers: number;

  restaurants: string[];
  hotels: string[];
  activities: string[];
  transport: string[];

  liked_restaurants: string[];
  disliked_restaurants: string[];
  liked_hotels: string[];
  disliked_hotels: string[];
  liked_activities: string[];
  disliked_activities: string[];
  liked_transport: string[];
  disliked_transport: string[];
}

interface PlaceItem {
  id: string | number;
  place_id?: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  price: string;
  info?: string;
  liked?: boolean;
  disliked?: boolean;
}

interface CategorySection {
  title: string;
  icon: React.ReactNode;
  bgColor: string;
  items: PlaceItem[];
}

export default function Preferences() {
  const { props, url } = usePage<{ tourData?: Partial<DataTour> }>()
  const [isLoading, setIsLoading] = useState(true);
  const [placesData, setPlacesData] = useState<PlacesData>({
    currentDay: 0,
    budget: 0,
    passengers: 0,
    restaurants: [],
    hotels: [],
    activities: [],
    transport: [],
    liked_restaurants: [],
    disliked_restaurants: [],
    liked_hotels: [],
    disliked_hotels: [],
    liked_activities: [],
    disliked_activities: [],
    liked_transport: [],
    disliked_transport: [],
  });


  const { 
    tourData: storedTourData, 
    saveTourData, 
    saveDayPreferences, 
    getDayPreferences,
    getAllDaySchedules,
    getDateForDay,
  } = useTourStorage();
  
  const [formData, setFormData] = useState<Partial<DataTour>>({
    departure: '',
    destination: '',
    budget: 0,
    days: 0,
    moneyFlight: 0,
    passengers: 0,
  })

  // Determine current day from URL query parameter
  const [currentDay, setCurrentDay] = useState(() => {
    // Initialize from URL on first render
    try {
      const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      const dayParam = params.get('day');
      return dayParam ? parseInt(dayParam, 10) : 1;
    } catch {
      return 1;
    }
  });

  // Get day from URL query parameter (if provided)
  const getQueryDay = () => {
    try {
      const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      const dayParam = params.get('day');
      return dayParam ? parseInt(dayParam, 10) : null;
    } catch {
      return null;
    }
  };
  
  // Load data from props or localStorage and set current day from URL
  useEffect(() => {
    console.log('=== Preferences Loading Data ===');
    console.log('Props received:', props.tourData);
    console.log('Stored tour data:', storedTourData);
    console.log('Current URL:', url);
    
    // Priority: props.tourData > localStorage > default
    let dataToLoad: Partial<DataTour> = {};
    
    if (props.tourData && Object.keys(props.tourData).length > 0) {
      // Use props data (from backend)
      dataToLoad = {
        budget: props.tourData.budget || 0,
        passengers: props.tourData.passengers || 0,
        days: props.tourData.days || 0,
        moneyFlight: props.tourData.moneyFlight || 0,
        departure: props.tourData.departure || '',
        destination: props.tourData.destination || '',
      };
      console.log('✅ Loading from props:', dataToLoad);
    } else if (storedTourData) {
      // Use localStorage data
      dataToLoad = {
        budget: storedTourData.budget || 0,
        passengers: storedTourData.passengers || 0,
        days: storedTourData.days || 0,
        moneyFlight: storedTourData.moneyFlight || 0,
        departure: storedTourData.departure || '',
        destination: storedTourData.destination || '',
      };
      console.log('✅ Loading from localStorage:', dataToLoad);
    } else {
      console.log('⚠️ No data available in props or localStorage');
    }
    
    if (Object.keys(dataToLoad).length > 0 && dataToLoad.destination) {
      setFormData(dataToLoad);
      
      // ALWAYS check URL query parameter when this effect runs
      const queryDay = getQueryDay();
      if (queryDay) {
        console.log(`✅ Day from URL query parameter: ${queryDay}`);
        if (queryDay !== currentDay) {
          console.log(`🔄 Updating currentDay from ${currentDay} to ${queryDay}`);
          setCurrentDay(queryDay);
        }
      } else {
        // Calculate current day by reading fresh data from localStorage
        const freshDaySchedules = getAllDaySchedules();
        const totalDays = dataToLoad.days || 0;
        
        console.log('Fresh day schedules from localStorage:', freshDaySchedules);
        console.log('Total days:', totalDays);
        
        // Find first day without schedule
        let nextDay = 1;
        for (let i = 1; i <= totalDays; i++) {
          if (!freshDaySchedules[i]) {
            nextDay = i;
            break;
          }
          if (i === totalDays) {
            nextDay = totalDays;
          }
        }
        
        console.log(`✅ Calculated current day: ${nextDay} (out of ${totalDays} days)`);
        if (nextDay !== currentDay) {
          setCurrentDay(nextDay);
        }
      }
    } else {
      console.log('⚠️ No valid data to load or missing destination');
    }
  }, [storedTourData, url]); // Run when storedTourData OR url changes

  // Fetch places from API
  useEffect(() => {
    const fetchPlaces = async () => {
      if (!formData.destination) {
        console.log('No destination set, skipping fetch');
        // Don't call setIsLoading here to avoid triggering re-renders
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          destination: formData.destination,
          days: formData.days?.toString() || '1',
          budget: formData.budget?.toString() || '1000',
          passengers: formData.passengers?.toString() || '1',
        });

        const response = await fetch(`/api/places/tour-preferences?${params}`);
        const data = await response.json();
        console.log('data', data);
        if (data.success) {
          // Transform API data to CategorySection format
          const transformedCategories: CategorySection[] = [
            {
              title: 'Restaurants',
              icon: <Utensils className="w-5 h-5" />,
              bgColor: 'bg-red-50',
              items: data.data.restaurants.map((place: any) => ({
                id: place.id,
                place_id: place.place_id,
                name: place.name,
                category: place.type_display || 'Restaurant',
                rating: place.rating,
                reviews: place.user_ratings_total,
                price: place.avg_price + '$' || '$$$',
              })),
            },
            {
              title: 'Hotels',
              icon: <Hotel className="w-5 h-5" />,
              bgColor: 'bg-blue-50',
              items: data.data.hotels.map((place: any) => ({
                id: place.id,
                place_id: place.place_id,
                name: place.name,
                category: place.type_display || 'Hotel',
                rating: place.rating,
                reviews: place.user_ratings_total,
                price: place.avg_price + '$' || '$$$',
              })),
            },
            {
              title: 'Recreation Places',
              icon: <MapPin className="w-5 h-5" />,
              bgColor: 'bg-green-50',
              items: data.data.tourist_attractions.map((place: any) => ({
                id: place.id,
                place_id: place.place_id,
                name: place.name,
                category: place.type_display || 'Tourist Attraction',
                rating: place.rating,
                reviews: place.user_ratings_total,
                price: place.avg_price + '$' || 'Free',
                info: '2-3h',
              })),
            },
            {
              title: 'Local Transport',
              icon: <Bus className="w-5 h-5" />,
              bgColor: 'bg-yellow-50',
              items: data.data.transport.map((transport: any) => ({
                id: transport.id,
                name: transport.name,
                category: transport.type,
                rating: transport.rating,
                reviews: transport.user_ratings_total,
                price: transport.price_level,
                info: transport.info,
              })),
            },
          ];

          setCategories(transformedCategories);
          
          // Restore liked/disliked status from localStorage for current day
          const dayPrefs = getDayPreferences(currentDay);
          if (dayPrefs?.preferences) {
            restorePreferencesFromStorage(transformedCategories, dayPrefs.preferences);
          }
        }
      } catch (error) {
        console.error('Error fetching places:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaces();
  }, [formData.destination, formData.days, formData.budget, formData.passengers]);

  // State for categories (will be populated from API)
  const [categories, setCategories] = useState<CategorySection[]>([]);

  // Restore preferences (liked/disliked) from localStorage
  const restorePreferencesFromStorage = (fetchedCategories: CategorySection[], savedPreferences: any[]) => {
    if (!savedPreferences) return;

    const updatedCategories = fetchedCategories.map(category => {
      const savedCategory = savedPreferences.find(
        (p: any) => p.title === category.title
      );

      if (savedCategory) {
        const updatedItems = category.items.map(item => {
          const savedItem = savedCategory.items?.find(
            (si: any) => si.id === item.id || si.place_id === item.place_id
          );
          
          if (savedItem) {
            return {
              ...item,
              liked: savedItem.liked || false,
              disliked: savedItem.disliked || false,
            };
          }
          return item;
        });

        return {
          ...category,
          items: updatedItems,
        };
      }
      return category;
    });

    setCategories(updatedCategories);
  };

  const handleLike = (categoryIndex: number, itemId: string | number) => {
    setCategories(prevCategories => {
      const newCategories = [...prevCategories];
      const item = newCategories[categoryIndex].items.find(i => i.id === itemId);
      if (item) {
        item.liked = !item.liked;
        if (item.liked) item.disliked = false;
      }
      
      // Save to localStorage
      savePreferencesToStorage(newCategories);
      
      return newCategories;
    });
  };

  const handleDislike = (categoryIndex: number, itemId: string | number) => {
    setCategories(prevCategories => {
      const newCategories = [...prevCategories];
      const item = newCategories[categoryIndex].items.find(i => i.id === itemId);
      if (item) {
        item.disliked = !item.disliked;
        if (item.disliked) item.liked = false;
      }
      
      // Save to localStorage
      savePreferencesToStorage(newCategories);
      
      return newCategories;
    });
  };

  // Save preferences to localStorage
  const savePreferencesToStorage = (cats: CategorySection[]) => {
    const preferencesData = cats.map(cat => ({
      title: cat.title,
      items: cat.items.map(item => ({
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
      }))
    }));

    const likedItems = cats.flatMap(cat => 
      cat.items
        .filter(item => item.liked)
        .map(item => ({
          type: cat.title.toLowerCase().replace(/\s+/g, '_'),
          id: item.id,
          place_id: item.place_id,
          name: item.name,
          category: item.category,
          rating: item.rating,
          price: item.price,
          info: item.info,
        }))
    );

    const dislikedItems = cats.flatMap(cat => 
      cat.items
        .filter(item => item.disliked)
        .map(item => ({
          type: cat.title.toLowerCase().replace(/\s+/g, '_'),
          id: item.id,
          place_id: item.place_id,
          name: item.name,
        }))
    );

    // Save preferences for current day
    saveDayPreferences(currentDay, {
      preferences: preferencesData,
      likedItems,
      dislikedItems,
    });
  };

  const handleBackToFlightBooking = () => {
    router.visit('/tour/flight');
  };

  const handleContinue = () => {
    // Extract preferences for current day
    const likedItems = categories.flatMap(cat => 
      cat.items
        .filter(item => item.liked)
        .map(item => ({
          type: cat.title.toLowerCase().replace(/\s+/g, '_'),
          id: item.id,
          place_id: item.place_id,
          name: item.name,
          category: item.category,
          rating: item.rating,
          price: item.price,
          info: item.info,
        }))
    );
    
    const dislikedItems = categories.flatMap(cat => 
      cat.items
        .filter(item => item.disliked)
        .map(item => ({
          type: cat.title.toLowerCase().replace(/\s+/g, '_'),
          id: item.id,
          place_id: item.place_id,
          name: item.name,
        }))
    );

    // Save preferences for this day before continuing
    saveDayPreferences(currentDay, {
      preferences: categories.map(cat => ({
        title: cat.title,
        items: cat.items.map(item => ({
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
        }))
      })),
      likedItems,
      dislikedItems,
    });

    console.log(`✅ Saved preferences for Day ${currentDay}`);
    
    // Prepare data to send
    const dataToSend: PlacesData = {
      currentDay: currentDay,
      budget: formData.budget || 0,
      passengers: formData.passengers || 0,
      restaurants: categories.filter(cat => cat.title === 'Restaurants').flatMap(cat => cat.items.map(item => item.place_id?.toString() || '') as string[]),
      hotels: categories.filter(cat => cat.title === 'Hotels').flatMap(cat => cat.items.map(item => item.place_id?.toString() || '')),
      activities: categories.filter(cat => cat.title === 'Recreation Places').flatMap(cat => cat.items.map(item => item.place_id?.toString() || '')),
      transport: categories.filter(cat => cat.title === 'Local Transport').flatMap(cat => cat.items.map(item => item.name?.toString() || '')),
      disliked_restaurants: dislikedItems.filter(item => item.type === 'restaurants').map(item => item.place_id?.toString() || ''),
      disliked_hotels: dislikedItems.filter(item => item.type === 'hotels').map(item => item.place_id?.toString() || ''),
      disliked_activities: dislikedItems.filter(item => item.type === 'recreation_places').map(item => item.place_id?.toString() || ''),
      disliked_transport: dislikedItems.filter(item => item.type === 'local_transport').map(item => item.name?.toString() || ''),
      liked_restaurants: likedItems.filter(item => item.type === 'restaurants').map(item => item.place_id?.toString() || ''),
      liked_hotels: likedItems.filter(item => item.type === 'hotels').map(item => item.place_id?.toString() || ''),
      liked_activities: likedItems.filter(item => item.type === 'recreation_places').map(item => item.place_id?.toString() || ''),
      liked_transport: likedItems.filter(item => item.type === 'local_transport').map(item => item.name?.toString() || ''),
    };
    
    console.log(`🚀 Generating schedule for Day ${currentDay}`);
    console.log('Data being sent:', dataToSend);
    
    // Update state and send data
    setPlacesData(dataToSend);
    router.post('/tour/generate-schedule', dataToSend as any);
  };

  const getIconColor = (title: string) => {
    switch (title) {
      case 'Restaurants': return 'text-red-600';
      case 'Hotels': return 'text-blue-600';
      case 'Recreation Places': return 'text-green-600';
      case 'Local Transport': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  // Get day schedules - read fresh from localStorage on each render
  const daySchedules = React.useMemo(() => getAllDaySchedules(), [currentDay]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Progress Indicator */}
          {formData.days && formData.days > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">Tour Planning Progress</h3>
              <div className="flex items-center gap-2">
                {Array.from({ length: formData.days || 0 }, (_, i) => i + 1).map((day) => {
                  const isCompleted = !!daySchedules[day];
                  const isCurrent = day === currentDay;
                  
                  return (
                    <div key={day} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : isCurrent
                              ? 'bg-purple-600 text-white ring-4 ring-purple-200'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {isCompleted ? <Check className="w-5 h-5" /> : day}
                        </div>
                        <span
                          className={`text-xs mt-1 font-medium ${
                            isCurrent ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          Day {day}
                        </span>
                      </div>
                      {day < (formData.days || 0) && (
                        <div
                          className={`h-1 flex-1 mx-2 rounded transition-all ${
                            isCompleted ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Day Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{currentDay}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Day {currentDay}</h1>
                  <p className="text-gray-600">
                    {formData.destination ? `Exploring ${formData.destination}` : 'Select your destination'}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {currentDay} of {formData.days || 2} days
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Loading places for {formData.destination}...</p>
              </div>
            </div>
          )}

          {/* No Data State */}
          {!isLoading && categories.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No places found</h3>
              <p className="text-gray-600">
                {formData.destination 
                  ? `We couldn't find any places for ${formData.destination}. Please try another destination.`
                  : 'Please select a destination to view available places.'}
              </p>
            </div>
          )}

          {/* Categories Grid */}
          {!isLoading && categories.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {categories.map((category, categoryIndex) => (
              <div key={category.title} className={`${category.bgColor} rounded-xl p-6 shadow-sm`}>
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 ${category.title === 'Restaurants' ? 'bg-red-500' : category.title === 'Hotels' ? 'bg-blue-500' : category.title === 'Recreation Places' ? 'bg-green-500' : 'bg-yellow-500'} rounded-lg flex items-center justify-center text-white`}>
                    {category.icon}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
                </div>

                {/* Items List */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                        
                        <div className="flex items-center gap-3 text-sm">
                          {/* Rating */}
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-gray-900">{item.rating.toFixed(2)}</span>
                            <span className="text-gray-500">{item.reviews}</span>
                          </div>
                          
                          {/* Price */}
                          <span className="font-semibold text-gray-900">{item.price}</span>
                          
                          {/* Additional Info */}
                          {item.info && (
                            <span className="text-gray-600">{item.info}</span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleLike(categoryIndex, item.id)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                            item.liked
                              ? 'bg-green-500 text-white'
                              : 'bg-white border border-gray-300 text-gray-600 hover:bg-green-50'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDislike(categoryIndex, item.id)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                            item.disliked
                              ? 'bg-red-500 text-white'
                              : 'bg-white border border-gray-300 text-gray-600 hover:bg-red-50'
                          }`}
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>

                        {/* Drag Handle */}
                        <div className="w-6 h-9 flex flex-col items-center justify-center gap-0.5 cursor-move text-gray-400">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            </div>
          )}

          {/* Bottom Navigation */}
          {!isLoading && (
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToFlightBooking}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Back to Flight Booking
              </button>

              <button
                onClick={handleContinue}
                disabled={categories.length === 0}
                className={`flex items-center gap-2 px-8 py-3 font-semibold rounded-lg transition-colors ${
                  categories.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

