import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  useEffect(() => { if (user) navigate('/') }, [user])

  const login = async () => {
    try { await signInWithPopup(auth, googleProvider); navigate('/') }
    catch(e) { console.error(e) }
  }

  return (
      <div style={{
        minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
        background:'var(--bg)', padding:20,
        backgroundImage:'radial-gradient(ellipse 60% 40% at 50% 0%, color-mix(in srgb, var(--accent) 8%, transparent) 0%, transparent 70%)'
      }}>
        <div className="slide-up" style={{
          background:'var(--bg2)', border:'1px solid var(--border)',
          borderRadius:'var(--r-xl)', padding:'36px 28px',
          width:'100%', maxWidth:360, textAlign:'center',
          boxShadow:'var(--shadow)'
        }}>
          <div style={{ width:52, height:52, background:'var(--accent-dim)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:24, color:'var(--accent)' }}>
            <i className="fas fa-cloud" />
          </div>
          <h1 style={{ fontSize:22, fontWeight:600, letterSpacing:'-0.5px', marginBottom:6 }}>CloudVault</h1>
          <p style={{ color:'var(--text2)', fontSize:14, marginBottom:28 }}>Ton espace digital personnel</p>

          {[['fa-bolt','Upload + OCR + analyse IA'],['fa-th-large','Moodboards style Pinterest'],['fa-palette','4 thèmes personnalisables']].map(([ic, t]) => (
              <div key={t} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, textAlign:'left' }}>
                <div style={{ width:28, height:28, background:'var(--accent-dim)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)', fontSize:12, flexShrink:0 }}>
                  <i className={`fas ${ic}`} />
                </div>
                <span style={{ fontSize:13, color:'var(--text2)' }}>{t}</span>
              </div>
          ))}

          <button onClick={login} style={{
            width:'100%', padding:'13px 20px', marginTop:20,
            background:'#fff', color:'#1a1a1a', border:'none',
            borderRadius:'var(--r-md)', fontSize:14, fontWeight:500,
            display:'flex', alignItems:'center', justifyContent:'center', gap:10
          }}>
            <img src="https://www.google.com/favicon.ico" alt="" width={16} height={16} />
            Continuer avec Google
          </button>
          <p style={{ marginTop:16, fontSize:12, color:'var(--text3)' }}>Gratuit · Firebase + Cloudinary · 25 Go</p>
        </div>
      </div>
  )
}