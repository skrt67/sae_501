import { useState, useEffect } from 'react'
import { useAuth } from '../modules/auth/AuthContext'

export function useKanbanBoard(projectId: number | null) {
  const { token } = useAuth()
  const [board, setBoard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !projectId) {
      setLoading(false)
      return
    }

    const fetchBoard = async () => {
      try {
        const response = await fetch(`/api/kanban?project_id=${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        })

        if (response.status === 404) {
          setBoard({ columns: { todo: [], in_progress: [], done: [] }, sprint: null })
          setError(null)
        } else if (!response.ok) {
          throw new Error('Erreur de chargement du Kanban')
        } else {
          const data = await response.json()
          setBoard(data)
          setError(null)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBoard()
  }, [token, projectId])

  const refetch = () => {
    setLoading(true)
    // Le useEffect se déclenchera automatiquement
  }

  return { board, loading, error, refetch }
}
