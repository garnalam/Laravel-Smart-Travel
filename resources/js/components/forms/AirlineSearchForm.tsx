'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { AirlineSearchParams } from '@/types/domain'
import { Button } from '@/components/ui/Button_dashboard'
import { Input } from '@/components/ui/Input_dashboard'
import { Select } from '@/components/ui/Select_dashboard'
import { useToast } from '@/hooks/useToast'
import { getMinDate } from '@/lib/utils'

export function AirlineSearchForm() {
  const { language } = useAppStore()
  const { success, error } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<AirlineSearchParams>>({
    departure: '',
    destination: '',
    time: '',
    date: '',
  })

  const locationOptions = [
    { value: '', label: language === 'vi' ? 'Chọn tỉnh thành' : 'Select province' },
    { value: 'other', label: language === 'vi' ? 'Tỉnh thành khác' : 'Other province' },
    { value: 'hanoi', label: language === 'vi' ? 'Hà Nội' : 'Ha Noi' },
    { value: 'hochiminh', label: language === 'vi' ? 'Hồ Chí Minh' : 'Ho Chi Minh' },
    { value: 'danang', label: language === 'vi' ? 'Đà Nẵng' : 'Da Nang' },
    { value: 'phuquoc', label: language === 'vi' ? 'Phú Quốc' : 'Phu Quoc' },
    { value: 'nhatrang', label: 'Nha Trang' },
  ]

  const handleInputChange =
    (field: keyof AirlineSearchParams) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formData.departure || !formData.destination || !formData.date) {
      error(
        language === 'vi'
          ? 'Vui lòng điền đầy đủ thông tin bắt buộc'
          : 'Please fill all required fields'
      )
      return
    }

    setIsLoading(true)

    try {
      const searchParams: AirlineSearchParams = {
        departure: formData.departure!,
        destination: formData.destination!,
        time: formData.time || '',
        date: formData.date!,
      }

      success(
        language === 'vi'
          ? 'Tìm kiếm chuyến bay thành công!'
          : 'Flight search completed successfully!'
      )
      console.log('Airline search payload:', searchParams)
    } catch (err) {
      error(
        language === 'vi'
          ? 'Có lỗi xảy ra khi tìm kiếm chuyến bay'
          : 'An error occurred during flight search'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="dashboard-form dashboard-form--compact">
      <div className="dashboard-form__row dashboard-form__row--tight">
        <Select
          label={language === 'vi' ? 'Điểm khởi hành *' : 'Departure *'}
          value={formData.departure || ''}
          onChange={handleInputChange('departure')}
          options={locationOptions}
          required
          className="dashboard-form__select"
        />

        <Select
          label={language === 'vi' ? 'Điểm đến *' : 'Destination *'}
          value={formData.destination || ''}
          onChange={handleInputChange('destination')}
          options={locationOptions}
          required
          className="dashboard-form__select"
        />

        <Input
          label={language === 'vi' ? 'Giờ khởi hành' : 'Departure time'}
          type="time"
          value={formData.time || ''}
          onChange={handleInputChange('time')}
          className="dashboard-form__input"
        />

        <div className="dashboard-form__field dashboard-form__field--stack">
          <Input
            label={language === 'vi' ? 'Ngày khởi hành *' : 'Departure date *'}
            type="date"
            value={formData.date || ''}
            onChange={handleInputChange('date')}
            min={getMinDate()}
            required
            className="dashboard-form__input"
          />

          <Button
            type="submit"
            isLoading={isLoading}
            className="dashboard-form__primary"
          >
            {language === 'vi' ? 'Tạo đề xuất' : 'Generate proposal'}
          </Button>
        </div>
      </div>
    </form>
  )
}
