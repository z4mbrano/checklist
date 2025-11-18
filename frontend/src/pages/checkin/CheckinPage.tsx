import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckinButton } from '@/components/checkin'
import { useQuery } from '@tanstack/react-query'
import { checkinService } from '@/services/api'

export default function CheckinPage() {
  const navigate = useNavigate()
  const [currentCheckin, setCurrentCheckin] = useState<any>(null)

  const { data: checkinData, refetch } = useQuery({
    queryKey: ['current-checkin'],
    queryFn: checkinService.getCurrentCheckin,
  })

  useEffect(() => {
    setCurrentCheckin(checkinData)
    
    // If user already has an active checkin, redirect to dashboard
    if (checkinData) {
      navigate('/')
    }
  }, [checkinData, navigate])

  const handleCheckinCreated = (checkin: any) => {
    setCurrentCheckin(checkin)
    refetch()
    navigate('/')
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Iniciar Check-in</h1>
        
        <CheckinButton
          hasActiveCheckin={!!currentCheckin}
          onCheckinCreated={handleCheckinCreated}
        />
      </div>
    </div>
  )
}