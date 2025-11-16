import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Spin, Progress, Calendar as AntCalendar, Badge } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Users, 
  Target,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react'
import './Dashboard-light.css'

interface Stats {
  totalProjects: number
  activeProjects: number
  totalTasks: number
  completedTasks: number
  totalUsers: number
  totalEpics: number
}

export default function DashboardDuna() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalUsers: 0,
    totalEpics: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      loadStats()
    }
  }, [token])

  const loadStats = async () => {
    setLoading(true)
    try {
      // Charger les projets
      const projectResp = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })
      if (projectResp.ok) {
        const data = await projectResp.json()
        const projects = Array.isArray(data) ? data : data.data || []
        setStats(prev => ({
          ...prev,
          totalProjects: projects.length,
          activeProjects: projects.filter((p: any) => p.status === 'active').length
        }))
      }

      // Charger les tâches
      const taskResp = await fetch('/api/tasks', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })
      if (taskResp.ok) {
        const data = await taskResp.json()
        const tasks = Array.isArray(data) ? data : data.data || []
        setStats(prev => ({
          ...prev,
          totalTasks: tasks.length,
          completedTasks: tasks.filter((t: any) => t.status === 'done').length
        }))
      }

      // Charger les epics
      const epicResp = await fetch('/api/epics', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })
      if (epicResp.ok) {
        const data = await epicResp.json()
        const epics = Array.isArray(data) ? data : data.data || []
        setStats(prev => ({ ...prev, totalEpics: epics.length }))
      }

    } catch (error) {
      console.error('Erreur chargement stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8f9fa', 
      padding: '60px 40px' 
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ marginBottom: '48px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            gap: '24px',
            flexWrap: 'wrap' 
          }}>
            <div>
              <h1 style={{ 
                fontSize: '42px', 
                fontWeight: 600, 
                color: '#1a1a1a', 
                margin: '0 0 12px 0',
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}>
                Bonjour, {user?.name || 'Utilisateur'}
              </h1>
              <p style={{ 
                fontSize: '18px', 
                color: 'rgba(0, 0, 0, 0.65)', 
                margin: 0,
                lineHeight: 1.5
              }}>
                Voici un aperçu de vos projets et tâches
              </p>
            </div>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px',
              background: '#ffffff',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              color: 'rgba(0, 0, 0, 0.65)',
              border: '1px solid rgba(0, 0, 0, 0.06)'
            }}>
              <Calendar size={20} />
              <span>{new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
        </header>

        {/* Main Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          {/* Stat Card 1 - Projets */}
          <div style={{ 
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: '12px',
            padding: '32px',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px',
                background: 'rgba(24, 144, 255, 0.1)',
                color: '#1890ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Target size={24} />
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: 'rgba(0, 0, 0, 0.45)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 500
              }}>Projets</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 8px 0' }}>
                {stats.totalProjects}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: 'rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <TrendingUp size={14} />
                {stats.activeProjects} actifs
              </div>
            </div>
          </div>

          {/* Stat Card 2 - Tâches */}
          <div style={{ 
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: '12px',
            padding: '32px',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px',
                background: 'rgba(82, 196, 26, 0.1)',
                color: '#52c41a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle size={24} />
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: 'rgba(0, 0, 0, 0.45)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 500
              }}>Tâches</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 8px 0' }}>
                {stats.totalTasks}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: 'rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <CheckCircle size={14} />
                {stats.completedTasks} terminées
              </div>
            </div>
          </div>

          {/* Stat Card 3 - Epics */}
          <div style={{ 
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: '12px',
            padding: '32px',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px',
                background: 'rgba(250, 173, 20, 0.1)',
                color: '#faad14',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BarChart3 size={24} />
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: 'rgba(0, 0, 0, 0.45)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 500
              }}>Epics</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 8px 0' }}>
                {stats.totalEpics}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: 'rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Activity size={14} />
                En planification
              </div>
            </div>
          </div>

          {/* Stat Card 4 - Progression */}
          <div style={{ 
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: '12px',
            padding: '32px',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px',
                background: 'rgba(22, 119, 255, 0.1)',
                color: '#1677ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Clock size={24} />
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: 'rgba(0, 0, 0, 0.45)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 500
              }}>Progression</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 8px 0' }}>
                {completionRate}%
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: 'rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <TrendingUp size={14} />
                Taux de complétion
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ 
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 600, 
                color: '#1a1a1a', 
                margin: '0 0 8px 0' 
              }}>
                Progression Globale
              </h2>
              <span style={{ 
                fontSize: '14px', 
                color: 'rgba(0, 0, 0, 0.45)' 
              }}>
                {stats.completedTasks} sur {stats.totalTasks} tâches complétées
              </span>
            </div>
            <div>
              <Progress
                percent={completionRate}
                strokeColor={{
                  '0%': '#1890ff',
                  '100%': '#52c41a',
                }}
                strokeWidth={12}
                trailColor="#f0f0f0"
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '24px',
                gap: '16px'
              }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <span style={{ 
                    fontSize: '13px', 
                    color: 'rgba(0, 0, 0, 0.45)',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    À faire
                  </span>
                  <span style={{ 
                    fontSize: '24px', 
                    fontWeight: 600, 
                    color: '#1a1a1a' 
                  }}>
                    {stats.totalTasks - stats.completedTasks}
                  </span>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <span style={{ 
                    fontSize: '13px', 
                    color: 'rgba(0, 0, 0, 0.45)',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    En cours
                  </span>
                  <span style={{ 
                    fontSize: '24px', 
                    fontWeight: 600, 
                    color: '#1890ff' 
                  }}>
                    {Math.floor((stats.totalTasks - stats.completedTasks) / 2)}
                  </span>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <span style={{ 
                    fontSize: '13px', 
                    color: 'rgba(0, 0, 0, 0.45)',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Terminées
                  </span>
                  <span style={{ 
                    fontSize: '24px', 
                    fontWeight: 600, 
                    color: '#52c41a' 
                  }}>
                    {stats.completedTasks}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendrier */}
        <div>
          <div style={{ 
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: '4px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: 600, 
                color: '#000000', 
                margin: 0 
              }}>
                Calendrier
              </h2>
            </div>
            <AntCalendar
              fullscreen={false}
              dateCellRender={(date) => {
                // Exemple de badge pour les dates avec des tâches
                const listData = [
                  // Vous pouvez ajouter vos données ici
                ];
                return (
                  <div>
                    {listData.map((item: any) => (
                      <Badge key={item.content} status={item.type} text={item.content} />
                    ))}
                  </div>
                );
              }}
              style={{
                border: '1px solid rgba(0, 0, 0, 0.06)',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div style={{ 
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 600, 
                color: '#1a1a1a', 
                margin: 0 
              }}>
                Actions Rapides
              </h2>
            </div>
            <div>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <button 
                onClick={() => navigate('/projects')}
                style={{ 
                  background: '#ffffff',
                  border: '2px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#1a1a1a'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1890ff'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.06)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px',
                    background: 'rgba(24, 144, 255, 0.1)',
                    color: '#1890ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Target size={24} />
                  </div>
                  <span>Nouveau Projet</span>
                </button>
                <button 
                onClick={() => navigate('/kanban')}
                style={{ 
                  background: '#ffffff',
                  border: '2px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#1a1a1a'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#52c41a'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(82, 196, 26, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.06)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px',
                    background: 'rgba(82, 196, 26, 0.1)',
                    color: '#52c41a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CheckCircle size={24} />
                  </div>
                  <span>Nouvelle Tâche</span>
                </button>
                <button 
                onClick={() => navigate('/epics')}
                style={{ 
                  background: '#ffffff',
                  border: '2px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#1a1a1a'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#faad14'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(250, 173, 20, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.06)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px',
                    background: 'rgba(250, 173, 20, 0.1)',
                    color: '#faad14',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BarChart3 size={24} />
                  </div>
                  <span>Nouvelle Epic</span>
                </button>
                <button 
                onClick={() => navigate('/roadmap')}
                style={{ 
                  background: '#ffffff',
                  border: '2px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#1a1a1a'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#722ed1'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(114, 46, 209, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.06)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px',
                    background: 'rgba(114, 46, 209, 0.1)',
                    color: '#722ed1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Users size={24} />
                  </div>
                  <span>Inviter Membre</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
