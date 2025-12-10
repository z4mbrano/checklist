import React from 'react'
import { CheckCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Screen } from '../../types/mobile'

interface SuccessScreenProps {
  onNavigate: (screen: Screen) => void
}

export const SuccessScreen = ({ onNavigate }: SuccessScreenProps) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-emerald-600 text-white text-center">
    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
      <CheckCircle size={48} className="text-white" />
    </div>
    <h1 className="text-3xl font-bold mb-2">Sucesso!</h1>
    <p className="text-emerald-100 mb-8 max-w-xs">Apontamento registrado e sincronizado com o servidor.</p>
    <Button variant="outline" className="bg-white text-emerald-700 border-transparent hover:bg-emerald-50 max-w-xs" onClick={() => onNavigate('dashboard')}>
      Voltar ao Início
    </Button>
  </div>
)
