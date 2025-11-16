/**
 * Utilitaire pour faire des requêtes API avec les bons headers
 */

export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  })
  
  // Si la réponse n'est pas OK, essayer de parser l'erreur JSON
  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch {
      // Si on ne peut pas parser le JSON, garder le message par défaut
    }
    throw new Error(errorMessage)
  }
  
  return response
}

export async function apiGet<T = any>(url: string): Promise<T> {
  const response = await apiFetch(url)
  return response.json()
}

export async function apiPost<T = any>(url: string, data?: any): Promise<T> {
  const response = await apiFetch(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
  return response.json()
}

export async function apiPut<T = any>(url: string, data?: any): Promise<T> {
  const response = await apiFetch(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
  return response.json()
}

export async function apiDelete<T = any>(url: string): Promise<T> {
  const response = await apiFetch(url, {
    method: 'DELETE',
  })
  return response.json()
}
