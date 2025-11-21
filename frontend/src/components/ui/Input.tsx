import React, { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, className = '', ...props }, ref) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>}
    <input 
      ref={ref}
      className={`w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all ${className}`}
      {...props}
    />
  </div>
))

Input.displayName = 'Input'
