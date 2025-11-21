import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Input = ({ label, className = '', ...props }: InputProps) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>}
    <input 
      className={`w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all ${className}`}
      {...props}
    />
  </div>
)
