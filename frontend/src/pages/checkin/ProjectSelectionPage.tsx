import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { projectService } from '@/services/api'
import { Project } from '@/types'
import { Button } from '@/components/common/Button'

export const ProjectSelectionPage = () => {
  const navigate = useNavigate()
  const [selectedProject, setSelectedProject] = useState<number | null>(null)

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getAll()
  })

  const handleSelectProject = (projectId: number) => {
    setSelectedProject(projectId)
  }

  const handleContinue = () => {
    if (selectedProject) {
      navigate(`/checkin/workflow/${selectedProject}`)
    }
  }

  const handleAddProject = () => {
    navigate('/projects/new')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando projetos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Selecione o Projeto
          </h1>

          <div className="space-y-3 mb-6">
            {projects && projects.length > 0 ? (
              projects.map((project: Project) => (
                <div
                  key={project.id}
                  onClick={() => handleSelectProject(project.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedProject === project.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {project.name}
                      </h3>
                      {project.client && (
                        <p className="text-sm text-gray-600">
                          Cliente: {project.client.name}
                        </p>
                      )}
                      {project.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {project.description}
                        </p>
                      )}
                    </div>
                    {selectedProject === project.id && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Nenhum projeto disponível</p>
                <Button onClick={handleAddProject}>
                  Adicionar Primeiro Projeto
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleAddProject}
              variant="secondary"
              className="flex-1"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Adicionar Projeto
            </Button>

            <Button
              onClick={handleContinue}
              disabled={!selectedProject}
              className="flex-1"
            >
              Continuar
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
