export interface Client {
  id: number
  name: string
  nome?: string // Fallback for backend alias issues
  description?: string
  contact_email?: string
  contact_phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ClientCreateRequest {
  nome: string
  cnpj: string
  telefone?: string
  email?: string
  endereco?: string
  cidade: string
  estado: string
  cep?: string
  observacoes?: string
}