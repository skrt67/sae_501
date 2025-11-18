import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../modules/auth/AuthContext'

export function useEpics(projectId?: number | null) {
  const { token } = useAuth()
  const [epics, setEpics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    const fetchEpics = async () => {
      setLoading(true)
      try {
        const url = projectId 
          ? `/api/epics?project_id=${projectId}`
          : '/api/epics'
        
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Erreur de chargement des epics')
        }

        const data = await response.json()
        const epicsList = Array.isArray(data) ? data : data.data || []
        setEpics(epicsList)
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEpics()
  }, [token, projectId, refreshTrigger])

  const refetch = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  return { epics, loading, error, refetch }
}
