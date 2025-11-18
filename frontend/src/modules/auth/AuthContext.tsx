import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '../../types'

interface AuthContextType {
  token: string | null
  user: User | null
  login: (email: string, password: string, remember?: boolean) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  resendVerificationEmail: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token') || sessionStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    document.documentElement.className = 'theme-light'
  }, [])

  useEffect(() => {
    if (token) {
      fetch('/api/me', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
        .then(r => {
          if (r.ok) return r.json()
          // Si le token est invalide, le supprimer
          localStorage.removeItem('token')
          sessionStorage.removeItem('token')
          setToken(null)
          return null
        })
        .then(u => setUser(u))
        .catch(() => {
          // En cas d'erreur réseau, nettoyer le token aussi
          localStorage.removeItem('token')
          sessionStorage.removeItem('token')
          setToken(null)
          setUser(null)
        })
    } else {
      setUser(null)
    }
  }, [token])

  const login = async (email: string, password: string, remember = true): Promise<void> => {
    const r = await fetch('/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!r.ok) {
      const error = await r.json().catch(() => ({ message: 'Login failed' }))
      throw new Error(error.message || 'Login failed')
    }
    const data = await r.json()
    try {
      if (remember) {
        localStorage.setItem('token', data.token)
        sessionStorage.removeItem('token')
      } else {
        sessionStorage.setItem('token', data.token)
        localStorage.removeItem('token')
      }
    } catch (_) {}
    setToken(data.token)
    setUser(data.user)
  }

  const register = async (name: string, email: string, password: string): Promise<void> => {
    const r = await fetch('/api/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    if (!r.ok) {
      const error = await r.json().catch(() => ({ message: 'Register failed' }))
      throw new Error(error.message || 'Register failed')
    }
    const data = await r.json()
    try {
      localStorage.setItem('token', data.token)
    } catch (_) {}
    setToken(data.token)
    setUser(data.user)
  }

  const logout = async (): Promise<void> => {
    if (token) {
      await fetch('/api/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
    }
    setToken(null)
    setUser(null)
    try {
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
    } catch (_) {}
  }

  const refreshUser = async (): Promise<void> => {
    if (token) {
      try {
        const r = await fetch('/api/me', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
        if (r.ok) {
          const userData = await r.json()
          setUser(userData)
        }
      } catch (error) {
        // Erreur silencieuse
      }
    }
  }

  const resendVerificationEmail = async (): Promise<void> => {
    if (!token) throw new Error('Non authentifié')
    const r = await fetch('/api/email/verification-notification', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    })
    if (!r.ok) {
      const error = await r.json().catch(() => ({ message: 'Erreur lors de l\'envoi de l\'email' }))
      throw new Error(error.message || 'Erreur lors de l\'envoi de l\'email')
    }
  }

  return (
    <AuthContext.Provider value={{
      token,
      user,
      login,
      register,
      logout,
      refreshUser,
      resendVerificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}


