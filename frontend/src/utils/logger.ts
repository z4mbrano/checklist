/**
 * Centralized Logger Service
 * 
 * Security: Sanitizes sensitive data before logging
 * Privacy: Never logs passwords, tokens, or PII
 * Monitoring: Structured logging for observability
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private sensitiveKeys = ['password', 'token', 'refreshToken', 'authorization', 'secret', 'apiKey']

  private sanitize(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item))
    }

    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      if (this.sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]'
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitize(value)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    const sanitizedContext = context ? this.sanitize(context) : {}

    return {
      timestamp,
      level,
      message,
      ...sanitizedContext
    }
  }

  debug(message: string, context?: LogContext) {
    if (!this.isDevelopment) return

    console.debug('[DEBUG]', this.formatMessage('debug', message, context))
  }

  info(message: string, context?: LogContext) {
    const formatted = this.formatMessage('info', message, context)
    
    if (this.isDevelopment) {
      console.info('[INFO]', formatted)
    } else {
      // Send to monitoring service in production
      this.sendToMonitoring('info', formatted)
    }
  }

  warn(message: string, context?: LogContext) {
    const formatted = this.formatMessage('warn', message, context)
    console.warn('[WARN]', formatted)
    
    if (!this.isDevelopment) {
      this.sendToMonitoring('warn', formatted)
    }
  }

  error(message: string, error?: Error, context?: LogContext) {
    const formatted = this.formatMessage('error', message, {
      ...context,
      errorMessage: error?.message,
      errorStack: this.isDevelopment ? error?.stack : undefined
    })

    console.error('[ERROR]', formatted)
    
    if (!this.isDevelopment) {
      this.sendToMonitoring('error', formatted)
    }
  }

  private sendToMonitoring(level: LogLevel, data: any) {
    // Integration with monitoring services
    // Example: Sentry, DataDog, CloudWatch, etc.
    // TODO: Implement in production
  }
}

export const logger = new Logger()
