import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useAuth } from '../modules/auth/AuthContext'
import { Workspace } from '../types'

interface WorkspaceContextType {
  currentWorkspace: Workspace | null
  workspaces: Workspace[]
  loading: boolean
  switchWorkspace: (workspaceId: number) => void
  createWorkspace: (name: string) => Promise<Workspace | null>
  loadWorkspaces: () => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

interface WorkspaceProviderProps {
  children: ReactNode
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const { token, user } = useAuth()
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const loadWorkspaces = useCallback(async () => {
    if (!token) return
    
    setLoading(true)
    try {
      console.log('Chargement des workspaces...')
      const resp = await fetch('/api/workspaces', {
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      })
      
      console.log('Réponse workspaces:', resp.status, resp.statusText)
      
      if (resp.ok) {
        const data = await resp.json()
        console.log('Données workspaces:', data)
        const wsList: Workspace[] = Array.isArray(data) ? data : (data.data || [])
        setWorkspaces(wsList)
        
        // Sélectionner le premier workspace par défaut
        if (wsList.length > 0) {
          // Restaurer le workspace depuis localStorage d'abord
          const savedId = localStorage.getItem('currentWorkspaceId')
          let selectedWorkspace: Workspace | null = null
          
          if (savedId) {
            selectedWorkspace = wsList.find(w => w.id === parseInt(savedId)) || null
          }
          
          // Si pas trouvé, prendre le premier
          if (!selectedWorkspace) {
            selectedWorkspace = wsList[0]
          }
          
          setCurrentWorkspace(selectedWorkspace)
          localStorage.setItem('currentWorkspaceId', selectedWorkspace.id.toString())
          console.log('Workspace sélectionné:', selectedWorkspace)
        }
      } else {
        console.error('Erreur API workspaces:', resp.status, await resp.text())
      }
    } catch (error) {
      console.error('Erreur chargement workspaces:', error)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    // Ne charger les workspaces que si on a un token ET un utilisateur validé
    if (token && user) {
      loadWorkspaces()
    } else if (!token) {
      // Si pas de token, nettoyer les workspaces
      setWorkspaces([])
      setCurrentWorkspace(null)
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user])

  const switchWorkspace = (workspaceId: number) => {
    const ws = workspaces.find(w => w.id === workspaceId)
    if (ws) {
      setCurrentWorkspace(ws)
      localStorage.setItem('currentWorkspaceId', workspaceId.toString())
    }
  }

  const createWorkspace = async (name: string): Promise<Workspace | null> => {
    if (!token) return null
    
    try {
      const resp = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        },
        body: JSON.stringify({ name })
      })
      
      if (resp.ok) {
        const newWorkspace: Workspace = await resp.json()
        await loadWorkspaces()
        return newWorkspace
      }
    } catch (error) {
      console.error('Erreur création workspace:', error)
    }
    return null
  }

  return (
    <WorkspaceContext.Provider value={{
      currentWorkspace,
      workspaces,
      loading,
      switchWorkspace,
      createWorkspace,
      loadWorkspaces
    }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider')
  }
  return context
}
