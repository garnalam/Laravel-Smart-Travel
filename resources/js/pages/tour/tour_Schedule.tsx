import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Calendar, Utensils, Car, MapPin, Clock, Edit, Check, Sparkles, ChevronLeft, ChevronRight, CheckCircle, X, Search, Star, Trash } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { DataTour } from '../../types/domain';
import { useTourStorage } from '../../hooks/useTourStorage';
import { data } from 'react-router';

interface ScheduleItem {
  id: string | number;
  type: 'meal' | 'transfer' | 'activity' | 'hotel';
  startTime: string;
  endTime: string;
  title: string;
  cost: number;
  distance?: string;
  icon?: React.ReactNode;
}

interface DaySchedule {
  day: number;
  date: string;
  completed: boolean;
  items: ScheduleItem[];
  totalCost: number;
}

interface TourData {
  destination?: string;
  departure?: string;
  days?: number;
  budget?: number;
  passengers?: number;
  moneyFlight?: number;
  likedItems?: any[];
  dislikedItems?: any[];
  current_day?: number;
}

export default function TourSchedule() {
  const { props } = usePage<{
    tourData?: TourData;
    scheduleData?: DaySchedule[];
    flash?: { success?: string };
  }>();

  const {
    tourData: storedTourData,
    saveScheduleData,
    saveDaySchedule,
    saveDayPreferences,
    getDayPreferences,
    getAllDaySchedules,
    areAllDaysComplete,
    clearTourData,
    getDateForDay,
  } = useTourStorage();

  const [isEditMode, setIsEditMode] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [allDaysComplete, setAllDaysComplete] = useState(false);
  const [placesData, setPlacesData] = useState<{
    restaurants: any[];
    hotels: any[];
    tourist_attractions: any[];
    transport: any[];
  } | null>(null);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [selectedItemToReplace, setSelectedItemToReplace] = useState<ScheduleItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- URL helpers ---
  const getUrlParams = () => {
    try {
      const sp = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      return {
        start: sp.get('start') ?? undefined,
        days: sp.get('days') ? parseInt(sp.get('days')!, 10) : undefined,
        plan: sp.get('plan') ?? undefined,
        day: sp.get('day') ? parseInt(sp.get('day')!, 10) : undefined,
      };
    } catch {
      return { start: undefined, days: undefined, plan: undefined, day: undefined };
    }
  };

  const buildUrl = (path: string, extra: Record<string, string | number | undefined>) => {
    if (typeof window === 'undefined') return path;
    const sp = new URLSearchParams(window.location.search);
    Object.entries(extra).forEach(([k, v]) => {
      if (v === undefined || v === null) sp.delete(k);
      else sp.set(k, String(v));
    });
    return `${path}?${sp.toString()}`;
  };

  const { start: urlStart, days: urlDays, plan: urlPlan, day: urlDay } = getUrlParams();

  const buildMergedSchedules = () => {
    const totalDays =
      props.tourData?.days ??
      storedTourData?.days ??
      urlDays ??
      0;
  
    const savedByDay = getAllDaySchedules(); // { [day]: DaySchedule }
    const arr: DaySchedule[] = [];
  
    for (let d = 1; d <= totalDays; d++) {
      const saved = savedByDay[d];
      const dateStr = typeof getDateForDay === 'function' ? getDateForDay(d) : '';
      if (saved) {
        arr.push({ ...saved, date: dateStr || saved.date });
      } else {
        arr.push({
          day: d,
          date: dateStr,
          completed: false,
          items: [],
          totalCost: 0,
        });
      }
    }
  
    // Nếu chưa biết totalDays (0) thì giữ dữ liệu cũ trong storage (nếu có)
    if (totalDays === 0) {
      const fallback: DaySchedule[] = [];
      Object.keys(savedByDay).forEach(k => {
        const d = parseInt(k, 10);
        if (savedByDay[d]) fallback.push(savedByDay[d]);
      });
      return fallback.sort((a, b) => a.day - b.day);
    }
  
    return arr;
  };
  
  // Initialize schedules from various sources
  const [schedules, setSchedules] = useState<DaySchedule[]>(() => {
    // Ưu tiên props.scheduleData nếu có -> lưu vào storage trước rồi rebuild
    if (props.scheduleData && props.scheduleData.length > 0) {
      // Sử dụng current_day từ tourData để xác định ngày cần lưu
      const currentDay = props.tourData?.current_day || urlDay || 1;
      
      // Nếu scheduleData là một mảng với một schedule, lưu nó cho current_day
      if (props.scheduleData.length === 1) {
        const schedule = props.scheduleData[0];
        saveDaySchedule(currentDay, {
          ...schedule,
          day: currentDay // Đảm bảo day được set đúng
        });
      } else {
        // Nếu có nhiều schedules, lưu tất cả
        props.scheduleData.forEach((schedule: any) => {
          saveDaySchedule(schedule.day || currentDay, schedule);
        });
      }
    }
    return buildMergedSchedules();
  });
  
  // Initialize currentDayIndex based on URL query parameter or stored data
  useEffect(() => {
    if (schedules.length === 0) return;
    const desiredDay = urlDay ?? 1;
    const idx = schedules.findIndex(s => s.day === desiredDay);
    setCurrentDayIndex(idx !== -1 ? idx : 0);
  }, [schedules]);
  
  // Update schedules when props or stored data change
  useEffect(() => {
    if (props.scheduleData && props.scheduleData.length > 0) {
      console.log('📦 Received scheduleData from backend:', props.scheduleData.map((s: any) => ({ day: s.day, items: s.items?.length })));
      
      // Debug: Log cost data for each item
      props.scheduleData.forEach((schedule: any) => {
        console.log(`💰 Schedule Day ${schedule.day} cost data:`, schedule.items?.map((item: any) => ({
          title: item.title,
          cost: item.cost,
          costType: typeof item.cost
        })));
      });
      
      // Sử dụng current_day từ tourData để xác định ngày cần lưu
      const currentDay = props.tourData?.current_day || urlDay || 1;
      console.log(`🎯 Current day from tour_info: ${currentDay}`);
      
      // Nếu scheduleData là một mảng với một schedule, lưu nó cho current_day
      if (props.scheduleData.length === 1) {
        const schedule = props.scheduleData[0];
        console.log(`💾 Saving schedule for day ${currentDay}`);
        saveDaySchedule(currentDay, {
          ...schedule,
          day: currentDay // Đảm bảo day được set đúng
        });
      } else {
        // Nếu có nhiều schedules, lưu tất cả
        props.scheduleData.forEach((schedule: any) => {
          const dayToSave = schedule.day || currentDay;
          console.log(`💾 Saving schedule for day ${dayToSave}`);
          saveDaySchedule(dayToSave, schedule);
        });
      }
  
      const merged = buildMergedSchedules();
      setSchedules(merged);
      console.log('🔀 Merged schedules:', merged.map(s => ({ day: s.day, completed: s.completed, items: s.items.length })));
  
      // Set currentDayIndex to current_day or urlDay
      const targetDay = currentDay;
      const newIdx = merged.findIndex(s => s.day === targetDay);
      if (newIdx !== -1) {
        console.log(`✅ Setting currentDayIndex to ${newIdx} (day ${targetDay})`);
        setCurrentDayIndex(newIdx);
      }
  
      setAllDaysComplete(areAllDaysComplete());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.scheduleData, props.tourData?.current_day]);
  

  // Check completion status when schedules change
  useEffect(() => {
    const cs = schedules[currentDayIndex];
    if (!cs || typeof window === 'undefined') return;
    const nextUrl = buildUrl(window.location.pathname, {
      start: urlStart, days: urlDays, plan: urlPlan, day: cs.day
    });
    window.history.replaceState({}, '', nextUrl);
  }, [currentDayIndex, schedules.length]);
  
  const currentSchedule = schedules[currentDayIndex];
  // Merge tour data from props and localStorage
  const tourData: TourData = {
    ...storedTourData,
    ...props.tourData,
  };

  // Load places data when component mounts or tour params change
  useEffect(() => {
    const loadPlacesData = async () => {
      if (!tourData.destination) {
        console.log('⚠️ No destination found, skipping places load');
        return;
      }
      
      console.log(`🔄 Loading places data for destination: ${tourData.destination}`);
      
      // First, try to load from localStorage (check day 1 as places are shared across all days)
      const savedPreferences = getDayPreferences(1);
      
      console.log('🔍 Checking localStorage:', savedPreferences);
      
      if (savedPreferences?.preferences) {
        console.log(`📦 Found saved places data in localStorage:`, {
          type: typeof savedPreferences.preferences,
          isArray: Array.isArray(savedPreferences.preferences),
          data: savedPreferences.preferences
        });
        
         // Transform data if it's in category array format
         let transformedData: any;
         if (Array.isArray(savedPreferences.preferences)) {
           // Data is in format: [{ title, items }, ...]
           transformedData = {
             restaurants: [],
             hotels: [],
             tourist_attractions: [],
             transport: []
           };
           
           savedPreferences.preferences.forEach((category: any) => {
             const title = category.title?.toLowerCase() || '';
             console.log(`🏷️ Processing category: "${category.title}" -> "${title}"`);
             
             if (title.includes('restaurant') || title.includes('meal')) {
               console.log(`  ✅ Matched as restaurants (${category.items?.length || 0} items)`);
               transformedData.restaurants = category.items || [];
             } else if (title.includes('hotel') || title.includes('accommodation')) {
               console.log(`  ✅ Matched as hotels (${category.items?.length || 0} items)`);
               transformedData.hotels = category.items || [];
             } else if (title.includes('recreation') || title.includes('activit') || title.includes('attraction') || title.includes('tourist')) {
               console.log(`  ✅ Matched as tourist_attractions (${category.items?.length || 0} items)`);
               transformedData.tourist_attractions = category.items || [];
             } else if (title.includes('transport')) {
               console.log(`  ✅ Matched as transport (${category.items?.length || 0} items)`);
               transformedData.transport = category.items || [];
             } else {
               console.log(`  ⚠️ No match for this category`);
             }
           });
          
          console.log('🔄 Transformed array data to object:', {
            restaurants: transformedData.restaurants.length,
            hotels: transformedData.hotels.length,
            tourist_attractions: transformedData.tourist_attractions.length,
            transport: transformedData.transport.length
          });
        } else {
          // Data is already in correct format
          transformedData = savedPreferences.preferences;
        }
        
        setPlacesData(transformedData);
        return;
      }
      
      // If not in localStorage, fetch from API
      console.log(`🔍 No saved places data found. Fetching from API...`);
      console.log('Fetch params:', {
        destination: tourData.destination,
        days: tourData.days,
        budget: tourData.budget,
        passengers: tourData.passengers
      });
      
      const params = new URLSearchParams({
        destination: tourData.destination || '',
        days: tourData.days?.toString() || '1',
        budget: tourData.budget?.toString() || '1000',
        passengers: tourData.passengers?.toString() || '1',
      });
      
      try {
        const response = await fetch(`/api/places/tour-preferences?${params}`);
        const placesResponse = await response.json();
        
        if (placesResponse.success) {
          console.log('✅ Places fetched successfully:', {
            restaurants: placesResponse.data.restaurants?.length || 0,
            hotels: placesResponse.data.hotels?.length || 0,
            tourist_attractions: placesResponse.data.tourist_attractions?.length || 0,
            transport: placesResponse.data.transport?.length || 0
          });
          
          // Save to component state
          setPlacesData(placesResponse.data);
          
          // Save to localStorage (save to all days since places are shared)
          const totalDays = tourData.days || 1;
          for (let day = 1; day <= totalDays; day++) {
            saveDayPreferences(day, {
              preferences: placesResponse.data,
              likedItems: tourData.likedItems || [],
              dislikedItems: tourData.dislikedItems || []
            });
          }
          
          console.log(`💾 Places data saved to localStorage for all ${totalDays} days`);
        } else {
          console.error('❌ Error fetching places:', placesResponse.message);
        }
      } catch (error) {
        console.error('❌ Network error fetching places:', error);
      }
    };
    
    loadPlacesData();
  }, [tourData.destination, tourData.days, tourData.budget, tourData.passengers]);

  // Memoize day schedules to prevent recalculation on every render
  const daySchedules = React.useMemo(() => getAllDaySchedules(), [schedules]);

  // Debug: Log placesData when it changes
  useEffect(() => {
    console.log('🔍 placesData updated:', {
      hasData: !!placesData,
      restaurants: placesData?.restaurants?.length || 0,
      hotels: placesData?.hotels?.length || 0,
      tourist_attractions: placesData?.tourist_attractions?.length || 0,
      transport: placesData?.transport?.length || 0,
      currentDay: currentSchedule?.day
    });
  }, [placesData, currentSchedule?.day]);

  const formatCost = (cost: any): string => {
    const numCost = parseFloat(cost);
    return isNaN(numCost) ? '0.00' : numCost.toFixed(2);
  };

  const getAvailablePlaces = (type: string) => {
    if (!placesData) {
      console.log(`⚠️ No placesData available for type: ${type}`);
      return [];
    }
    
    let places = [];
    switch (type) {
      case 'meal':
        places = placesData.restaurants || [];
        break;
      case 'hotel':
        places = placesData.hotels || [];
        break;
      case 'activity':
        places = placesData.tourist_attractions || [];
        break;
      case 'transfer':
        places = placesData.transport || [];
        break;
      default:
        places = [];
    }
    
    console.log(`📍 Available places for ${type}:`, places.length);
    return places;
  };

  const getModalTitle = (type: string) => {
    switch (type) {
      case 'meal':
        return 'Select Meal';
      case 'hotel':
        return 'Select Hotel';
      case 'activity':
        return 'Select Activity';
      case 'transfer':
        return 'Select Transport';
      default:
        return 'Select Place';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'meal':
        return <Utensils className="w-5 h-5" />;
      case 'transfer':
        return <Car className="w-5 h-5" />;
      case 'activity':
        return <MapPin className="w-5 h-5" />;
      case 'hotel':
        return <Calendar className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'meal':
        return 'bg-purple-500';
      case 'transfer':
        return 'bg-indigo-500';
      case 'activity':
        return 'bg-purple-500';
      case 'hotel':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTagColor = (type: string) => {
    switch (type) {
      case 'meal':
        return 'bg-blue-100 text-blue-700';
      case 'transfer':
        return 'bg-blue-100 text-blue-700';
      case 'activity':
        return 'bg-blue-100 text-blue-700';
      case 'hotel':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleEditPreferences = () => {
    const day = currentSchedule?.day || 1;
    router.visit(buildUrl('/tour/preferences', { start: urlStart, days: urlDays, plan: urlPlan, day }), {
      preserveState: true, preserveScroll: true
    });
  };
  
  const handleContinueToNextDay = () => {
    const totalDays = tourData.days ?? storedTourData?.days ?? urlDays ?? 0;
    const currentDay = currentSchedule?.day || 1;
    const nextDay = currentDay + 1;
    if (nextDay > (totalDays as number)) return;
  
    router.visit(buildUrl('/tour/preferences', {
      start: urlStart, days: totalDays, plan: urlPlan, day: nextDay
    }), { preserveState: true, preserveScroll: true });
  };
  
  const handleGenerateFinalTour = () => {
    const payload = {
      schedules: schedules.map(s => ({
        day: s.day, date: s.date, completed: s.completed, totalCost: s.totalCost,
        items: s.items.map(i => ({ id: i.id, type: i.type, startTime: i.startTime, endTime: i.endTime, title: i.title, cost: i.cost, distance: i.distance || '' }))
      })),
      destination: tourData.destination,
      departure: tourData.departure,
      days: tourData.days ?? urlDays,
      budget: tourData.budget,
      passengers: tourData.passengers,
    };
  
    if (window.confirm('Generate final tour? This will clear your saved progress.')) {
      setIsGenerating(true);
      router.post(
        buildUrl('/tour/generate-final', { start: urlStart, days: urlDays, plan: urlPlan }),
        payload,
        {
          onSuccess: () => { clearTourData(); },
          onError: () => { setIsGenerating(false); alert('Error generating final tour. Your data has been preserved.'); }
        }
      );
    }
  };
  
  const handleEditItem = (item: ScheduleItem) => {
    console.log(`🔧 Editing item:`, item);
    setSelectedItemToReplace(item);
    setShowReplaceModal(true);
    setSearchQuery('');
  };

  const handleDeleteItem = (item: ScheduleItem) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    
    const updatedItems = currentSchedule.items.filter(i => i.id !== item.id);
    const updatedSchedule = {
      ...currentSchedule,
      items: updatedItems,
      totalCost: updatedItems.reduce((sum, i) => sum + (parseFloat(String(i.cost)) || 0), 0)
    };

    saveDaySchedule(currentSchedule.day, updatedSchedule);
    setSchedules(schedules.map(s => s.day === currentSchedule.day ? updatedSchedule : s));
    console.log('✅ Item deleted successfully');
  };

  const handleReplaceItem = (newPlace: any) => {
    if (!selectedItemToReplace) return;
    
    // Create updated schedule with replaced item
    const updatedItems = currentSchedule.items.map((item, idx) => {
      if (item.id === selectedItemToReplace.id && idx === currentSchedule.items.indexOf(selectedItemToReplace)) {
        const newCost = parseFloat(String(newPlace.price_level)) || parseFloat(String(item.cost)) || 0;
        // Use a more unique ID combining place_id with timestamp to avoid duplicates
        const newId = `${newPlace.place_id || newPlace.id || newPlace.name}-${Date.now()}`;
        return {
          ...item,
          id: newId,
          title: newPlace.name,
          cost: newCost,
        };
      }
      return item;
    });

    const updatedSchedule = {
      ...currentSchedule,
      items: updatedItems,
      totalCost: updatedItems.reduce((sum, item) => sum + (parseFloat(String(item.cost)) || 0), 0)
    };

    // Save updated schedule
    saveDaySchedule(currentSchedule.day, updatedSchedule);
    
    // Update local state
    const updatedSchedules = schedules.map(s => 
      s.day === currentSchedule.day ? updatedSchedule : s
    );
    setSchedules(updatedSchedules);

    // Close modal
    setShowReplaceModal(false);
    setSelectedItemToReplace(null);
    setSearchQuery('');
    
    console.log('✅ Item replaced successfully');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Progress Indicator */}
          {tourData && tourData.days && tourData.days > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">Tour Planning Progress</h3>
              <div className="flex items-center gap-2">
                {Array.from({ length: tourData.days || 0 }, (_, i) => i + 1).map((day) => {
                  const isCompleted = !!daySchedules[day];
                  const isCurrent = day === currentSchedule?.day;

                  return (
                    <div key={day} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${isCompleted
                              ? 'bg-green-500 text-white'
                              : isCurrent
                                ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                                : 'bg-gray-200 text-gray-500'
                            }`}
                        >
                          {isCompleted ? <CheckCircle className="w-5 h-5" /> : day}
                        </div>
                        <span
                          className={`text-xs mt-1 font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                            }`}
                        >
                          Day {day}
                        </span>
                      </div>
                      {day < (tourData.days || 0) && (
                        <div
                          className={`h-1 flex-1 mx-2 rounded transition-all ${isCompleted ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Completed: <span className="font-bold text-green-600">{Object.keys(daySchedules).length}</span> / {tourData.days} days
                  </span>
                  {allDaysComplete && (
                    <span className="flex items-center gap-1 text-green-600 font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      All days complete! Ready to generate final tour.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tour Information */}
          {tourData && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">Destination</p>
                    <h2 className="text-2xl font-bold">{tourData.destination}</h2>
                  </div>
                  {tourData.departure && (
                    <div>
                      <p className="text-blue-100 text-sm mb-1">From</p>
                      <p className="text-lg font-semibold">{tourData.departure}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-blue-100 text-sm mb-1">Duration</p>
                    <p className="text-xl font-bold">{tourData.days} Days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-sm mb-1">Budget</p>
                    <p className="text-xl font-bold">${tourData.budget}</p>
                  </div>
                  {tourData.passengers && (
                    <div className="text-right">
                      <p className="text-blue-100 text-sm mb-1">Travelers</p>
                      <p className="text-xl font-bold">{tourData.passengers}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Liked Items Summary */}
              {tourData.likedItems && tourData.likedItems.length > 0 && (
                <div className="mt-4 pt-4 border-t border-blue-400">
                  <p className="text-sm text-blue-100 mb-2">
                    You selected {tourData.likedItems.length} favorite places
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tourData.likedItems.slice(0, 5).map((item: any, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white bg-opacity-20 rounded-lg text-sm font-medium"
                      >
                        {item.name}
                      </span>
                    ))}
                    {tourData.likedItems.length > 5 && (
                      <span className="px-3 py-1 bg-white bg-opacity-20 rounded-lg text-sm font-medium">
                        +{tourData.likedItems.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Day Navigation */}
          {schedules.length > 1 && (
            <div className="flex items-center justify-center gap-3 mb-6">
              <button
                onClick={() => setCurrentDayIndex(Math.max(0, currentDayIndex - 1))}
                disabled={currentDayIndex === 0}
                className={`p-3 rounded-lg transition-colors ${currentDayIndex === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                  }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {schedules.map((schedule, index) => (
                <button
                  key={schedule.day}
                  onClick={() => setCurrentDayIndex(index)}
                  className={`px-5 py-3 rounded-lg font-semibold transition-all ${index === currentDayIndex
                      ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                    }`}
                >
                  Day {schedule.day}
                </button>
              ))}

              <button
                onClick={() => setCurrentDayIndex(Math.min(schedules.length - 1, currentDayIndex + 1))}
                disabled={currentDayIndex === schedules.length - 1}
                className={`p-3 rounded-lg transition-colors ${currentDayIndex === schedules.length - 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                  }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Day Header */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Day Number Badge */}
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-3xl font-bold">{currentSchedule.day}</span>
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-gray-900">
                      Day {currentSchedule.day}
                    </h1>
                    <span className="px-4 py-1.5 bg-blue-500 text-white rounded-lg font-semibold text-sm">
                      Schedule
                    </span>
                  </div>
                  <p className="text-gray-600 text-lg mt-1">{currentSchedule.date}</p>
                </div>
              </div>

              {/* Completed Badge */}
              {currentSchedule.completed && (
                <div className="flex items-center gap-2 px-5 py-2.5 bg-green-50 border-2 border-green-500 rounded-xl">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-semibold">Completed</span>
                </div>
              )}
            </div>
          </div>

          {/* Schedule Card */}
          <div className="bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 rounded-2xl shadow-lg p-8">
            {/* Schedule Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Your Personalized Schedule</h2>
              </div>

              {/* Edit Mode Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-gray-700 font-medium">Edit Mode</span>
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isEditMode ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${isEditMode ? 'transform translate-x-7' : ''
                      }`}
                  />
                </button>
              </div>
            </div>

            {/* Schedule Items */}
            <div className="space-y-4">
              {currentSchedule.items.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Schedule Generated Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Your schedule for Day {currentSchedule.day} will be automatically generated based on your preferences.
                  </p>
                  <button
                    onClick={() => router.visit('/tour/preferences')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Go Back to Preferences
                  </button>
                </div>
              ) : (
                currentSchedule.items.map((item, index) => (
                  <div
                    key={`${item.id}-${item.type}-${index}`}
                    className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-100"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`w-14 h-14 ${getActivityColor(item.type)} rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md`}>
                        {getActivityIcon(item.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {/* Time */}
                          <span className="text-blue-600 font-bold text-lg">
                            {item.startTime} - {item.endTime}
                          </span>

                          {/* Type Tag */}
                          <span className={`px-3 py-1 ${getTagColor(item.type)} rounded-lg text-xs font-semibold uppercase`}>
                            {item.type}
                          </span>

                          {/* Distance (for transfers) */}
                          {item.distance && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                              {item.distance}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-gray-900 font-semibold text-lg mb-1">{item.title}</h3>

                        {/* Cost */}
                        <p className="text-gray-600 text-sm">
                          Cost: <span className="font-semibold text-gray-900">
                            ${formatCost(item.cost)}
                          </span>
                        </p>
                      </div>

                      {/* Edit Button (only in edit mode) */}
                      {isEditMode && (
                        <>
                        <button onClick={() => handleEditItem(item)} className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit className="w-5 h-5 text-gray-600" />
                        </button>
                        <button onClick={() => handleDeleteItem(item)} className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
                          <Trash className="w-5 h-5 text-gray-600" />
                        </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total Cost */}
            <div className="mt-8 bg-gradient-to-r from-blue-100 via-blue-50 to-purple-100 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">Total Day Cost:</span>
                <span className="text-3xl font-bold text-blue-600">
                  ${formatCost(currentSchedule.totalCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handleEditPreferences}
              className="flex items-center gap-3 px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              <Edit className="w-5 h-5" />
              Edit Preferences
            </button>

            {/* Show different button based on completion status */}
            {allDaysComplete ? (
              <button
                onClick={handleGenerateFinalTour}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                Generate Final Tour
                <Sparkles className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleContinueToNextDay}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                Continue to Next Day
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replace Item Modal */}
      {showReplaceModal && selectedItemToReplace && (
        <div className="fixed inset-0 backdrop-blur-sm bg-transparent flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                    {getActivityIcon(selectedItemToReplace.type)}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {getModalTitle(selectedItemToReplace.type)}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowReplaceModal(false);
                    setSelectedItemToReplace(null);
                    setSearchQuery('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <p className="text-gray-600 mt-2">Choose a replacement for this activity</p>
            </div>

            {/* Search Bar */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Places List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {getAvailablePlaces(selectedItemToReplace.type)
                  .filter((place: any) => 
                    place.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    place.types?.[0]?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((place: any, index: number) => (
                    <div
                      key={`${place.place_id || place.id || 'place'}-${index}`}
                      className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md">
                          {getActivityIcon(selectedItemToReplace.type)}
                        </div>

                        {/* Place Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-lg truncate">
                            {place.name}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            {place.types && place.types[0] && (
                              <span className="text-sm text-gray-600 capitalize">
                                {place.types[0].replace(/_/g, ' ')}
                              </span>
                            )}
                            {place.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-semibold text-gray-700">
                                  {formatCost(place.rating)}
                                </span>
                              </div>
                            )}
                            {place.price_level && (
                              <span className="text-sm font-semibold text-gray-700">
                                ${place.price_level}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Select Button */}
                        <button
                          onClick={() => handleReplaceItem(place)}
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  ))}

                {/* No Results */}
                {getAvailablePlaces(selectedItemToReplace.type).filter((place: any) =>
                  place.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  place.types?.[0]?.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No places found</p>
                    <p className="text-gray-500 text-sm mt-1">Try adjusting your search</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowReplaceModal(false);
                  setSelectedItemToReplace(null);
                  setSearchQuery('');
                }}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

