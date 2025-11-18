import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../modules/auth/AuthContext'

export function useActivities(projectId?: number | null) {
  const { token } = useAuth()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    if (!token || !projectId) {
      setLoading(false)
      return
    }

    const fetchActivities = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/activities?project_id=${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Erreur de chargement des activités')
        }

        const data = await response.json()
        const activitiesList = Array.isArray(data) ? data : data.data || []
        setActivities(activitiesList)
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [token, projectId, refreshTrigger])

  const refetch = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  return { activities, loading, error, refetch }
}
