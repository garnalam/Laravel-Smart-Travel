import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

    const variants = {
      primary: 'bg-gradient-to-r from-[#FFE4C4] to-[#F4B973] text-[#0F1F26] shadow-[0_18px_35px_-25px_rgba(255,210,155,0.7)] hover:shadow-[0_18px_45px_-22px_rgba(255,210,155,0.8)] focus:ring-[#F4B973]',
      secondary: 'bg-[#1A2E3A] text-[#E3EEF2] hover:bg-[#223746] focus:ring-[#223746]',
      outline: 'border border-white/20 bg-transparent text-[#E3EEF2] hover:border-[#FFE4C4] focus:ring-[#FFE4C4]',
      ghost: 'bg-transparent text-[#E3EEF2]/80 hover:bg-white/10 focus:ring-white/20',
      destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    }

    const sizes = {
      sm: 'px-3.5 py-2 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-6.5 py-3.5 text-base'
    }
    
    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          (disabled || isLoading) && 'opacity-60 cursor-not-allowed backdrop-blur',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <i className="fas fa-spinner fa-spin mr-2" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
