import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Calendar, Utensils, Car, MapPin, Clock, CheckCircle, Download, Share2, Home } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { useToast } from '@/hooks/useToast';
import { start } from 'repl';
interface ScheduleItem {
  id: string | number;
  place_id?: string;
  type: 'meal' | 'transfer' | 'activity' | 'hotel';
  startTime: string;
  endTime: string;
  title: string;
  cost: number;
  transport_mode?: string;
  distance?: string;
  selectedDepartureFlight?: any;
  selectedReturnFlight?: any;
}

interface DaySchedule {
  day: number;
  date: string;
  completed: boolean;
  items: ScheduleItem[];
  totalCost: number;
}

interface TourData {
  schedules: DaySchedule[];
  selectedDepartureFlight?: any;
  selectedReturnFlight?: any;
  destination?: string;
  departure?: string;
  days?: number;
  budget?: number;
  passengers?: number;
}
export default function FinalTour() {
  const { props } = usePage<{ tourData?: TourData, user: any }>();
  const tourData = props.tourData;

  useEffect(() => {
    console.log('tourData', props);
  }, [tourData]);
  if (!tourData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Tour Data Found</h1>
            <p className="text-gray-600 mb-6">Please start a new tour to see your itinerary.</p>
            <button
              onClick={() => router.visit('/tour/flight')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
            >
              Start New Tour
            </button>
          </div>
        </div>
      </>
    );
  }
  const formatCost = (cost: any): string => {
    const numCost = parseFloat(cost);
    return isNaN(numCost) ? '0.00' : numCost.toFixed(2);
  };
  const schedules = tourData.schedules || [];
  const totalCost = schedules.reduce((sum, schedule) => sum + schedule.totalCost, 0) + ((tourData?.selectedDepartureFlight?.price ?? 0) + (tourData?.selectedReturnFlight?.price ?? 0));
  const { success, error } = useToast()
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
        return 'bg-red-500';
      case 'transfer':
        return 'bg-blue-500';
      case 'activity':
        return 'bg-green-500';
      case 'hotel':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleBookTour = () => {
    const data_payment  = {
      departure: tourData.departure,
      days: schedules.length,
      passengers: tourData.passengers,
      days_cost: schedules.map(schedule => schedule.totalCost),
      total_cost: totalCost,
      flight_cost: 100,
      start_date: new Date(schedules[0].date).toISOString().split('T')[0],
      itinerary: schedules.map(s => ({
        day: s.day, date: s.date, completed: s.completed, totalCost: s.totalCost,
        hotel_id: s.items.map(s => s.type === 'hotel' ? s.place_id : null).filter(Boolean),
        restaurants_id: s.items.map(s => s.type === 'meal' ? s.place_id : null).filter(Boolean),
        activities_id: s.items.map(s => s.type === 'activity' ? s.place_id : null).filter(Boolean),
        transportation_mode: s.items.map(s => s.type === 'transfer' ? s.transport_mode : null).filter(Boolean),
      })),
      flights: {
        selectedDepartureFlight : props.tourData?.selectedDepartureFlight,
        selectedReturnFlight : props.tourData?.selectedReturnFlight,
      },
      schedules : schedules.map(s => ({
        day: s.day, totalCost: s.totalCost,
        items: s.items.map(i => ({ id: i.id, place_id: i.place_id, type: i.type, startTime: i.startTime, endTime: i.endTime, title: i.title, cost: i.cost,transport_mode: i.transport_mode}))
      })),  
    };
    console.log(data_payment);
    router.post('/tour/save-tour-data', data_payment, {
      onSuccess: () => {
        success('Tour saved! Redirecting to payment...');
      },
      onError: (errors) => {
        console.error('Error saving tour:', errors);
        error('Failed to save tour data');
      }
    });
    
  };

  const handleDownload = () => {
    // TODO: Implement PDF download functionality
    alert('Download feature coming soon!');
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    alert('Share feature coming soon!');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Success Banner */}
          <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl shadow-lg p-8 mb-6 text-white text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">Your Tour is Ready!</h1>
            <p className="text-xl text-green-50">
              Complete {schedules.length}-day itinerary for {tourData.destination}
            </p>
          </div>

          {/* Tour Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tour Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Destination</p>
                <p className="text-lg font-bold text-gray-900">{tourData.destination}</p>
              </div>
              {tourData.departure && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">From</p>
                  <p className="text-lg font-bold text-gray-900">{tourData.departure}</p>
                </div>
              )}
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Duration</p>
                <p className="text-lg font-bold text-gray-900">{schedules.length} Days</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                <p className="text-lg font-bold text-gray-900">${formatCost(totalCost)}</p>
              </div>
              {tourData.passengers && (
                <div className="p-4 bg-pink-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Travelers</p>
                  <p className="text-lg font-bold text-gray-900">{tourData.passengers}</p>
                </div>
              )}
            </div>
          </div>
          {/* Day-by-Day Schedule */}
          {schedules.map((schedule) => (
            <div key={schedule.day} className="bg-white rounded-xl shadow-sm p-6 mb-6">
              {/* Day Header */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{schedule.day}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">Day {schedule.day}</h3>
                  <p className="text-gray-600">{schedule.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Day Cost</p>
                  <p className="text-2xl font-bold text-blue-600">${formatCost(schedule.totalCost)}</p>
                </div>
              </div>

              {/* Schedule Items */}
              <div className="space-y-3">
                {schedule.items.map((item, index) => (
                  <div
                    key={`${item.id}-${item.type}-${index}`}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-12 h-12 ${getActivityColor(item.type)} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                      {getActivityIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-blue-600 font-bold">
                          {item.startTime} - {item.endTime}
                        </span>
                        <span className="px-2 py-1 bg-white rounded text-xs font-semibold text-gray-700 uppercase">
                          {item.type}
                        </span>
                        {item.distance && (
                          <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-600">
                            {item.distance}
                          </span>
                        )}
                      </div>
                      <h4 className="text-gray-900 font-semibold">{item.title}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Cost</p>
                      <p className="text-lg font-bold text-gray-900">${formatCost(item.cost)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Final Summary */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Ready for Your Adventure?</h2>
            <p className="text-xl text-blue-50 mb-6">
              Your {schedules.length}-day tour is perfectly planned and ready to go!
            </p>
            <button
              onClick={handleBookTour}
              className="px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-lg transition-colors"
            >
              save and book tour
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

