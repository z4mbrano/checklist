import React, { useState } from 'react';
import { Plus, Calendar, CheckCircle, Circle, Trash2, MoreVertical, X, ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useSprints } from '../../hooks/useSprints';
import { SprintStatus, CreateSprint, Sprint } from '../../types/sprint.types';
import { useData } from '../../contexts/DataContext';
import { format, isValid } from 'date-fns';

const safeFormat = (dateStr: string, formatStr: string) => {
  const date = new Date(dateStr);
  return isValid(date) ? format(date, formatStr) : 'Invalid Date';
};

interface SprintsScreenProps {
  onNavigate: (page: string) => void;
}

export const SprintsScreen: React.FC<SprintsScreenProps> = ({ onNavigate }) => {
  const { projects } = useData();
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const { sprints, loading, createSprint, updateSprintStatus, updateSprintTask, deleteSprint } = useSprints(selectedProjectId);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [formData, setFormData] = useState<Partial<CreateSprint>>({
    title: '',
    start_date: '',
    end_date: '',
    observation: '',
    tasks: []
  });

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedProjectId(val ? Number(val) : undefined);
  };

  const handleAddTask = () => {
    if (!newTaskDescription.trim()) return;
    setFormData(prev => ({
      ...prev,
      tasks: [...(prev.tasks || []), { description: newTaskDescription }]
    }));
    setNewTaskDescription('');
  };

  const handleRemoveTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.start_date || !formData.end_date || !selectedProjectId) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await createSprint({
        project_id: selectedProjectId,
        title: formData.title,
        start_date: formData.start_date,
        end_date: formData.end_date,
        observation: formData.observation,
        tasks: formData.tasks || []
      });
      setIsCreateModalOpen(false);
      setFormData({ title: '', start_date: '', end_date: '', observation: '', tasks: [] });
    } catch (error) {
      alert('Failed to create sprint');
    }
  };

  const toggleTask = async (sprint: Sprint, taskId: number, currentStatus: boolean) => {
    try {
      await updateSprintTask(sprint.id, taskId, { is_completed: !currentStatus });
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const handleDeleteSprint = async (id: number) => {
    if (confirm('Are you sure you want to delete this sprint?')) {
      await deleteSprint(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-slate-200 rounded-full">
            <ArrowLeft size={24} className="text-slate-700" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Gestão de Sprints</h1>
        </div>
        <div className="flex gap-4">
          <select 
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={selectedProjectId || ''}
            onChange={handleProjectChange}
          >
            <option value="">Select Project</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!selectedProjectId}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Sprint
          </Button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sprints.map(sprint => (
            <Card key={sprint.id} className="p-4 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{sprint.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    {safeFormat(sprint.start_date, 'MMM d')} - {safeFormat(sprint.end_date, 'MMM d, yyyy')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    sprint.status === SprintStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                    sprint.status === SprintStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {(sprint.status || 'planned').replace('_', ' ')}
                  </span>
                  <button onClick={() => handleDeleteSprint(sprint.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-2 mb-4">
                {(sprint.tasks || []).map(task => (
                  <div key={task.id} className="flex items-start gap-2 group">
                    <button 
                      onClick={() => toggleTask(sprint, task.id, task.is_completed)}
                      className="mt-0.5 text-gray-400 hover:text-blue-500"
                    >
                      {task.is_completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <span className={`text-sm ${task.is_completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                      {task.description}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t mt-auto">
                <select
                  className="w-full text-sm border-gray-300 rounded-md"
                  value={sprint.status}
                  onChange={(e) => updateSprintStatus(sprint.id, { status: e.target.value as SprintStatus })}
                >
                  <option value={SprintStatus.PLANNED}>Planned</option>
                  <option value={SprintStatus.IN_PROGRESS}>In Progress</option>
                  <option value={SprintStatus.COMPLETED}>Completed</option>
                </select>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Sprint"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <Input
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Sprint 1"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={e => setFormData({...formData, start_date: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={e => setFormData({...formData, end_date: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Observation</label>
            <textarea
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              value={formData.observation}
              onChange={e => setFormData({...formData, observation: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tasks</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTaskDescription}
                onChange={e => setNewTaskDescription(e.target.value)}
                placeholder="Add a task..."
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTask())}
              />
              <Button type="button" onClick={handleAddTask} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {formData.tasks?.map((task, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span className="text-sm">{task.description}</span>
                  <button type="button" onClick={() => handleRemoveTask(index)} className="text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Sprint
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
