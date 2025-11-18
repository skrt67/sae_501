import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Target, Zap, Heart } from 'lucide-react'

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      {/* Header */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        padding: '20px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '15px',
              color: '#666',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#000'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
          >
            <ArrowLeft size={20} />
            Retour à l'accueil
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#000',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: '700',
              fontSize: '18px'
            }}>
              A
            </div>
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#000' }}>Asano</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        background: '#000',
        padding: '120px 40px',
        textAlign: 'center',
        color: '#fff'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '56px',
            fontWeight: '700',
            marginBottom: '24px',
            lineHeight: '1.2'
          }}>
            À propos d'Asano
          </h1>
          <p style={{
            fontSize: '20px',
            lineHeight: '1.8',
            opacity: 0.95,
            margin: 0
          }}>
            Une solution de gestion de projets agile conçue pour simplifier la collaboration
            et maximiser la productivité des équipes modernes.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 40px' }}>
        
        {/* Mission */}
        <section style={{ marginBottom: '80px' }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '60px',
            border: '1px solid rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: '#000',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <Target size={40} color="#fff" />
              </div>
              <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px', color: '#000' }}>
                Notre Mission
              </h2>
            </div>
            <p style={{
              fontSize: '18px',
              lineHeight: '1.8',
              color: '#666',
              textAlign: 'center',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              Asano a été créé dans le cadre du projet SAE 501 à l'IUT de Haguenau avec pour objectif
              de fournir un outil de gestion de projets agile intuitif et puissant. Notre mission est de
              permettre aux équipes de se concentrer sur ce qui compte vraiment : créer de la valeur et
              atteindre leurs objectifs.
            </p>
          </div>
        </section>

        {/* Values */}
        <section style={{ marginBottom: '80px' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '48px',
            color: '#000'
          }}>
            Nos Valeurs
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '40px',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: '#f5f5f5',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <Zap size={30} color="#000" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#000' }}>
                Simplicité
              </h3>
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#666', margin: 0 }}>
                Une interface épurée et intuitive qui permet à chaque membre de l'équipe de
                se concentrer sur l'essentiel sans courbe d'apprentissage complexe.
              </p>
            </div>

            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '40px',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: '#f5f5f5',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <Users size={30} color="#000" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#000' }}>
                Collaboration
              </h3>
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#666', margin: 0 }}>
                Des outils conçus pour faciliter le travail d'équipe, la communication et
                le partage d'informations en temps réel.
              </p>
            </div>

            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '40px',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: '#f5f5f5',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <Heart size={30} color="#000" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#000' }}>
                Passion
              </h3>
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#666', margin: 0 }}>
                Développé avec passion par des étudiants pour répondre aux besoins réels
                des équipes agiles modernes.
              </p>
            </div>
          </div>
        </section>

        {/* Project Info */}
        <section>
          <div style={{
            background: '#000',
            borderRadius: '16px',
            padding: '60px',
            textAlign: 'center',
            color: '#fff'
          }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '24px' }}>
              Projet Académique
            </h2>
            <p style={{ fontSize: '18px', lineHeight: '1.8', marginBottom: '32px', opacity: 0.95 }}>
              Asano est développé dans le cadre de la SAE 501 à l'IUT de Haguenau.
              <br />
              Ce projet met en pratique les compétences acquises en développement web,
              gestion de projet et méthodologies agiles.
            </p>
            <div style={{
              display: 'inline-block',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px 32px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                © 2025 Asano - SAE 501 - IUT de Haguenau
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer style={{
        background: '#fff',
        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
        padding: '40px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#000', margin: 0, fontSize: '14px', fontWeight: '500' }}>
          Réalisé par DEPELI Altan
        </p>
      </footer>
    </div>
  )
}
