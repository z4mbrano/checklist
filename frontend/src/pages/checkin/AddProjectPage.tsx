import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { projectService, clientService } from '@/services/api'
import { CreateProjectRequest } from '@/types'
import { Button } from '@/components/common/Button'

export const AddProjectPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: '',
    description: '',
    client_id: 0,
    status: 'active'
  })

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getAll()
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectRequest) => projectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      navigate('/checkin/select-project')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'client_id' ? Number(value) : value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Adicionar Novo Projeto
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nome do Projeto *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite o nome do projeto"
              />
            </div>

            <div>
              <label
                htmlFor="client_id"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Cliente *
              </label>
              <select
                id="client_id"
                name="client_id"
                required
                value={formData.client_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Selecione um cliente</option>
                {clients?.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descreva o projeto (opcional)"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => navigate('/checkin/select-project')}
                variant="secondary"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || !formData.name || !formData.client_id}
                className="flex-1"
              >
                {createMutation.isPending ? 'Salvando...' : 'Salvar Projeto'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
