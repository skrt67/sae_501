import { Modal, Form, Input, Select, Button, message, Table, Tag, Popconfirm } from 'antd'
import { useState, useEffect } from 'react'
import { useAuth } from '../modules/auth/AuthContext'
import { Mail, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react'

interface Props {
  projectId: number | null
  projectName: string
  visible: boolean
  onClose: () => void
}

interface Invitation {
  id: number
  email: string
  role: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  inviter_name?: string
}

export default function ProjectInviteModal({ projectId, projectName, visible, onClose }: Props) {
  const { token } = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loadingInvitations, setLoadingInvitations] = useState(false)

  useEffect(() => {
    if (visible && projectId) {
      loadInvitations()
    }
  }, [visible, projectId])

  const loadInvitations = async () => {
    if (!projectId) return
    
    setLoadingInvitations(true)
    try {
      const resp = await fetch(`/api/projects/${projectId}/invitations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      
      if (resp.ok) {
        const data = await resp.json()
        setInvitations(data)
      }
    } catch (error) {
      // Erreur silencieuse
    } finally {
      setLoadingInvitations(false)
    }
  }

  const handleInvite = async (values: any) => {
    if (!projectId) return
    
    setLoading(true)
    try {
      const resp = await fetch(`/api/projects/${projectId}/invitations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(values)
      })
      
      if (resp.ok) {
        message.success('Invitation envoyée ! L\'utilisateur recevra un email.')
        form.resetFields()
        loadInvitations()
      } else {
        const error = await resp.json()
        message.error(error.message || 'Erreur lors de l\'invitation')
      }
    } catch (error) {
      message.error('Erreur lors de l\'invitation')
    } finally {
      setLoading(false)
    }
  }

  const deleteInvitation = async (invitationId: number) => {
    try {
      const resp = await fetch(`/api/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (resp.ok) {
        message.success('Invitation annulée')
        loadInvitations()
      } else {
        message.error('Erreur lors de l\'annulation')
      }
    } catch (error) {
      message.error('Erreur lors de l\'annulation')
    }
  }

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'pending':
        return <Tag icon={<Clock size={12} />} color="orange">En attente</Tag>
      case 'accepted':
        return <Tag icon={<CheckCircle size={12} />} color="green">Acceptée</Tag>
      case 'rejected':
        return <Tag icon={<XCircle size={12} />} color="red">Refusée</Tag>
      default:
        return <Tag>{status}</Tag>
    }
  }

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={14} style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
          <span>{email}</span>
        </div>
      )
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'owner' ? 'blue' : 'default'}>
          {role === 'owner' ? 'Owner' : 'Membre'}
        </Tag>
      )
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: 'Invité par',
      dataIndex: 'inviter_name',
      key: 'inviter_name',
      render: (name: string) => name || '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Invitation) => (
        record.status === 'pending' ? (
          <Popconfirm
            title="Annuler cette invitation ?"
            onConfirm={() => deleteInvitation(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button
              type="text"
              danger
              size="small"
              icon={<Trash2 size={14} />}
            >
              Annuler
            </Button>
          </Popconfirm>
        ) : null
      )
    }
  ]

  return (
    <Modal
      title={
        <div>
          <div style={{ fontSize: '20px', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>
            Inviter au projet
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(0, 0, 0, 0.45)' }}>
            {projectName}
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {/* Formulaire d'invitation */}
      <div style={{ 
        background: 'rgba(24, 144, 255, 0.05)', 
        border: '1px solid rgba(24, 144, 255, 0.2)',
        borderRadius: '8px',
        padding: '20px',
        marginTop: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '16px'
        }}>
          <Mail size={18} style={{ color: '#1890ff' }} />
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }}>
            Nouvelle invitation
          </span>
        </div>
        
        <Form form={form} onFinish={handleInvite} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Email requis' },
                { type: 'email', message: 'Email invalide' }
              ]}
              style={{ marginBottom: 0 }}
            >
              <Input 
                placeholder="user@example.com" 
                size="large"
                style={{ borderRadius: '6px' }}
              />
            </Form.Item>

            <Form.Item
              label="Rôle"
              name="role"
              initialValue="member"
              rules={[{ required: true }]}
              style={{ marginBottom: 0 }}
            >
              <Select size="large" style={{ borderRadius: '6px' }}>
                <Select.Option value="member">Membre</Select.Option>
                <Select.Option value="owner">Owner</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                size="large"
                style={{
                  background: '#1890ff',
                  borderColor: '#1890ff',
                  borderRadius: '6px',
                  fontWeight: 500
                }}
              >
                Envoyer
              </Button>
            </Form.Item>
          </div>
        </Form>
        
        <div style={{ 
          marginTop: '12px',
          fontSize: '13px',
          color: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span>💡</span>
          <span>L'utilisateur recevra un email et pourra accepter l'invitation depuis son centre de notifications</span>
        </div>
      </div>

      {/* Liste des invitations */}
      <div>
        <div style={{ 
          fontSize: '15px', 
          fontWeight: 600, 
          color: '#1a1a1a',
          marginBottom: '12px'
        }}>
          Invitations envoyées
        </div>
        
        <Table
          columns={columns}
          dataSource={invitations}
          loading={loadingInvitations}
          rowKey="id"
          pagination={false}
          locale={{
            emptyText: 'Aucune invitation envoyée'
          }}
          size="small"
          style={{
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        />
      </div>

      {/* Footer info */}
      <div style={{
        marginTop: '16px',
        padding: '12px 16px',
        background: 'rgba(0, 0, 0, 0.02)',
        borderRadius: '6px',
        fontSize: '13px',
        color: 'rgba(0, 0, 0, 0.65)'
      }}>
        <strong>Note :</strong> Les invitations expirent après 7 jours. Les utilisateurs doivent avoir un compte avec l'email exact pour accepter.
      </div>
    </Modal>
  )
}
