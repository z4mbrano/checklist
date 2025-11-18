import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface TimerProps {
  startTime: string // ISO string
  isRunning?: boolean
  className?: string
}

export function Timer({ startTime, isRunning = true, className = '' }: TimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      const start = new Date(startTime).getTime()
      const now = new Date().getTime()
      const elapsed = Math.floor((now - start) / 1000) // seconds
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, isRunning])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`p-2 rounded-full ${isRunning ? 'bg-vrd-red/20' : 'bg-gray-600/20'}`}>
        <Clock 
          className={`w-6 h-6 ${isRunning ? 'text-vrd-red animate-pulse' : 'text-gray-400'}`} 
        />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          {isRunning ? 'Tempo Decorrido' : 'Duração'}
        </span>
        <span className={`text-2xl font-mono font-bold ${isRunning ? 'text-vrd-red' : 'text-white'}`}>
          {formatTime(elapsedTime)}
        </span>
      </div>
    </div>
  )
}