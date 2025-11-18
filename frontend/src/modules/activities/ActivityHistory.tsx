import { useState, useEffect } from 'react'
import { useActivities, useProjects } from '../../hooks'
import { Select, Spin, Empty } from 'antd'
import { Activity, Clock, Plus, Edit, Trash2, Move } from 'lucide-react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/fr'

dayjs.extend(relativeTime)
dayjs.locale('fr')

const { Option } = Select

export default function ActivityHistory() {
  const { projects } = useProjects()
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const { activities, loading } = useActivities(selectedProject)

  // Sélectionner le premier projet par défaut
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id)
    }
  }, [projects, selectedProject])

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Plus size={16} style={{ color: '#52c41a' }} />
      case 'updated':
        return <Edit size={16} style={{ color: '#1890ff' }} />
      case 'deleted':
        return <Trash2 size={16} style={{ color: '#ff4d4f' }} />
      case 'moved':
        return <Move size={16} style={{ color: '#722ed1' }} />
      default:
        return <Activity size={16} style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return '#52c41a'
      case 'updated':
        return '#1890ff'
      case 'deleted':
        return '#ff4d4f'
      case 'moved':
        return '#722ed1'
      default:
        return 'rgba(0, 0, 0, 0.45)'
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8f9fa', 
      padding: '60px 40px' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ marginBottom: '48px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            marginBottom: '24px'
          }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ 
                fontSize: '42px', 
                fontWeight: 600, 
                color: '#1a1a1a', 
                margin: '0 0 12px 0',
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}>
                Historique des activités
              </h1>
              <p style={{ 
                fontSize: '18px', 
                color: 'rgba(0, 0, 0, 0.65)', 
                margin: 0,
                lineHeight: 1.5
              }}>
                Suivez toutes les actions effectuées sur le projet
              </p>
            </div>
            
            <Select
              placeholder="Sélectionner un projet"
              value={selectedProject}
              onChange={setSelectedProject}
              style={{ width: 250 }}
              size="large"
              options={projects.map(p => ({ value: p.id, label: p.name }))}
            />
          </div>
        </header>

        {/* Content */}
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '400px' 
          }}>
            <Spin size="large" />
          </div>
        ) : activities.length === 0 ? (
          <div style={{ 
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: '12px',
            padding: '80px 40px',
            textAlign: 'center'
          }}>
            <Activity size={64} style={{ color: 'rgba(0, 0, 0, 0.25)', marginBottom: '24px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 12px 0' }}>
              Aucune activité
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(0, 0, 0, 0.45)', margin: 0 }}>
              Les activités du projet apparaîtront ici
            </p>
          </div>
        ) : (
          <div style={{ 
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ position: 'relative' }}>
              {/* Timeline line */}
              <div style={{
                position: 'absolute',
                left: '20px',
                top: '20px',
                bottom: '20px',
                width: '2px',
                background: 'rgba(0, 0, 0, 0.06)'
              }} />

              {/* Activities */}
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  style={{
                    position: 'relative',
                    paddingLeft: '60px',
                    paddingBottom: index < activities.length - 1 ? '32px' : '0',
                    marginBottom: index < activities.length - 1 ? '32px' : '0',
                    borderBottom: index < activities.length - 1 ? '1px solid rgba(0, 0, 0, 0.06)' : 'none'
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    position: 'absolute',
                    left: '8px',
                    top: '0',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: `2px solid ${getActionColor(activity.action)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1
                  }}>
                    {getActionIcon(activity.action)}
                  </div>

                  {/* Content */}
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div>
                        <span style={{ 
                          fontSize: '15px', 
                          fontWeight: 600, 
                          color: '#1a1a1a' 
                        }}>
                          {activity.user?.name || 'Utilisateur'}
                        </span>
                        <span style={{ 
                          fontSize: '15px', 
                          color: 'rgba(0, 0, 0, 0.65)',
                          marginLeft: '8px'
                        }}>
                          {activity.description}
                        </span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        fontSize: '13px',
                        color: 'rgba(0, 0, 0, 0.45)',
                        flexShrink: 0,
                        marginLeft: '16px'
                      }}>
                        <Clock size={14} />
                        <span>{dayjs(activity.created_at).fromNow()}</span>
                      </div>
                    </div>

                    {/* Changes details */}
                    {activity.changes && Object.keys(activity.changes).length > 0 && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px 16px',
                        background: 'rgba(0, 0, 0, 0.02)',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: 'rgba(0, 0, 0, 0.65)'
                      }}>
                        {Object.entries(activity.changes).map(([key, value]: [string, any]) => (
                          <div key={key} style={{ marginBottom: '4px' }}>
                            <span style={{ fontWeight: 500 }}>{key}:</span>{' '}
                            {value.old && <span style={{ textDecoration: 'line-through', color: '#ff4d4f' }}>{value.old}</span>}
                            {value.old && value.new && ' → '}
                            {value.new && <span style={{ color: '#52c41a' }}>{value.new}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
