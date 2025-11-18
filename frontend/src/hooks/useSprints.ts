import { useState, useEffect } from 'react'
import { useAuth } from '../modules/auth/AuthContext'

export function useSprints(projectId?: number | null) {
  const { token } = useAuth()
  const [sprints, setSprints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    const fetchSprints = async () => {
      try {
        const url = projectId 
          ? `/api/sprints?project_id=${projectId}`
          : '/api/sprints'
        
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Erreur de chargement des sprints')
        }

        const data = await response.json()
        const sprintsList = Array.isArray(data) ? data : data.data || []
        setSprints(sprintsList)
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSprints()
  }, [token, projectId])

  return { sprints, loading, error, refetch: () => setLoading(true) }
}
