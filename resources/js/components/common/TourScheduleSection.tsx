import React, { useMemo } from 'react'
import {
  Calendar,
  Car,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit,
  MapPin,
  Sparkles,
  Utensils,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { DataTour } from '@/types/domain'

export interface ScheduleItem {
  id: string | number
  place_id?: string
  type: 'meal' | 'transfer' | 'activity' | 'hotel'
  startTime: string
  endTime: string
  title: string
  cost: number
  distance?: string
  transport_mode?: string
}

export interface DaySchedule {
  day: number
  date: string
  completed: boolean
  items: ScheduleItem[]
  totalCost: number
}

export interface TourScheduleSectionProps {
  tourData?: Partial<DataTour>
  schedules: Record<number, DaySchedule>
  currentDay: number
  onDayChange: (day: number) => void
  onEditPreferences: (day: number) => void
  onContinueNextDay: (nextDay: number) => void
  onGenerateFinal?: () => void
  className?: string
}

const formatCost = (value: number | string | undefined) => {
  const numeric = typeof value === 'string' ? parseFloat(value) : value || 0
  return Number.isFinite(numeric) ? numeric.toFixed(2) : '0.00'
}

export function TourScheduleSection({
  tourData,
  schedules,
  currentDay,
  onDayChange,
  onEditPreferences,
  onContinueNextDay,
  onGenerateFinal,
  className,
}: TourScheduleSectionProps) {
  const { language } = useAppStore()

  const totalDays = useMemo(() => {
    if (tourData?.days && tourData.days > 0) {
      return tourData.days
    }
    const keys = Object.keys(schedules).map((k: string) => Number(k))
    return keys.length > 0 ? Math.max(...keys) : 1
  }, [schedules, tourData?.days])

  const currentSchedule = schedules[currentDay]

  const isAllDaysComplete = useMemo(() => {
    if (!totalDays) return false
    for (let day = 1; day <= totalDays; day += 1) {
      if (!schedules[day]) return false
    }
    return true
  }, [schedules, totalDays])

  const handlePreviousDay = () => {
    const prev = Math.max(1, currentDay - 1)
    if (prev !== currentDay) {
      onDayChange(prev)
    }
  }

  const handleNextDay = () => {
    const next = Math.min(totalDays, currentDay + 1)
    if (next !== currentDay) {
      onDayChange(next)
    }
  }

  const nextDay = currentDay + 1
  const canContinueNextDay = nextDay <= totalDays

  return (
    <section
      className={`dashboard-tour-schedule${className ? ` ${className}` : ''}`}
      id="dashboard-tour-schedule"
    >
      <div className="dashboard-tour-schedule__halo" aria-hidden="true" />
      <header className="dashboard-tour-schedule__header">
        <div className="dashboard-tour-schedule__chip">
          <span>{language === 'vi' ? 'Lịch trình cá nhân hoá' : 'Personalised itinerary'}</span>
          <span className="dashboard-tour-schedule__chip-sep" />
          <span>
            {language === 'vi' ? 'Ngày' : 'Day'} {currentDay}/{totalDays || 1}
          </span>
        </div>
        <div className="dashboard-tour-schedule__titles">
          <h2>
            {language === 'vi'
              ? 'Khám phá lịch trình được tạo cho bạn'
              : 'Review the tailored schedule crafted for you'}
          </h2>
          <p>
            {language === 'vi'
              ? 'Lịch trình được xây dựng dựa trên sở thích bạn đã chọn. Bạn vẫn có thể quay lại điều chỉnh để tinh chỉnh thêm.'
              : 'This schedule reflects the preferences you selected. Jump back to preferences any time to refine the plan further.'}
          </p>
        </div>
      </header>

      <div className="dashboard-tour-schedule__summary">
        <div className="dashboard-tour-schedule__progress">
          <h3>{language === 'vi' ? 'Tiến độ tổng thể' : 'Overall progress'}</h3>
          <div className="dashboard-tour-schedule__steps">
            {Array.from({ length: totalDays || 1 }, (_: unknown, index: number) => index + 1).map((day) => {
              const isCompleted = !!schedules[day]
              const isActive = day === currentDay
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => onDayChange(day)}
                  className={`dashboard-tour-schedule__step ${isCompleted ? 'is-complete' : ''} ${
                    isActive ? 'is-active' : ''
                  }`}
                >
                  <span>{day}</span>
                  <small>
                    {isCompleted
                      ? language === 'vi'
                        ? 'Hoàn tất'
                        : 'Done'
                      : language === 'vi'
                        ? 'Chờ xử lý'
                        : 'Pending'}
                  </small>
                </button>
              )
            })}
          </div>
        </div>

        <div className="dashboard-tour-schedule__tour-info">
          <div>
            <span>{language === 'vi' ? 'Điểm đến' : 'Destination'}</span>
            <strong>{tourData?.destination || '—'}</strong>
          </div>
          <div>
            <span>{language === 'vi' ? 'Khởi hành' : 'Departure'}</span>
            <strong>{tourData?.departure || '—'}</strong>
          </div>
          <div>
            <span>{language === 'vi' ? 'Thời lượng' : 'Duration'}</span>
            <strong>
              {totalDays || 0} {language === 'vi' ? 'ngày' : 'days'}
            </strong>
          </div>
          <div>
            <span>{language === 'vi' ? 'Ngân sách' : 'Budget'}</span>
            <strong>
              {tourData?.budget
                ? new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(tourData.budget as number)
                : '—'}
            </strong>
          </div>
        </div>
      </div>

      <div className="dashboard-tour-schedule__controller">
        <button
          type="button"
          className="dashboard-tour-schedule__nav"
          onClick={handlePreviousDay}
          disabled={currentDay === 1}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="dashboard-tour-schedule__day">
          <div className="dashboard-tour-schedule__day-icon">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span>{language === 'vi' ? 'Ngày' : 'Day'} {currentDay}</span>
            <strong>{language === 'vi' ? 'Lịch trình chi tiết' : 'Detailed schedule'}</strong>
          </div>
        </div>
        <button
          type="button"
          className="dashboard-tour-schedule__nav"
          onClick={handleNextDay}
          disabled={currentDay === totalDays}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="dashboard-tour-schedule__card">
        {!currentSchedule ? (
          <div className="dashboard-tour-schedule__empty">
            <Calendar className="w-12 h-12" />
            <h3>
              {language === 'vi'
                ? 'Chưa có lịch trình cho ngày này'
                : 'No schedule has been generated for this day yet'}
            </h3>
            <p>
              {language === 'vi'
                ? 'Hãy quay lại phần tùy chỉnh ưu tiên để tạo lịch trình.'
                : 'Return to preferences to generate a personalised plan for this day.'}
            </p>
            <button
              type="button"
              onClick={() => onEditPreferences(currentDay)}
              className="dashboard-tour-schedule__ghost"
            >
              <Edit className="w-4 h-4" />
              <span>{language === 'vi' ? 'Điều chỉnh ưu tiên' : 'Adjust preferences'}</span>
            </button>
          </div>
        ) : (
          <div className="dashboard-tour-schedule__content">
            <div className="dashboard-tour-schedule__items">
              {currentSchedule.items.map((item: ScheduleItem, index: number) => (
                <div key={`${item.id}-${index}`} className="dashboard-tour-schedule__item">
                  <div className={`dashboard-tour-schedule__item-icon dashboard-tour-schedule__item-icon--${item.type}`}>
                    {item.type === 'meal' && <Utensils className="w-5 h-5" />}
                    {item.type === 'transfer' && <Car className="w-5 h-5" />}
                    {item.type === 'activity' && <MapPin className="w-5 h-5" />}
                    {item.type === 'hotel' && <CheckCircle className="w-5 h-5" />}
                  </div>
                  <div className="dashboard-tour-schedule__item-body">
                    <div className="dashboard-tour-schedule__item-header">
                      <span className="dashboard-tour-schedule__item-time">
                        {item.startTime} – {item.endTime}
                      </span>
                      <span className={`dashboard-tour-schedule__item-type dashboard-tour-schedule__item-type--${item.type}`}>
                        {item.type}
                      </span>
                    </div>
                    <h4>{item.title}</h4>
                    <div className="dashboard-tour-schedule__item-meta">
                      <span>
                        {language === 'vi' ? 'Chi phí' : 'Cost'}: ${formatCost(item.cost)}
                      </span>
                      {'distance' in item && item.distance ? <span>{item.distance}</span> : null}
                      {'transport_mode' in item && item.transport_mode ? <span>{item.transport_mode}</span> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <footer className="dashboard-tour-schedule__footer">
              <div className="dashboard-tour-schedule__footer-meta">
                <span>{language === 'vi' ? 'Tổng chi phí ngày' : 'Total day cost'}</span>
                <strong>${formatCost(currentSchedule.totalCost)}</strong>
              </div>
              <div className="dashboard-tour-schedule__footer-actions">
                <button
                  type="button"
                  className="dashboard-tour-schedule__ghost"
                  onClick={() => onEditPreferences(currentDay)}
                >
                  <Edit className="w-4 h-4" />
                  <span>{language === 'vi' ? 'Điều chỉnh ưu tiên' : 'Edit preferences'}</span>
                </button>
                {canContinueNextDay ? (
                  <button
                    type="button"
                    className="dashboard-tour-schedule__primary"
                    onClick={() => onContinueNextDay(nextDay)}
                  >
                    <span>
                      {language === 'vi'
                        ? `Tiếp tục tới ngày ${nextDay}`
                        : `Continue to day ${nextDay}`}
                    </span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`dashboard-tour-schedule__primary ${isAllDaysComplete ? '' : 'is-disabled'}`}
                    onClick={onGenerateFinal}
                    disabled={!onGenerateFinal || !isAllDaysComplete}
                  >
                    <span>
                      {language === 'vi'
                        ? 'Tổng kết hành trình'
                        : 'Generate final itinerary'}
                    </span>
                    <Sparkles className="w-5 h-5" />
                  </button>
                )}
              </div>
            </footer>
          </div>
        )}
      </div>
    </section>
  )
}

export default TourScheduleSection
