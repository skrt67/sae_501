import React, { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Store errorInfo for display
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-page)' }}>
          <div className="card max-w-2xl w-full" style={{ padding: '48px', textAlign: 'center' }}>
            {/* Icon */}
            <div style={{ 
              width: '80px', 
              height: '80px', 
              margin: '0 auto 24px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--error-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={40} style={{ color: 'var(--error)' }} />
            </div>
            
            {/* Title */}
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              color: 'var(--text)',
              marginBottom: '12px'
            }}>
              Oups, une erreur est survenue
            </h1>
            
            {/* Error message */}
            <p style={{ 
              fontSize: '16px', 
              color: 'var(--text-muted)',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              {this.state.error?.message || 'Une erreur inattendue s\'est produite'}
            </p>
            
            {/* Error details in dev mode */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ 
                marginBottom: '24px',
                textAlign: 'left',
                padding: '16px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                color: 'var(--text-muted)',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '8px' }}>
                  Détails techniques
                </summary>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            
            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
                style={{ minWidth: '140px' }}
              >
                🔄 Recharger
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="btn"
                style={{ minWidth: '140px' }}
              >
                🏠 Retour accueil
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}


