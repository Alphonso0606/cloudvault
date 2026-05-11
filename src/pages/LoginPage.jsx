import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user) navigate('/')
  }, [user])

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg)',
      backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(34,211,160,0.08) 0%, transparent 70%)'
    }}>
      <div className="slide-up" style={{
        background: 'var(--color-bg-2)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)', padding: '48px 40px', width: 360, textAlign: 'center',
        boxShadow: 'var(--shadow-card)'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, background: 'var(--color-accent-dim)',
            borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 26, color: 'var(--color-accent)'
          }}>
            <i className="fas fa-cloud" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.5px', marginBottom: 6 }}>CloudVault</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Tes fichiers, partout, toujours accessibles</p>
        </div>

        {/* Features rapides */}
        <div style={{ marginBottom: 32, textAlign: 'left' }}>
          {[
            ['fa-bolt', 'Upload rapide avec prévisualisation'],
            ['fa-tags', 'Tags pour retrouver en 2 secondes'],
            ['fa-star', 'Favoris et filtres intelligents'],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 28, height: 28, background: 'var(--color-accent-dim)', borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-accent)', fontSize: 12
              }}>
                <i className={`fas ${icon}`} />
              </div>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{text}</span>
            </div>
          ))}
        </div>

        <button onClick={handleGoogle} style={{
          width: '100%', padding: '12px 20px',
          background: '#fff', color: '#1a1a1a',
          border: 'none', borderRadius: 'var(--radius-md)',
          fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 10, transition: 'opacity 0.15s'
        }}
          onMouseEnter={e => e.target.style.opacity = '0.9'}
          onMouseLeave={e => e.target.style.opacity = '1'}
        >
          <img src="https://www.google.com/favicon.ico" alt="" width={16} height={16} style={{ borderRadius: 2 }} />
          Continuer avec Google
        </button>

        <p style={{ marginTop: 20, fontSize: 12, color: 'var(--color-text-dim)' }}>
          Gratuit · Firebase Spark Plan · 5 Go inclus
        </p>
      </div>
    </div>
  )
}
