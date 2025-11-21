import React from 'react'
import { LucideIcon } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'outline'
  icon?: LucideIcon
  children: React.ReactNode
}

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false, 
  icon: Icon,
  ...props
}: ButtonProps) => {
  const baseStyle = "w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variants = {
    primary: "bg-blue-900 text-white hover:bg-blue-800",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-50"
  }

  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={24} />}
      {children}
    </button>
  )
}
