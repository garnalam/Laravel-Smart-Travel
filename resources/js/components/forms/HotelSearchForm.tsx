'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { HotelSearchParams } from '@/types/domain'
import { Button } from '@/components/ui/Button_dashboard'
import { Input } from '@/components/ui/Input_dashboard'
import { Select } from '@/components/ui/Select_dashboard'
import { useToast } from '@/hooks/useToast'
import { getMinDate } from '@/lib/utils'

export function HotelSearchForm() {
  const { language } = useAppStore()
  const { success, error } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<HotelSearchParams>>({
    location: '',
    checkin: '',
    checkout: '',
    guests: '',
  })

  const locationOptions = [
    { value: '', label: language === 'vi' ? 'Chọn tỉnh thành' : 'Select province' },
    { value: 'hanoi', label: language === 'vi' ? 'Hà Nội' : 'Ha Noi' },
    { value: 'hochiminh', label: language === 'vi' ? 'Hồ Chí Minh' : 'Ho Chi Minh' },
    { value: 'danang', label: language === 'vi' ? 'Đà Nẵng' : 'Da Nang' },
    { value: 'phuquoc', label: language === 'vi' ? 'Phú Quốc' : 'Phu Quoc' },
    { value: 'nhatrang', label: 'Nha Trang' },
  ]

  const guestOptions = [
    { value: '1-room-2-adult', label: language === 'vi' ? '1 phòng, 2 người lớn' : '1 room, 2 adults' },
    { value: '1-room-1-adult', label: language === 'vi' ? '1 phòng, 1 người lớn' : '1 room, 1 adult' },
    { value: '2-room-4-adult', label: language === 'vi' ? '2 phòng, 4 người lớn' : '2 rooms, 4 adults' },
    {
      value: '1-room-2-adult-1-child',
      label: language === 'vi' ? '1 phòng, 2 người lớn, 1 trẻ em' : '1 room, 2 adults, 1 child',
    },
  ]

  const handleInputChange =
    (field: keyof HotelSearchParams) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formData.location || !formData.checkin || !formData.checkout) {
      error(
        language === 'vi'
          ? 'Vui lòng điền đầy đủ thông tin bắt buộc'
          : 'Please fill all required fields'
      )
      return
    }

    setIsLoading(true)

    try {
      const searchParams: HotelSearchParams = {
        location: formData.location!,
        checkin: formData.checkin!,
        checkout: formData.checkout!,
        guests: formData.guests || '1-room-2-adult',
      }

      success(
        language === 'vi' ? 'Tìm kiếm khách sạn thành công!' : 'Hotel search completed successfully!'
      )
      console.log('Hotel search payload:', searchParams)
    } catch (err) {
      error(
        language === 'vi'
          ? 'Có lỗi xảy ra khi tìm kiếm khách sạn'
          : 'An error occurred during hotel search'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="dashboard-form dashboard-form--compact">
      <div className="dashboard-form__row dashboard-form__row--tight">
        <Select
          label={language === 'vi' ? 'Vị trí *' : 'Location *'}
          value={formData.location || ''}
          onChange={handleInputChange('location')}
          options={locationOptions}
          required
          className="dashboard-form__select"
        />

        <Input
          label={language === 'vi' ? 'Ngày nhận phòng' : 'Check-in'}
          type="date"
          value={formData.checkin || ''}
          onChange={handleInputChange('checkin')}
          min={getMinDate()}
          required
          className="dashboard-form__input"
        />

        <Input
          label={language === 'vi' ? 'Ngày trả phòng' : 'Check-out'}
          type="date"
          value={formData.checkout || ''}
          onChange={handleInputChange('checkout')}
          min={formData.checkin || getMinDate()}
          required
          className="dashboard-form__input"
        />

        <div className="dashboard-form__field dashboard-form__field--stack">
          <Select
            label={language === 'vi' ? 'Số khách' : 'Guests'}
            value={formData.guests || '1-room-2-adult'}
            onChange={handleInputChange('guests')}
            options={guestOptions}
            className="dashboard-form__select"
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
