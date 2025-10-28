export interface User {
  id: string
  name: string
  email: string
  phone?: string
  gender?: 'Male' | 'Female' | 'Other'
  birthYear?: number
  createdAt: string
  updatedAt: string,
  is_admin: boolean
}
export interface City {
  id: string
  city: string
  country: string
}

export interface DataTour {
  city_id: string
  departure: string
  destination: string
  departureDate: string
  arrivalDate: string
  days: number
  moneyFlight: number
  passengers: number
  budget: number
  adults: number
  children: number
  infants: number
}

export interface HotelSearchParams {
  location: string
  checkin: string
  checkout: string
  guests: string
}

export interface AirlineSearchParams {
  departure: string
  destination: string
  time: string
  date: string
}

export interface Tour {
  id: string
  title: string
  location: string
  duration: string
  price: number
  currency: string
  image: string
  description?: string
}

export interface AuthData {
  user: User
  token: string
  refreshToken?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
  gender?: string
  birthYear?: number
}

export type Currency = 'USD' | 'VND'
export type Language = 'en' | 'vi'

export interface SiteConfig {
  timezone: string
  version: string
  showVersionFooter: boolean
}
