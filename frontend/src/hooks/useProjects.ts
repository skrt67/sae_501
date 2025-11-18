import { useState, useEffect } from 'react'
import { useAuth } from '../modules/auth/AuthContext'

export function useProjects() {
  const { token } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Erreur de chargement des projets')
        }

        const data = await response.json()
        const projectsList = Array.isArray(data) ? data : data.data || []
        setProjects(projectsList)
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [token])

  return { projects, loading, error, refetch: () => setLoading(true) }
}
