import { StrictMode, ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './modules/auth/AuthContext'
import { WorkspaceProvider } from './contexts/WorkspaceContext'
import AppLayout from './modules/layout/AppLayout'
import ErrorBoundary from './components/ErrorBoundary'
import Dashboard from './modules/dashboard/DashboardDuna'
import Kanban from './modules/kanban/KanbanModern'
import Roadmap from './modules/roadmap/RoadmapTimelineDuna'
import Users from './modules/users/UsersModern'
import Profile from './modules/users/ProfileModern'
import Settings from './modules/settings/SettingsModern'
import Login from './modules/auth/LoginSplit'
import Register from './modules/auth/RegisterSplit'
import Projects from './modules/projects/Projects'
import Epics from './modules/epics/Epics'
import Analytics from './modules/analytics/Analytics'
import Invitations from './modules/workspace/Invitations'
import InvitationsReceived from './modules/workspace/InvitationsReceived'

interface ProtectedProps {
  children: ReactNode
}

function Protected({ children }: ProtectedProps) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <WorkspaceProvider>
            <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route element={<Protected><AppLayout /></Protected>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/kanban" element={<Kanban />} />
                <Route path="/roadmap" element={<Roadmap />} />
                <Route path="/roadmap/timeline" element={<Roadmap />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/epics" element={<Epics />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/users" element={<Users />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/invitations" element={<Invitations />} />
                <Route path="/invitations-received" element={<InvitationsReceived />} />
              </Route>
              
              {/* Catch all - redirect to dashboard if authenticated, login otherwise */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
          </WorkspaceProvider>
        </AuthProvider>
      </ErrorBoundary>
    </StrictMode>
  )
}

export default App
