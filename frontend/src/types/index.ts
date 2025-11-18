// 🎯 Types globaux de l'application

export interface User {
  id: number
  name: string
  email: string
  avatar_url?: string
  email_verified_at?: string
  created_at?: string
  updated_at?: string
  settings?: Record<string, any>
  role?: string
}

export interface Notification {
  id: number
  type: 'deadline' | 'assignment' | 'mention' | 'comment' | 'general'
  title: string
  message: string
  read_at: string | null
  created_at: string
  data?: Record<string, any>
  user_id?: number
}

export interface Invitation {
  id: number
  project_id: number
  project?: {
    id: number
    name: string
  }
  project_name?: string
  email: string
  role: 'owner' | 'member'
  status: 'pending' | 'accepted' | 'rejected'
  token: string
  invited_by: number
  inviter_name: string
  created_at: string
  expires_at?: string
}

export interface Sprint {
  id: number
  project_id: number
  name: string
  phase?: string
  goal?: string
  starts_at: string
  ends_at: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Project {
  id: number
  name: string
  description?: string
  status?: 'active' | 'archived' | 'completed'
  start_date?: string
  end_date?: string
  created_at?: string
  updated_at?: string
  progress?: number
  color?: string
  users?: User[]
  sprints?: Sprint[]
}

export interface Task {
  id: number
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'done'
  priority: number // 1-5, where 1 is high and 5 is low
  project_id: number
  assignee_id?: number
  reporter_id?: number
  due_date?: string
  created_at?: string
  updated_at?: string
  tags?: string[]
  estimated_hours?: number
  actual_hours?: number
  workspace_id?: number
  sprint_id?: number
  epic_id?: number
}

export interface Epic {
  id: number
  name: string
  title?: string
  description?: string
  project_id: number
  status?: 'planning' | 'in_progress' | 'completed'
  start_date?: string
  end_date?: string
  created_at?: string
  updated_at?: string
  progress?: number
  color?: string
  phase?: string
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  per_page: number
  current_page: number
  last_page: number
}

// Form Types
export interface LoginFormData {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  password_confirmation: string
}

// State Types
export interface ProcessingState {
  [key: number]: boolean
}
