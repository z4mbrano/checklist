import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { clientService } from '../../services/api'
import { toast } from 'react-hot-toast'

interface ClientFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (client: any) => void
}

export const ClientFormModal = ({ isOpen, onClose, onSuccess }: ClientFormModalProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome) {
      toast.error('Nome é obrigatório')
      return
    }

    setIsLoading(true)
    try {
      const newClient = await clientService.create(formData)
      toast.success('Cliente cadastrado com sucesso!')
      onSuccess(newClient)
      onClose()
      setFormData({
        nome: '',
        cnpj: '',
        email: '',
        telefone: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: ''
      })
    } catch (error) {
      console.error('Error creating client:', error)
      toast.error('Erro ao cadastrar cliente')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Cliente">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Nome / Razão Social *"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          required
        />
        
        <div className="grid grid-cols-2 gap-5">
          <Input
            label="CNPJ"
            name="cnpj"
            value={formData.cnpj}
            onChange={handleChange}
          />
          <Input
            label="Telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />

        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-600 mb-4 uppercase tracking-wide">Endereço</h3>
          <div className="space-y-5">
          <Input
            label="Endereço"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
          />

          <div className="grid grid-cols-10 gap-5">
            <div className="col-span-4">
              <Input
                label="Cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-2">
              <Input
                label="UF"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                maxLength={2}
              />
            </div>
            <div className="col-span-4">
              <Input
                label="CEP"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
              />
            </div>
          </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-8 border-t border-slate-100 mt-8">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="w-auto border-0 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-auto px-8"
          >
            {isLoading ? 'Salvando...' : 'Salvar Cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
