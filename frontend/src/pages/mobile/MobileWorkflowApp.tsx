import { useState } from 'react'
import { 
  LogIn, MapPin, Play, StopCircle, CheckCircle, 
  Clock, User, Briefcase, 
  ChevronRight, Plus, Edit, ArrowLeft, 
  History, Folder
} from 'lucide-react'

// --- TYPES ---
interface Project {
  id: string
  name: string
  client: string
  responsible: string
  startDate: string
  endDate?: string
  observations?: string
  status: 'Em Andamento' | 'Concluído'
}

interface Checkin {
  id: string
  projectId: string
  projectName: string
  arrivalTime?: string
  startTime?: string
  endTime?: string
  totalHours?: string
  activities: string[]
  otherActivities?: string
  observations?: string
  date: string
}

type Screen = 'login' | 'dashboard' | 'selectProject' | 'addProject' | 'workflow' | 'history' | 'projectDetail' | 'success'

// --- MOCK DATA ---
const INITIAL_PROJECTS: Project[] = [
  { id: '1', name: 'Instalação CCTV', client: 'Shopping Metrô', responsible: 'Carlos Silva', startDate: '2023-10-01', status: 'Em Andamento' },
  { id: '2', name: 'Manutenção Rede', client: 'Escola Futuro', responsible: 'Ana Souza', startDate: '2023-11-15', status: 'Em Andamento' },
  { id: '3', name: 'Consultoria TI', client: 'Advocacia Lima', responsible: 'Roberto Dias', startDate: '2023-09-20', status: 'Concluído' },
]

const INITIAL_CHECKINS: Checkin[] = [
  { 
    id: '101', projectId: '3', projectName: 'Consultoria TI', 
    arrivalTime: '2023-11-20T09:00:00', startTime: '2023-11-20T09:15:00', endTime: '2023-11-20T11:30:00', 
    totalHours: '02:15', activities: ['Reunião'], date: '2023-11-20' 
  }
]

const ACTIVITY_TAGS = ['Instalação', 'Manutenção', 'Reunião', 'Treinamento', 'Configuração', 'Suporte']

// --- COMPONENTS ---
const Card = ({ children, className = '', onClick }: any) => (
  <div onClick={onClick} className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}>
    {children}
  </div>
)

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, icon: Icon }: any) => {
  const baseStyle = "w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
  const variants: any = {
    primary: "bg-blue-900 text-white hover:bg-blue-800",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-50"
  }
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={24} />}
      {children}
    </button>
  )
}

const Input = ({ label, ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>}
    <input 
      className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
      {...props}
    />
  </div>
)

// --- MAIN APP ---
export default function MobileWorkflowApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login')
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS)
  const [checkins, setCheckins] = useState<Checkin[]>(INITIAL_CHECKINS)
  
  // Workflow State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [workflowStep, setWorkflowStep] = useState<'idle' | 'arrived' | 'working' | 'checkout'>('idle')
  const [timestamps, setTimestamps] = useState<{arrival?: string, start?: string, end?: string}>({})
  
  // Form States
  const [newProject, setNewProject] = useState<Partial<Project>>({})
  const [checkoutData, setCheckoutData] = useState({ activities: [] as string[], other: '', obs: '' })

  // --- ACTIONS ---
  const handleLogin = () => setCurrentScreen('dashboard')
  
  const startWorkflow = (project: Project) => {
    setSelectedProject(project)
    setWorkflowStep('idle')
    setTimestamps({})
    setCheckoutData({ activities: [], other: '', obs: '' })
    setCurrentScreen('workflow')
  }

  const handleAddProject = () => {
    if (!newProject.name || !newProject.client) return
    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      client: newProject.client,
      responsible: newProject.responsible || 'Técnico',
      startDate: newProject.startDate || new Date().toISOString().split('T')[0],
      status: 'Em Andamento',
      ...newProject
    } as Project
    setProjects([...projects, project])
    setNewProject({})
    startWorkflow(project) // Auto-select
  }

  const handleWorkflowAction = (action: 'arrival' | 'start' | 'end') => {
    const now = new Date().toISOString()
    if (action === 'arrival') {
      setTimestamps({ ...timestamps, arrival: now })
      setWorkflowStep('arrived')
    } else if (action === 'start') {
      setTimestamps({ ...timestamps, start: now })
      setWorkflowStep('working')
    } else if (action === 'end') {
      setTimestamps({ ...timestamps, end: now })
      setWorkflowStep('checkout')
    }
  }

  const finishCheckin = () => {
    if (!selectedProject || !timestamps.start || !timestamps.end) return
    
    const start = new Date(timestamps.start)
    const end = new Date(timestamps.end)
    const diff = (end.getTime() - start.getTime()) / 1000 / 60 // minutes
    const hours = Math.floor(diff / 60)
    const mins = Math.floor(diff % 60)
    const totalHours = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`

    const newCheckin: Checkin = {
      id: Date.now().toString(),
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      arrivalTime: timestamps.arrival,
      startTime: timestamps.start,
      endTime: timestamps.end,
      totalHours,
      activities: checkoutData.activities,
      otherActivities: checkoutData.other,
      observations: checkoutData.obs,
      date: new Date().toISOString().split('T')[0]
    }

    setCheckins([newCheckin, ...checkins])
    setCurrentScreen('success')
  }

  // --- SCREENS ---

  const LoginScreen = () => (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <Card className="w-full max-w-md p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-blue-900 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-blue-900/20">
            <Briefcase className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">VRD Field Service</h1>
          <p className="text-slate-500">Portal do Técnico</p>
        </div>
        <div className="space-y-4">
          <Input placeholder="E-mail corporativo" icon={User} />
          <Input type="password" placeholder="Senha" icon={LogIn} />
          <Button onClick={handleLogin}>Entrar</Button>
        </div>
      </Card>
    </div>
  )

  const DashboardScreen = () => (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Olá, Técnico</h1>
          <p className="text-slate-500">Bem-vindo ao seu painel</p>
        </div>
        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
          <User className="text-slate-600" size={20} />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card onClick={() => setCurrentScreen('selectProject')} className="p-8 flex flex-col items-center text-center gap-4 hover:border-blue-500 group">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-900 transition-colors">
            <Play className="text-blue-900 group-hover:text-white w-8 h-8" fill="currentColor" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Novo Check-in</h2>
            <p className="text-slate-500">Iniciar atendimento em cliente</p>
          </div>
        </Card>

        <Card onClick={() => setCurrentScreen('history')} className="p-8 flex flex-col items-center text-center gap-4 hover:border-emerald-500 group">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
            <History className="text-emerald-600 group-hover:text-white w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Histórico & Projetos</h2>
            <p className="text-slate-500">Consultar atendimentos realizados</p>
          </div>
        </Card>
      </div>
    </div>
  )

  const SelectProjectScreen = () => (
    <div className="p-6 max-w-2xl mx-auto min-h-screen flex flex-col">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => setCurrentScreen('dashboard')} className="p-2 hover:bg-slate-200 rounded-full"><ArrowLeft /></button>
        <h1 className="text-xl font-bold text-slate-800">Selecionar Projeto</h1>
      </header>

      <div className="flex-1 space-y-4">
        <Button variant="outline" onClick={() => setCurrentScreen('addProject')} icon={Plus} className="border-dashed border-2">
          Adicionar Novo Projeto
        </Button>
        
        <div className="space-y-3 mt-6">
          {projects.map(p => (
            <Card key={p.id} onClick={() => startWorkflow(p)} className="p-5 flex items-center justify-between group">
              <div>
                <h3 className="font-bold text-slate-800">{p.name}</h3>
                <p className="text-sm text-slate-500">{p.client}</p>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-blue-900" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  )

  const AddProjectScreen = () => (
    <div className="p-6 max-w-2xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => setCurrentScreen('selectProject')} className="p-2 hover:bg-slate-200 rounded-full"><ArrowLeft /></button>
        <h1 className="text-xl font-bold text-slate-800">Novo Projeto</h1>
      </header>

      <Card className="p-6 space-y-4">
        <Input label="Nome do Projeto" placeholder="Ex: Instalação Fibra" value={newProject.name || ''} onChange={(e: any) => setNewProject({...newProject, name: e.target.value})} />
        <Input label="Cliente" placeholder="Nome do Cliente" value={newProject.client || ''} onChange={(e: any) => setNewProject({...newProject, client: e.target.value})} />
        <Input label="Responsável" placeholder="Nome do Técnico" value={newProject.responsible || ''} onChange={(e: any) => setNewProject({...newProject, responsible: e.target.value})} />
        <div className="grid grid-cols-2 gap-4">
          <Input type="date" label="Data Início" value={newProject.startDate || ''} onChange={(e: any) => setNewProject({...newProject, startDate: e.target.value})} />
          <Input type="date" label="Data Fim" value={newProject.endDate || ''} onChange={(e: any) => setNewProject({...newProject, endDate: e.target.value})} />
        </div>
        <div className="pt-4">
          <Button onClick={handleAddProject} variant="success">Salvar e Iniciar</Button>
        </div>
      </Card>
    </div>
  )

  const WorkflowScreen = () => {
    if (!selectedProject) return null
    
    const formatTime = (iso?: string) => iso ? new Date(iso).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'

    return (
      <div className="p-6 max-w-2xl mx-auto min-h-screen flex flex-col">
        <header className="flex items-center gap-4 mb-6">
          <button onClick={() => setCurrentScreen('selectProject')} className="p-2 hover:bg-slate-200 rounded-full"><ArrowLeft /></button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{selectedProject.name}</h1>
            <p className="text-sm text-slate-500">{selectedProject.client}</p>
          </div>
        </header>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className={`p-4 rounded-xl border ${timestamps.arrival ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Chegada</p>
            <p className="text-2xl font-mono font-bold text-slate-800">{formatTime(timestamps.arrival)}</p>
          </div>
          <div className={`p-4 rounded-xl border ${timestamps.start ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Início</p>
            <p className="text-2xl font-mono font-bold text-slate-800">{formatTime(timestamps.start)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-1 flex flex-col justify-center gap-4">
          {workflowStep === 'idle' && (
            <Button onClick={() => handleWorkflowAction('arrival')} icon={MapPin}>
              Chegada no Cliente
            </Button>
          )}
          
          {workflowStep === 'arrived' && (
            <Button onClick={() => handleWorkflowAction('start')} variant="success" icon={Play}>
              Iniciar Serviço
            </Button>
          )}

          {workflowStep === 'working' && (
            <div className="space-y-4 animate-pulse">
              <div className="text-center py-8">
                <p className="text-slate-500 mb-2">Serviço em andamento...</p>
                <Clock className="w-12 h-12 text-blue-900 mx-auto animate-spin-slow" />
              </div>
              <Button onClick={() => handleWorkflowAction('end')} variant="danger" icon={StopCircle}>
                Check-out / Finalizar
              </Button>
            </div>
          )}

          {workflowStep === 'checkout' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <Card className="p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-slate-800 mb-3">Atividades Realizadas</h3>
                  <div className="flex flex-wrap gap-2">
                    {ACTIVITY_TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          const newTags = checkoutData.activities.includes(tag) 
                            ? checkoutData.activities.filter(t => t !== tag)
                            : [...checkoutData.activities, tag]
                          setCheckoutData({...checkoutData, activities: newTags})
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                          checkoutData.activities.includes(tag)
                            ? 'bg-blue-900 text-white border-blue-900'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                
                <Input 
                  label="Outras Atividades" 
                  placeholder="Descreva se necessário..." 
                  value={checkoutData.other} 
                  onChange={(e: any) => setCheckoutData({...checkoutData, other: e.target.value})} 
                />
                
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Observações Gerais</label>
                  <textarea 
                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-900 outline-none"
                    rows={3}
                    value={checkoutData.obs}
                    onChange={(e) => setCheckoutData({...checkoutData, obs: e.target.value})}
                  />
                </div>
              </Card>
              <Button onClick={finishCheckin} variant="success" icon={CheckCircle}>
                Finalizar Apontamento
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const SuccessScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-emerald-600 text-white text-center">
      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
        <CheckCircle size={48} className="text-white" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Sucesso!</h1>
      <p className="text-emerald-100 mb-8 max-w-xs">Apontamento registrado e sincronizado com o servidor.</p>
      <Button variant="outline" className="bg-white text-emerald-700 border-transparent hover:bg-emerald-50" onClick={() => setCurrentScreen('dashboard')}>
        Voltar ao Início
      </Button>
    </div>
  )

  const HistoryScreen = () => (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => setCurrentScreen('dashboard')} className="p-2 hover:bg-slate-200 rounded-full"><ArrowLeft /></button>
        <h1 className="text-xl font-bold text-slate-800">Histórico & Projetos</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(p => (
          <Card key={p.id} onClick={() => { setSelectedProject(p); setCurrentScreen('projectDetail') }} className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-900">
                <Folder size={20} />
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'Em Andamento' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {p.status}
              </span>
            </div>
            <h3 className="font-bold text-slate-800 mb-1">{p.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{p.client}</p>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
              <span>{checkins.filter(c => c.projectId === p.id).length} check-ins</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const ProjectDetailScreen = () => {
    if (!selectedProject) return null
    const projectCheckins = checkins.filter(c => c.projectId === selectedProject.id)

    return (
      <div className="p-6 max-w-3xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => setCurrentScreen('history')} className="p-2 hover:bg-slate-200 rounded-full"><ArrowLeft /></button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{selectedProject.name}</h1>
            <p className="text-sm text-slate-500">Histórico de Apontamentos</p>
          </div>
        </header>

        <div className="space-y-4">
          {projectCheckins.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <History size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhum apontamento encontrado.</p>
            </div>
          )}
          
          {projectCheckins.map(c => (
            <Card key={c.id} className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-slate-800">{new Date(c.date).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-500">{new Date(c.startTime!).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {new Date(c.endTime!).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                </div>
                <div className="text-right">
                  <span className="block font-mono font-bold text-blue-900">{c.totalHours}h</span>
                  <span className="text-xs text-slate-400">Total</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {c.activities.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              
              {c.observations && (
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg italic">
                  "{c.observations}"
                </p>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button className="text-sm font-bold text-blue-900 flex items-center gap-1 hover:underline">
                  <Edit size={14} /> Editar
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {currentScreen === 'login' && <LoginScreen />}
      {currentScreen === 'dashboard' && <DashboardScreen />}
      {currentScreen === 'selectProject' && <SelectProjectScreen />}
      {currentScreen === 'addProject' && <AddProjectScreen />}
      {currentScreen === 'workflow' && <WorkflowScreen />}
      {currentScreen === 'history' && <HistoryScreen />}
      {currentScreen === 'projectDetail' && <ProjectDetailScreen />}
      {currentScreen === 'success' && <SuccessScreen />}
    </div>
  )
}
