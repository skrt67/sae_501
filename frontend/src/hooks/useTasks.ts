import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../modules/auth/AuthContext'

export function useTasks(projectId?: number | null) {
  const { token } = useAuth()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    const fetchTasks = async () => {
      setLoading(true)
      try {
        const url = projectId 
          ? `/api/tasks?project_id=${projectId}&per_page=1000`
          : '/api/tasks?per_page=1000'
        
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Erreur de chargement des tâches')
        }

        const data = await response.json()
        const tasksList = Array.isArray(data) ? data : data.data || []
        setTasks(tasksList)
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [token, projectId, refreshTrigger])

  const refetch = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  return { tasks, loading, error, refetch }
}
