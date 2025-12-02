/**
 * Error Boundary Component
 * 
 * Security: Prevents application crash and sensitive data exposure
 * UX: Graceful error handling with recovery options
 * OWASP: A04:2021 - Insecure Design (fail-safe defaults)
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service (Sentry, DataDog, etc.) in production
    this.logErrorToService(error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo })
      console.error('Error captured:', error, errorInfo)
    } else {
      // Development: detailed console output
      console.group('🔴 Error Boundary Caught')
      console.error('Error:', error)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle size={32} />
              <h1 className="text-2xl font-bold">Ops! Algo deu errado</h1>
            </div>
            
            <p className="text-slate-600 mb-6">
              Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para corrigi-lo.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 p-4 bg-red-50 rounded border border-red-200">
                <summary className="cursor-pointer text-sm font-medium text-red-700 mb-2">
                  Detalhes técnicos (apenas em desenvolvimento)
                </summary>
                <pre className="text-xs text-red-600 overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <RefreshCw size={16} />
                Tentar Novamente
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition"
              >
                Ir para Início
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
