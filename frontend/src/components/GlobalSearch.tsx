 import { useState, useEffect, useCallback } from 'react'
import { Modal, Input, Spin, Empty, Tabs } from 'antd'
import { Search, File, FolderOpen, Users, CheckSquare, Command } from 'lucide-react'
import { useAuth } from '../modules/auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Project, Task, User } from '../types'

interface SearchResult {
  projects: Project[]
  tasks: Task[]
  users: User[]
}

interface GlobalSearchProps {
  visible: boolean
  onClose: () => void
}

export default function GlobalSearch({ visible, onClose }: GlobalSearchProps) {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult>({
    projects: [],
    tasks: [],
    users: []
  })

  // Debounced search
  useEffect(() => {
    if (!query.trim() || !visible) {
      setResults({ projects: [], tasks: [], users: [] })
      return
    }

    const timeoutId = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, visible])

  const performSearch = async (searchQuery: string) => {
    if (!token) return

    setLoading(true)
    try {
      const resp = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })

      if (resp.ok) {
        const data = await resp.json()
        setResults({
          projects: data.projects || [],
          tasks: data.tasks || [],
          users: data.users || []
        })
      }
    } catch (error) {
      console.error('Erreur recherche:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResultClick = (type: 'project' | 'task' | 'user', id: number) => {
    onClose()
    setQuery('')
    
    switch (type) {
      case 'project':
        navigate('/projects')
        break
      case 'task':
        navigate('/kanban')
        break
      case 'user':
        navigate('/users')
        break
    }
  }

  const totalResults = results.projects.length + results.tasks.length + results.users.length

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      title={null}
      closable={false}
      styles={{ body: { padding: 0 } }}
      style={{ top: 50 }}
    >
      {/* Header de recherche */}
      <div style={{ 
        padding: '20px 24px', 
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Search size={20} style={{ color: 'var(--text-muted)' }} />
          <Input
            placeholder="Rechercher des projets, tâches, utilisateurs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            bordered={false}
            autoFocus
            style={{ 
              fontSize: '16px', 
              padding: 0,
              color: 'var(--text)'
            }}
          />
          {loading && <Spin size="small" />}
        </div>
        
        {/* Raccourci clavier */}
        <div style={{ 
          marginTop: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          <Command size={14} />
          <span>Utilisez Ctrl+K pour ouvrir la recherche</span>
        </div>
      </div>

      {/* Résultats */}
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {!query.trim() ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <Search size={48} style={{ color: 'var(--text-subtle)', marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Commencez à taper pour rechercher
            </p>
          </div>
        ) : loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <Spin size="large" />
          </div>
        ) : totalResults === 0 ? (
          <Empty 
            description="Aucun résultat trouvé" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '48px 24px' }}
          />
        ) : (
          <Tabs
            defaultActiveKey="all"
            style={{ padding: '0 24px' }}
            items={[
              {
                key: 'all',
                label: `Tout (${totalResults})`,
                children: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '24px' }}>
                    {/* Projets */}
                    {results.projects.length > 0 && (
                      <>
                        <div style={{ 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginTop: '16px'
                        }}>
                          Projets ({results.projects.length})
                        </div>
                        {results.projects.map((project) => (
                          <div
                            key={`project-${project.id}`}
                            onClick={() => handleResultClick('project', project.id)}
                            style={{
                              padding: '12px 16px',
                              background: 'var(--bg-hover)',
                              borderRadius: 'var(--radius-md)',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--primary-light)'
                              e.currentTarget.style.transform = 'translateX(4px)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'var(--bg-hover)'
                              e.currentTarget.style.transform = 'translateX(0)'
                            }}
                          >
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--primary)' + '20',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <FolderOpen size={18} style={{ color: 'var(--primary)' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ 
                                fontSize: '14px', 
                                fontWeight: '500',
                                color: 'var(--text)',
                                marginBottom: '2px'
                              }}>
                                {project.name}
                              </div>
                              {project.description && (
                                <div style={{ 
                                  fontSize: '12px', 
                                  color: 'var(--text-muted)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {project.description}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Tâches */}
                    {results.tasks.length > 0 && (
                      <>
                        <div style={{ 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginTop: '16px'
                        }}>
                          Tâches ({results.tasks.length})
                        </div>
                        {results.tasks.map((task) => (
                          <div
                            key={`task-${task.id}`}
                            onClick={() => handleResultClick('task', task.id)}
                            style={{
                              padding: '12px 16px',
                              background: 'var(--bg-hover)',
                              borderRadius: 'var(--radius-md)',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--success-light)'
                              e.currentTarget.style.transform = 'translateX(4px)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'var(--bg-hover)'
                              e.currentTarget.style.transform = 'translateX(0)'
                            }}
                          >
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--success)' + '20',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <CheckSquare size={18} style={{ color: 'var(--success)' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ 
                                fontSize: '14px', 
                                fontWeight: '500',
                                color: 'var(--text)',
                                marginBottom: '2px'
                              }}>
                                {task.title}
                              </div>
                              {task.description && (
                                <div style={{ 
                                  fontSize: '12px', 
                                  color: 'var(--text-muted)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {task.description}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Utilisateurs */}
                    {results.users.length > 0 && (
                      <>
                        <div style={{ 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginTop: '16px'
                        }}>
                          Utilisateurs ({results.users.length})
                        </div>
                        {results.users.map((user) => (
                          <div
                            key={`user-${user.id}`}
                            onClick={() => handleResultClick('user', user.id)}
                            style={{
                              padding: '12px 16px',
                              background: 'var(--bg-hover)',
                              borderRadius: 'var(--radius-md)',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--info-light)'
                              e.currentTarget.style.transform = 'translateX(4px)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'var(--bg-hover)'
                              e.currentTarget.style.transform = 'translateX(0)'
                            }}
                          >
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: 'var(--info)' + '20',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              fontSize: '14px',
                              fontWeight: '600',
                              color: 'var(--info)'
                            }}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ 
                                fontSize: '14px', 
                                fontWeight: '500',
                                color: 'var(--text)',
                                marginBottom: '2px'
                              }}>
                                {user.name}
                              </div>
                              <div style={{ 
                                fontSize: '12px', 
                                color: 'var(--text-muted)'
                              }}>
                                {user.email}
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )
              }
            ]}
          />
        )}
      </div>
    </Modal>
  )
}
