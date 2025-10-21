'use client'

import { useCallback } from 'react'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

// Create toast container in DOM
let toastContainer: HTMLDivElement | null = null

const createToastContainer = () => {
  if (toastContainer) return toastContainer
  
  toastContainer = document.createElement('div')
  toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2'
  toastContainer.style.zIndex = '9999'
  document.body.appendChild(toastContainer)
  return toastContainer
}

const getToastStyles = (type: 'success' | 'error' | 'warning' | 'info') => {
  const baseStyles = 'px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out max-w-sm'
  
  switch(type) {
    case 'success':
      return `${baseStyles} bg-green-500 text-white border-l-4 border-green-600`
    case 'error':
      return `${baseStyles} bg-red-500 text-white border-l-4 border-red-600`
    case 'warning':
      return `${baseStyles} bg-yellow-500 text-white border-l-4 border-yellow-600`
    case 'info':
      return `${baseStyles} bg-blue-500 text-white border-l-4 border-blue-600`
    default:
      return baseStyles
  }
}

const getToastIcon = (type: 'success' | 'error' | 'warning' | 'info') => {
  switch(type) {
    case 'success':
      return '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
    case 'error':
      return '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>'
    case 'warning':
      return '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>'
    case 'info':
      return '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>'
  }
}

const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number = 5000) => {
  const container = createToastContainer()
  const toastId = `toast-${Date.now()}`
  
  const toast = document.createElement('div')
  toast.id = toastId
  toast.className = getToastStyles(type)
  toast.style.animation = 'slide-in-right 0.3s ease-out'
  
  toast.innerHTML = `
    <div class="flex items-center">
      <div class="flex-shrink-0">
        ${getToastIcon(type)}
      </div>
      <div class="ml-3">
        <p class="text-sm font-medium">${message}</p>
      </div>
    </div>
  `
  
  container.appendChild(toast)
  
  // Auto remove after duration
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)'
    toast.style.opacity = '0'
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast)
      }
    }, 300)
  }, duration)
}

export function useToast() {
  const success = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration)
  }, [])

  const error = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration)
  }, [])

  const warning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration)
  }, [])

  const info = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration)
  }, [])

  return {
    success,
    error,
    warning,
    info
  }
}
