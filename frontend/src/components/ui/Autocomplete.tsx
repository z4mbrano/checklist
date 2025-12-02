import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'

interface Option {
  id: number | string
  label: string
  subLabel?: string
}

interface AutocompleteProps {
  label: string
  placeholder?: string
  onSearch: (query: string) => Promise<Option[]>
  onSelect: (option: Option) => void
  initialValue?: Option | null
  className?: string
}

export const Autocomplete = ({
  label,
  placeholder = 'Buscar...',
  onSearch,
  onSelect,
  initialValue = null,
  className = ''
}: AutocompleteProps) => {
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<Option[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<Option | null>(initialValue)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialValue) {
      setSelected(initialValue)
      setQuery(initialValue.label)
    }
  }, [initialValue])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2 && !selected) {
        setIsLoading(true)
        try {
          const results = await onSearch(query)
          setOptions(results)
          setIsOpen(true)
        } catch (error) {
          console.error('Search failed:', error)
          setOptions([])
        } finally {
          setIsLoading(false)
        }
      } else if (query.length < 2) {
        setOptions([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, onSearch, selected])

  const handleSelect = (option: Option) => {
    setSelected(option)
    setQuery(option.label)
    setIsOpen(false)
    onSelect(option)
  }

  const handleClear = () => {
    setSelected(null)
    setQuery('')
    setOptions([])
    onSelect({ id: 0, label: '' }) // Reset
  }

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (selected) setSelected(null) // Clear selection on edit
          }}
          onFocus={() => {
            if (options.length > 0 && !selected) setIsOpen(true)
          }}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          ) : selected || query ? (
            <button onClick={handleClear} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {isOpen && options.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {options.map((option) => (
            <div
              key={option.id}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-slate-900"
              onClick={() => handleSelect(option)}
            >
              <div className="flex flex-col">
                <span className="font-medium truncate">{option.label}</span>
                {option.subLabel && (
                  <span className="text-xs text-slate-500 truncate">{option.subLabel}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isOpen && options.length === 0 && !isLoading && query.length >= 2 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-2 px-3 text-sm text-slate-500">
          Nenhum resultado encontrado.
        </div>
      )}
    </div>
  )
}
