import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2'
    
    const variantClasses = {
      primary: 'bg-vrd-blue hover:bg-blue-600 text-white focus:ring-vrd-blue',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
      danger: 'bg-vrd-red hover:bg-red-600 text-white focus:ring-vrd-red',
      success: 'bg-vrd-green hover:bg-green-600 text-white focus:ring-vrd-green',
      outline: 'border border-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    }
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }
    
    const disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-current'

    return (
      <button
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          disabledClasses,
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'