import { useState } from 'react'
// import { initializeApp } from 'firebase/app'
// import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
// import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore'
import { 
  MapPin, Play, StopCircle, CheckCircle, 
  Clock, User, Briefcase, 
  ChevronRight, Plus, Edit, ArrowLeft, 
  History, Folder, FileText, AlertCircle, LogOut
} from 'lucide-react'

// --- FIREBASE CONFIG (PLACEHOLDER) ---
/*
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
*/

// @ts-ignore - Configuração para futura integração com Firebase
const USE_FIREBASE = false // Toggle: true para Firebase, false para Mock Data

// --- TYPES ---
interface User {
  email: string
  name: string
  isAdmin: boolean
}

interface Project {
  id: string
  name: string
  client: string
  responsible: string
  responsibleEmail: string
  startDate: string
  endDate?: string
  observations?: string
  status: 'Em Andamento' | 'Concluído' | 'Pausado'
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
  userEmail: string
}

type Screen = 'login' | 'dashboard' | 'selectProject' | 'addProject' | 'editProject' | 'workflow' | 'history' | 'projectDetail' | 'success'

// --- MOCK USERS ---
const MOCK_USERS: User[] = [
  { email: 'admin@vrdsolution.com', name: 'Administrador', isAdmin: true },
  { email: 'arthur@vrdsolution.com.br', name: 'Arthur Zambrano', isAdmin: false },
  { email: 'carlos@vrdsolution.com', name: 'Carlos Silva', isAdmin: false },
  { email: 'ana@vrdsolution.com', name: 'Ana Souza', isAdmin: false },
  { email: 'roberto@vrdsolution.com', name: 'Roberto Dias', isAdmin: false },
]

const MOCK_PASSWORDS: Record<string, string> = {
  'admin@vrdsolution.com': 'admin123',
  'arthur@vrdsolution.com.br': 'zambranolindo',
  'carlos@vrdsolution.com': 'carlos123',
  'ana@vrdsolution.com': 'ana123',
  'roberto@vrdsolution.com': 'roberto123',
}

// --- MOCK DATA ---
const INITIAL_PROJECTS: Project[] = [
  { 
    id: '1', 
    name: 'Instalação CCTV', 
    client: 'Shopping Metrô', 
    responsible: 'Carlos Silva', 
    responsibleEmail: 'carlos@vrdsolution.com',
    startDate: '2023-10-01', 
    status: 'Em Andamento' 
  },
  { 
    id: '2', 
    name: 'Manutenção Rede', 
    client: 'Escola Futuro', 
    responsible: 'Ana Souza', 
    responsibleEmail: 'ana@vrdsolution.com',
    startDate: '2023-11-15', 
    status: 'Em Andamento' 
  },
  { 
    id: '3', 
    name: 'Consultoria TI', 
    client: 'Advocacia Lima', 
    responsible: 'Roberto Dias', 
    responsibleEmail: 'roberto@vrdsolution.com',
    startDate: '2023-09-20', 
    status: 'Concluído' 
  },
  { 
    id: '4', 
    name: 'Implementação Firewall', 
    client: 'Empresa Tech Solutions', 
    responsible: 'Arthur Zambrano', 
    responsibleEmail: 'arthur@vrdsolution.com.br',
    startDate: '2023-11-21', 
    status: 'Em Andamento' 
  },
]

const INITIAL_CHECKINS: Checkin[] = [
  { 
    id: '101', 
    projectId: '3', 
    projectName: 'Consultoria TI', 
    arrivalTime: '2023-11-20T09:00:00', 
    startTime: '2023-11-20T09:15:00', 
    endTime: '2023-11-20T11:30:00', 
    totalHours: '02:15', 
    activities: ['Reunião'], 
    observations: 'Reunião inicial com cliente', 
    date: '2023-11-20',
    userEmail: 'roberto@vrdsolution.com'
  }
]

const ACTIVITY_TAGS = ['Instalação', 'Manutenção', 'Reunião', 'Treinamento', 'Configuração', 'Suporte']

// --- PRINT STYLES ---
const PrintStyles = () => (
  <style>{`
    @media print {
      html, body {
        margin: 0;
        padding: 0;
        background: white !important;
        height: auto !important;
        overflow: visible !important;
      }
      
      .no-print {
        display: none !important;
      }
      
      .printable-area {
        display: block !important;
        overflow: visible !important;
        height: auto !important;
        max-height: none !important;
        flex: none !important;
      }
      
      .print-container {
        display: block !important;
        height: auto !important;
        overflow: visible !important;
        max-height: none !important;
      }
      
      /* Evita quebra de página dentro dos cards */
      .print\\:break-inside-avoid {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      
      button, input, select, textarea {
        display: none !important;
      }
      
      .rounded-2xl, .rounded-xl {
        border: 1px solid #e2e8f0 !important;
      }
      
      @page {
        size: A4;
        margin: 1cm;
      }
    }
  `}</style>
)

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

const Select = ({ label, ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>}
    <select 
      className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
      {...props}
    />
  </div>
)

// Modal Component
const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

// --- SUB-COMPONENTS (MOVED OUTSIDE) ---

const LoginScreen = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Preencha todos os campos')
      return
    }

    // Validação com dados mockados
    const userExists = MOCK_USERS.find(u => u.email === email)
    
    if (!userExists) {
      setError('Usuário não encontrado')
      return
    }

    const correctPassword = MOCK_PASSWORDS[email]
    
    if (password !== correctPassword) {
      setError('Senha incorreta')
      return
    }

    // Login bem-sucedido
    onLogin(userExists)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <Card className="w-full max-w-md p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-blue-900 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-blue-900/20">
            <Briefcase className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">VRD Field Service</h1>
          <p className="text-slate-500">Portal do Técnico</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            type="email"
            placeholder="E-mail corporativo" 
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            required
          />
          <Input 
            type="password" 
            placeholder="Senha" 
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle size={18} className="text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <Button type="submit">Entrar</Button>

          <div className="text-xs text-slate-400 text-center space-y-1">
            <p className="font-semibold text-slate-500">Usuários de Teste:</p>
            <p>Admin: admin@vrdsolution.com (admin123)</p>
            <p>Arthur: arthur@vrdsolution.com.br (zambranolindo)</p>
          </div>
        </form>
      </Card>
    </div>
  )
}

const DashboardScreen = ({ onNavigate, onLogout, user }: { onNavigate: (screen: Screen) => void, onLogout: () => void, user: User | null }) => (
  <div className="p-6 max-w-5xl mx-auto space-y-8">
    <header className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Olá, {user?.name || 'Técnico'}</h1>
        <p className="text-slate-500">Bem-vindo ao seu painel</p>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Sair"
        >
          <LogOut size={18} />
          Sair
        </button>
        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
          <User className="text-slate-600" size={20} />
        </div>
      </div>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card onClick={() => onNavigate('selectProject')} className="p-8 flex flex-col items-center text-center gap-4 hover:border-blue-500 group">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-900 transition-colors">
          <Play className="text-blue-900 group-hover:text-white w-8 h-8" fill="currentColor" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Novo Check-in</h2>
          <p className="text-slate-500">Iniciar atendimento em cliente</p>
        </div>
      </Card>

      <Card onClick={() => onNavigate('history')} className="p-8 flex flex-col items-center text-center gap-4 hover:border-emerald-500 group">
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

const SelectProjectScreen = ({ 
  projects, 
  onNavigate, 
  startWorkflow,
  user
}: { 
  projects: Project[]
  onNavigate: (screen: Screen) => void
  startWorkflow: (project: Project) => void
  user: User | null
}) => {
  // Filtrar projetos com base nas permissões
  const filteredProjects = user?.isAdmin 
    ? projects 
    : projects.filter(p => p.responsibleEmail === user?.email)

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen flex flex-col">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-slate-200 rounded-full no-print">
          <ArrowLeft />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Selecionar Projeto</h1>
          {user && !user.isAdmin && (
            <p className="text-xs text-slate-500">Seus projetos atribuídos</p>
          )}
        </div>
      </header>

      <div className="flex-1 space-y-4">
        {user?.isAdmin && (
          <Button 
            variant="outline" 
            onClick={() => onNavigate('addProject')} 
            icon={Plus} 
            className="border-dashed border-2 no-print"
          >
            Adicionar Novo Projeto
          </Button>
        )}
        
        <div className="space-y-3 mt-6">
          {filteredProjects.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Folder size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhum projeto disponível</p>
            </div>
          )}
          
          {filteredProjects.map(p => (
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
}

const ProjectFormScreen = ({ 
  onNavigate, 
  onSave,
  initialData = null,
  mode = 'add'
}: { 
  onNavigate: (screen: Screen) => void
  onSave: (data: Partial<Project>) => void
  initialData?: Project | null
  mode?: 'add' | 'edit'
}) => {
  const [formData, setFormData] = useState<Partial<Project>>(
    initialData || {
      name: '',
      client: '',
      responsible: '',
      responsibleEmail: '',
      startDate: '',
      endDate: '',
      observations: '',
      status: 'Em Andamento'
    }
  )
  const [errors, setErrors] = useState<{name?: string; client?: string; responsibleEmail?: string}>({})

  const validateForm = () => {
    const newErrors: typeof errors = {}
    
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Nome do projeto é obrigatório'
    }
    
    if (!formData.client || formData.client.trim() === '') {
      newErrors.client = 'Cliente é obrigatório'
    }

    if (!formData.responsibleEmail || !formData.responsibleEmail.includes('@')) {
      newErrors.responsibleEmail = 'E-mail válido é obrigatório'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    onSave(formData)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => onNavigate(mode === 'edit' ? 'projectDetail' : 'selectProject')} className="p-2 hover:bg-slate-200 rounded-full">
          <ArrowLeft />
        </button>
        <h1 className="text-xl font-bold text-slate-800">{mode === 'edit' ? 'Editar Projeto' : 'Novo Projeto'}</h1>
      </header>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input 
              label="Nome do Projeto *" 
              placeholder="Ex: Instalação Fibra" 
              value={formData.name || ''} 
              onChange={(e: any) => setFormData({...formData, name: e.target.value})}
              required
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <Input 
              label="Cliente *" 
              placeholder="Nome do Cliente" 
              value={formData.client || ''} 
              onChange={(e: any) => setFormData({...formData, client: e.target.value})}
              required
            />
            {errors.client && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.client}
              </p>
            )}
          </div>

          <Input 
            label="Responsável" 
            placeholder="Nome do Técnico" 
            value={formData.responsible || ''} 
            onChange={(e: any) => setFormData({...formData, responsible: e.target.value})}
          />

          <div>
            <Input 
              label="E-mail do Responsável *" 
              type="email"
              placeholder="tecnico@vrdsolution.com" 
              value={formData.responsibleEmail || ''} 
              onChange={(e: any) => setFormData({...formData, responsibleEmail: e.target.value})}
              required
            />
            {errors.responsibleEmail && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.responsibleEmail}
              </p>
            )}
          </div>
          
          <Select
            label="Status"
            value={formData.status || 'Em Andamento'}
            onChange={(e: any) => setFormData({...formData, status: e.target.value})}
          >
            <option value="Em Andamento">Em Andamento</option>
            <option value="Concluído">Concluído</option>
            <option value="Pausado">Pausado</option>
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              type="date" 
              label="Data Início" 
              value={formData.startDate || ''} 
              onChange={(e: any) => setFormData({...formData, startDate: e.target.value})}
            />
            <Input 
              type="date" 
              label="Data Fim" 
              value={formData.endDate || ''} 
              onChange={(e: any) => setFormData({...formData, endDate: e.target.value})}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Observações</label>
            <textarea
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
              rows={3}
              value={formData.observations || ''}
              onChange={(e) => setFormData({...formData, observations: e.target.value})}
              placeholder="Detalhes adicionais..."
            />
          </div>

          <div className="pt-4">
            <Button type="submit" variant="success">
              {mode === 'edit' ? 'Salvar Alterações' : 'Salvar e Iniciar'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

const WorkflowScreen = ({ 
  selectedProject,
  onNavigate,
  handleWorkflowAction,
  finishCheckin,
  workflowStep,
  timestamps,
  checkoutData,
  setCheckoutData
}: any) => {
  if (!selectedProject) return null
  
  const formatTime = (iso?: string) => iso ? new Date(iso).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen flex flex-col">
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => onNavigate('selectProject')} className="p-2 hover:bg-slate-200 rounded-full"><ArrowLeft /></button>
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
                          ? checkoutData.activities.filter((t: string) => t !== tag)
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

const SuccessScreen = ({ onNavigate }: { onNavigate: (screen: Screen) => void }) => (
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

const HistoryScreen = ({ 
  projects, 
  checkins, 
  onNavigate, 
  setSelectedProject,
  user
}: { 
  projects: Project[]
  checkins: Checkin[]
  onNavigate: (screen: Screen) => void
  setSelectedProject: (p: Project) => void
  user: User | null
}) => {
  // Filter projects based on user role
  const filteredProjects = user?.isAdmin 
    ? projects 
    : projects.filter(p => p.responsibleEmail === user?.email)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-slate-200 rounded-full"><ArrowLeft /></button>
        <h1 className="text-xl font-bold text-slate-800">Histórico & Projetos</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(p => (
          <Card key={p.id} onClick={() => { setSelectedProject(p); onNavigate('projectDetail') }} className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-900">
                <Folder size={20} />
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                p.status === 'Em Andamento' ? 'bg-emerald-100 text-emerald-700' : 
                p.status === 'Pausado' ? 'bg-orange-100 text-orange-700' :
                'bg-slate-100 text-slate-600'
              }`}>
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
}

const ProjectDetailScreen = ({ 
  selectedProject, 
  checkins, 
  onNavigate,
  setEditingCheckin,
  user
}: { 
  selectedProject: Project | null
  checkins: Checkin[]
  onNavigate: (screen: Screen) => void
  setEditingCheckin: (c: Checkin) => void
  user: User | null
}) => {
  if (!selectedProject) return null
  const projectCheckins = checkins.filter(c => c.projectId === selectedProject.id)
  
  // Check if user can edit this project
  const canEdit = user?.isAdmin || user?.email === selectedProject.responsibleEmail

  const handleExportPDF = () => {
    window.print()
  }

  return (
    <div className="p-6 max-w-3xl mx-auto print:h-auto print:block print-container">
      <PrintStyles />
      
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('history')} className="p-2 hover:bg-slate-200 rounded-full no-print"><ArrowLeft /></button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{selectedProject.name}</h1>
            <p className="text-sm text-slate-500">Histórico de Apontamentos</p>
          </div>
        </div>
        <div className="flex gap-2 no-print">
          <button 
            onClick={handleExportPDF} 
            className="p-2 hover:bg-blue-50 rounded-full"
            title="Exportar PDF"
          >
            <FileText className="text-blue-900" size={20} />
          </button>
          {canEdit && (
            <button 
              onClick={() => onNavigate('editProject')} 
              className="p-2 hover:bg-slate-200 rounded-full"
              title="Editar Projeto"
            >
              <Edit className="text-blue-900" size={20} />
            </button>
          )}
        </div>
      </header>

      <div className="printable-area space-y-4 print:flex-none print:overflow-visible print:h-auto">
        {projectCheckins.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <History size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhum apontamento encontrado.</p>
          </div>
        )}
        
        {projectCheckins.map(c => (
          <Card key={c.id} className="p-5 print:break-inside-avoid">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-slate-800">{new Date(c.date).toLocaleDateString()}</p>
                <p className="text-sm text-slate-500">
                  {c.startTime && new Date(c.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {c.endTime && new Date(c.endTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                </p>
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

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end no-print">
              <button 
                onClick={() => setEditingCheckin(c)}
                className="text-sm font-bold text-blue-900 flex items-center gap-1 hover:underline"
              >
                <Edit size={14} /> Editar
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

const EditCheckinModal = ({ 
  checkin, 
  onClose, 
  onSave 
}: { 
  checkin: Checkin | null
  onClose: () => void
  onSave: (data: Partial<Checkin>) => void
}) => {
  if (!checkin) return null

  const [formData, setFormData] = useState<Partial<Checkin>>({
    arrivalTime: checkin.arrivalTime,
    startTime: checkin.startTime,
    endTime: checkin.endTime,
    activities: checkin.activities || [],
    otherActivities: checkin.otherActivities || '',
    observations: checkin.observations || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const formatDateTimeLocal = (iso?: string) => {
    if (!iso) return ''
    return new Date(iso).toISOString().slice(0, 16)
  }

  return (
    <Modal isOpen={!!checkin} onClose={onClose}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Editar Check-in</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="datetime-local"
            label="Horário de Chegada"
            value={formatDateTimeLocal(formData.arrivalTime)}
            onChange={(e: any) => setFormData({...formData, arrivalTime: new Date(e.target.value).toISOString()})}
          />

          <Input
            type="datetime-local"
            label="Horário de Início"
            value={formatDateTimeLocal(formData.startTime)}
            onChange={(e: any) => setFormData({...formData, startTime: new Date(e.target.value).toISOString()})}
          />

          <Input
            type="datetime-local"
            label="Horário de Término"
            value={formatDateTimeLocal(formData.endTime)}
            onChange={(e: any) => setFormData({...formData, endTime: new Date(e.target.value).toISOString()})}
          />

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Atividades</label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const newTags = formData.activities?.includes(tag) 
                      ? formData.activities.filter(t => t !== tag)
                      : [...(formData.activities || []), tag]
                    setFormData({...formData, activities: newTags})
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                    formData.activities?.includes(tag)
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
            value={formData.otherActivities || ''}
            onChange={(e: any) => setFormData({...formData, otherActivities: e.target.value})}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Observações</label>
            <textarea
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
              rows={4}
              value={formData.observations || ''}
              onChange={(e) => setFormData({...formData, observations: e.target.value})}
            />
          </div>

          <Button type="submit" variant="success">
            Salvar Alterações
          </Button>
        </form>
      </div>
    </Modal>
  )
}

// --- MAIN APP ---
export default function MobileWorkflowApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login')
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS)
  const [checkins, setCheckins] = useState<Checkin[]>(INITIAL_CHECKINS)
  
  // Workflow State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [workflowStep, setWorkflowStep] = useState<'idle' | 'arrived' | 'working' | 'checkout'>('idle')
  const [timestamps, setTimestamps] = useState<{arrival?: string, start?: string, end?: string}>({})
  
  // Form States
  const [checkoutData, setCheckoutData] = useState({ activities: [] as string[], other: '', obs: '' })
  const [editingCheckin, setEditingCheckin] = useState<Checkin | null>(null)

  // --- ACTIONS ---
  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser)
    setCurrentScreen('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentScreen('login')
  }
  
  const startWorkflow = (project: Project) => {
    setSelectedProject(project)
    setWorkflowStep('idle')
    setTimestamps({})
    setCheckoutData({ activities: [], other: '', obs: '' })
    setCurrentScreen('workflow')
  }

  const handleAddProject = (projectData: Partial<Project>) => {
    const project: Project = {
      id: Date.now().toString(),
      name: projectData.name!,
      client: projectData.client!,
      responsible: projectData.responsible || 'Técnico',
      responsibleEmail: projectData.responsibleEmail || user?.email || '',
      startDate: projectData.startDate || new Date().toISOString().split('T')[0],
      status: projectData.status || 'Em Andamento',
      endDate: projectData.endDate,
      observations: projectData.observations
    }
    setProjects([...projects, project])
    startWorkflow(project) // Auto-select
  }

  const handleUpdateProject = (projectData: Partial<Project>) => {
    if (!selectedProject) return
    
    const updatedProjects = projects.map(p => 
      p.id === selectedProject.id 
        ? { ...p, ...projectData } 
        : p
    )
    setProjects(updatedProjects)
    setSelectedProject({ ...selectedProject, ...projectData } as Project)
    setCurrentScreen('projectDetail')
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
      userEmail: user?.email || '',
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

  const handleUpdateCheckin = (checkinData: Partial<Checkin>) => {
    if (!editingCheckin) return

    // Recalculate total hours if times changed
    let totalHours = editingCheckin.totalHours
    if (checkinData.startTime && checkinData.endTime) {
      const start = new Date(checkinData.startTime)
      const end = new Date(checkinData.endTime)
      const diff = (end.getTime() - start.getTime()) / 1000 / 60
      const hours = Math.floor(diff / 60)
      const mins = Math.floor(diff % 60)
      totalHours = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    }

    const updatedCheckins = checkins.map(c =>
      c.id === editingCheckin.id
        ? { ...c, ...checkinData, totalHours }
        : c
    )
    
    setCheckins(updatedCheckins)
    setEditingCheckin(null)
  }

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {currentScreen === 'login' && <LoginScreen onLogin={handleLogin} />}
      
      {currentScreen === 'dashboard' && <DashboardScreen onNavigate={setCurrentScreen} onLogout={handleLogout} user={user} />}
      
      {currentScreen === 'selectProject' && (
        <SelectProjectScreen 
          projects={projects} 
          onNavigate={setCurrentScreen}
          startWorkflow={startWorkflow}
          user={user}
        />
      )}
      
      {currentScreen === 'addProject' && (
        <ProjectFormScreen 
          onNavigate={setCurrentScreen}
          onSave={handleAddProject}
          mode="add"
        />
      )}

      {currentScreen === 'editProject' && (
        <ProjectFormScreen 
          onNavigate={setCurrentScreen}
          onSave={handleUpdateProject}
          initialData={selectedProject}
          mode="edit"
        />
      )}
      
      {currentScreen === 'workflow' && (
        <WorkflowScreen
          selectedProject={selectedProject}
          onNavigate={setCurrentScreen}
          handleWorkflowAction={handleWorkflowAction}
          finishCheckin={finishCheckin}
          workflowStep={workflowStep}
          timestamps={timestamps}
          checkoutData={checkoutData}
          setCheckoutData={setCheckoutData}
        />
      )}
      
      {currentScreen === 'history' && (
        <HistoryScreen 
          projects={projects}
          checkins={checkins}
          onNavigate={setCurrentScreen}
          setSelectedProject={setSelectedProject}
          user={user}
        />
      )}
      
      {currentScreen === 'projectDetail' && (
        <ProjectDetailScreen 
          selectedProject={selectedProject}
          checkins={checkins}
          onNavigate={setCurrentScreen}
          setEditingCheckin={setEditingCheckin}
          user={user}
        />
      )}
      
      {currentScreen === 'success' && <SuccessScreen onNavigate={setCurrentScreen} />}

      {/* Edit Checkin Modal */}
      <EditCheckinModal 
        checkin={editingCheckin}
        onClose={() => setEditingCheckin(null)}
        onSave={handleUpdateCheckin}
      />
    </div>
  )
}
