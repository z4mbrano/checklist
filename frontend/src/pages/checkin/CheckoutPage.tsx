import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckoutButton } from '@/components/checkin'
import { useQuery } from '@tanstack/react-query'
import { checkinService } from '@/services/api'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [currentCheckin, setCurrentCheckin] = useState<any>(null)

  const { data: checkinData, refetch } = useQuery({
    queryKey: ['current-checkin'],
    queryFn: checkinService.getCurrentCheckin,
  })

  useEffect(() => {
    setCurrentCheckin(checkinData)
    
    // If user doesn't have an active checkin, redirect to dashboard
    if (!checkinData) {
      navigate('/')
    }
  }, [checkinData, navigate])

  const handleCheckoutCompleted = () => {
    setCurrentCheckin(null)
    refetch()
    navigate('/')
  }

  if (!currentCheckin) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-400">Nenhuma sessão ativa encontrada.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Finalizar Check-out</h1>
        
        <CheckoutButton
          activeCheckin={currentCheckin}
          onCheckoutCompleted={handleCheckoutCompleted}
        />
      </div>
    </div>
  )
}