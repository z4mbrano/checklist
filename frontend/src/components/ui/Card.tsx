import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export const Card = ({ children, className = '', onClick, ...props }: CardProps) => (
  <div 
    onClick={onClick} 
    className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
)
