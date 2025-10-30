import React from 'react'
import { Calendar, Utensils, Car, MapPin, Clock, CheckCircle, X } from 'lucide-react'
import type { TourData, ScheduleItem, DaySchedule } from '@/pages/tour/FinalTour'

export interface FinalTourModalProps {
  tourData: TourData | null
  isOpen: boolean
  onClose: () => void
  language?: 'vi' | 'en'
  onBookTour?: (tourData: TourData) => void
}

export function FinalTourModal({
  tourData,
  isOpen,
  onClose,
  language = 'en',
  onBookTour,
}: FinalTourModalProps) {
  if (!isOpen || !tourData) return null

  const formatCost = (cost: any): string => {
    const numCost = parseFloat(cost)
    return isNaN(numCost) ? '0.00' : numCost.toFixed(2)
  }

  const schedules = tourData.schedules || []
  const totalCost =
    schedules.reduce((sum, schedule) => sum + schedule.totalCost, 0) +
    ((tourData?.selectedDepartureFlight?.price ?? 0) + (tourData?.selectedReturnFlight?.price ?? 0))

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'meal':
        return <Utensils className="w-5 h-5" />
      case 'transfer':
        return <Car className="w-5 h-5" />
      case 'activity':
        return <MapPin className="w-5 h-5" />
      case 'hotel':
        return <Calendar className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'meal':
        return 'bg-red-500'
      case 'transfer':
        return 'bg-blue-500'
      case 'activity':
        return 'bg-green-500'
      case 'hotel':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  const handleBookTour = () => {
    if (onBookTour) {
      onBookTour(tourData)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="sticky top-4 right-4 float-right p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
            title={language === 'vi' ? 'Đóng' : 'Close'}
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>

          <div className="p-8">
            {/* Success Banner */}
            <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl shadow-lg p-8 mb-6 text-white text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-2">
                {language === 'vi' ? 'Tour của bạn đã sẵn sàng!' : 'Your Tour is Ready!'}
              </h1>
              <p className="text-xl text-green-50">
                {language === 'vi'
                  ? `Lịch trình ${schedules.length} ngày hoàn chỉnh cho ${tourData.destination}`
                  : `Complete ${schedules.length}-day itinerary for ${tourData.destination}`}
              </p>
            </div>

            {/* Tour Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {language === 'vi' ? 'Tóm tắt tour' : 'Tour Summary'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{language === 'vi' ? 'Điểm đến' : 'Destination'}</p>
                  <p className="text-lg font-bold text-gray-900">{tourData.destination}</p>
                </div>
                {tourData.departure && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">{language === 'vi' ? 'Từ' : 'From'}</p>
                    <p className="text-lg font-bold text-gray-900">{tourData.departure}</p>
                  </div>
                )}
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{language === 'vi' ? 'Thời gian' : 'Duration'}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {schedules.length} {language === 'vi' ? 'Ngày' : 'Days'}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{language === 'vi' ? 'Tổng chi phí' : 'Total Cost'}</p>
                  <p className="text-lg font-bold text-gray-900">${formatCost(totalCost)}</p>
                </div>
                {tourData.passengers && (
                  <div className="p-4 bg-pink-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">{language === 'vi' ? 'Khách du lịch' : 'Travelers'}</p>
                    <p className="text-lg font-bold text-gray-900">{tourData.passengers}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Day-by-Day Schedule */}
            <div className="space-y-6 mb-8">
              {schedules.map((schedule) => (
                <div key={schedule.day} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  {/* Day Header */}
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">{schedule.day}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {language === 'vi' ? `Ngày ${schedule.day}` : `Day ${schedule.day}`}
                      </h3>
                      <p className="text-gray-600">{schedule.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{language === 'vi' ? 'Chi phí ngày' : 'Day Cost'}</p>
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
                        <div
                          className={`w-12 h-12 ${getActivityColor(item.type)} rounded-lg flex items-center justify-center text-white flex-shrink-0`}
                        >
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
                          <p className="text-sm text-gray-600">{language === 'vi' ? 'Chi phí' : 'Cost'}</p>
                          <p className="text-lg font-bold text-gray-900">${formatCost(item.cost)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">
                {language === 'vi' ? 'Sẵn sàng cho cuộc phiêu lưu của bạn?' : 'Ready for Your Adventure?'}
              </h2>
              <p className="text-xl text-blue-50 mb-6">
                {language === 'vi'
                  ? `Tour ${schedules.length} ngày của bạn đã được lên kế hoạch hoàn hảo và sẵn sàng!`
                  : `Your ${schedules.length}-day tour is perfectly planned and ready to go!`}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleBookTour}
                  className="px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-lg transition-colors"
                >
                  {language === 'vi' ? 'Lưu & đặt tour' : 'Save & Book Tour'}
                </button>
                <button
                  onClick={onClose}
                  className="px-8 py-4 bg-gray-300 text-gray-700 hover:bg-gray-400 font-bold rounded-lg transition-colors"
                >
                  {language === 'vi' ? 'Đóng' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinalTourModal
