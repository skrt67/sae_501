import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../../modules/auth/AuthContext'
import { ReactNode } from 'react'

// Mock fetch
global.fetch = vi.fn()

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('provides initial auth state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.loading).toBe(true)
  })

  it('login sets user and token', async () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' }
    const mockToken = 'test-token'

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser, token: mockToken })
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login('test@example.com', 'password')
    })

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.token).toBe(mockToken)
    })
  })

  it('login throws error on failure', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' })
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await expect(
      act(async () => {
        await result.current.login('test@example.com', 'wrong-password')
      })
    ).rejects.toThrow()
  })

  it('logout clears user and token', async () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' }
    const mockToken = 'test-token'

    // Setup logged in state
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser, token: mockToken })
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login('test@example.com', 'password')
    })

    // Mock logout
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    })

    await act(async () => {
      await result.current.logout()
    })

    await waitFor(() => {
      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
    })
  })

  it('persists token in localStorage', async () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' }
    const mockToken = 'test-token'

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser, token: mockToken })
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login('test@example.com', 'password')
    })

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe(mockToken)
    })
  })
})
