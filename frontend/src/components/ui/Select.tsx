import React from 'react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  children: React.ReactNode
}

export const Select = ({ label, children, className = '', ...props }: SelectProps) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>}
    <select 
      className={`w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
  </div>
)
