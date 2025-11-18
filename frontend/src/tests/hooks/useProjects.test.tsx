import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useProjects } from '../../hooks'
import { AuthProvider } from '../../modules/auth/AuthContext'
import { ReactNode } from 'react'

// Mock fetch
global.fetch = vi.fn()

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('token', 'test-token')
  })

  it('fetches projects on mount', async () => {
    const mockProjects = [
      { id: 1, name: 'Project 1', description: 'Description 1' },
      { id: 2, name: 'Project 2', description: 'Description 2' }
    ]

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockProjects })
    })

    const { result } = renderHook(() => useProjects(), { wrapper })

    await waitFor(() => {
      expect(result.current.projects).toEqual(mockProjects)
      expect(result.current.loading).toBe(false)
    })
  })

  it('handles fetch error', async () => {
    ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useProjects(), { wrapper })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
      expect(result.current.loading).toBe(false)
    })
  })

  it('returns empty array when no projects', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] })
    })

    const { result } = renderHook(() => useProjects(), { wrapper })

    await waitFor(() => {
      expect(result.current.projects).toEqual([])
      expect(result.current.loading).toBe(false)
    })
  })
})
