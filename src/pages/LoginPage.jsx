import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEffect, useState, useRef, useCallback } from 'react'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚠️ IMPORTANT : Les vidéos DOIVENT être en .mp4
// Les .mov ne fonctionnent PAS dans les navigateurs
// Convertis tes .mov en .mp4 sur cloudconvert.com
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const MEDIA = [
  {
    type: 'video',
    url: 'https://res.cloudinary.com/dl9rvxnel/video/upload/v1779020579/cloudvault/hiu98mxp1kmaqua9w9a8.mov',
    caption: 'Tes plus beaux moments',
    sub: 'Pour toujours ici 💜'
  },
  {
    type: 'image',
    url: 'https://res.cloudinary.com/dl9rvxnel/image/upload/v1779020565/cloudvault/vl0nzj7uottpoi4r9bku.jpg',
    caption: 'Tes inspirations',
    sub: "Un espace rien qu'à toi"
  },
  {
    type: 'video',
    url: 'https://res.cloudinary.com/dl9rvxnel/video/upload/v1779020567/cloudvault/rnzaewg4bv6ds7lzrtk8.mp4',
    caption: 'Tes souvenirs',
    sub: 'Tous précieusement gardés'
  },
  {
    type: 'image',
    url: 'https://res.cloudinary.com/dl9rvxnel/image/upload/v1779020566/cloudvault/ebbax99gkx3jml1g9aey.jpg',
    caption: 'Ton univers',
    sub: 'Organisé à ta façon'
  },
  {
    type: 'video',
    url: 'https://res.cloudinary.com/dl9rvxnel/video/upload/v1779022934/cloudvault/vjajwys5fuzxtei01dnz.mov',
    caption: 'Tes créations',
    sub: 'Infinies et uniques'
  },
]

const FEATURES = [
  { icon: 'fa-images',   label: 'Galerie privée', desc: 'Photos et vidéos en sécurité' },
  { icon: 'fa-th-large', label: 'Moodboards',     desc: 'Tes boards style Pinterest'   },
  { icon: 'fa-robot',    label: 'IA intégrée',    desc: 'Recherche dans le contenu'    },
  { icon: 'fa-palette',  label: '4 thèmes',       desc: 'Personnalise tout'            },
]

const TRANSITION_NAMES = ['fade', 'slide', 'zoom', 'blur', 'wipe']

export default function LoginPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [idx, setIdx]               = useState(0)
  const [nextIdx, setNextIdx]       = useState(null)
  const [tr, setTr]                 = useState('fade')
  const [animating, setAnimating]   = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [particles, setParticles]   = useState([])
  const [stars, setStars]           = useState([])
  const [captionKey, setCaptionKey] = useState(0)
  const [showHint, setShowHint]     = useState(false)

  const timerRef    = useRef(null)
  const videoRefs   = useRef({})
  const touchStartX = useRef(null)
  const isAnimating = useRef(false)

  useEffect(() => { if (user) navigate('/') }, [user])

  // Génère particules + étoiles une seule fois
  useEffect(() => {
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 6, dur: 5 + Math.random() * 5,
      op: 0.1 + Math.random() * 0.25,
    })))
    setStars(Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 4, dur: 2 + Math.random() * 3,
    })))
    const t1 = setTimeout(() => setShowHint(true), 4000)
    const t2 = setTimeout(() => setShowHint(false), 7000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // Gère lecture vidéo
  const playVideo = useCallback((i) => {
    const ref = videoRefs.current[i]
    if (!ref) return
    ref.currentTime = 0
    ref.play().catch(() => {})
  }, [])

  const pauseAll = useCallback(() => {
    Object.values(videoRefs.current).forEach(r => r?.pause())
  }, [])

  // Lance la vidéo active après transition
  useEffect(() => {
    if (!animating && MEDIA[idx]?.type === 'video') {
      playVideo(idx)
    }
  }, [idx, animating])

  // Avance vers un slide
  const goTo = useCallback((to) => {
    if (isAnimating.current || to === idx) return
    clearTimeout(timerRef.current)
    isAnimating.current = true
    setAnimating(true)
    setTr(TRANSITION_NAMES[Math.floor(Math.random() * TRANSITION_NAMES.length)])
    pauseAll()
    setNextIdx(to)

    // Durée de l'animation CSS : 700ms
    setTimeout(() => {
      setIdx(to)
      setNextIdx(null)
      setAnimating(false)
      setCaptionKey(k => k + 1)
      isAnimating.current = false
    }, 700)
  }, [idx, pauseAll])

  // Auto-avance
  useEffect(() => {
    const dur = MEDIA[idx]?.type === 'video' ? 7000 : 4500
    timerRef.current = setTimeout(() => goTo((idx + 1) % MEDIA.length), dur)
    return () => clearTimeout(timerRef.current)
  }, [idx, goTo, animating])

  // Swipe tactile
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd   = (e) => {
    const dx = e.changedTouches[0].clientX - (touchStartX.current ?? 0)
    if (Math.abs(dx) > 44) {
      goTo(dx < 0
          ? (idx + 1) % MEDIA.length
          : (idx - 1 + MEDIA.length) % MEDIA.length
      )
    }
  }

  const login = async () => {
    setLoginLoading(true)
    try { await signInWithPopup(auth, googleProvider); navigate('/') }
    catch (e) { console.error(e); setLoginLoading(false) }
  }

  // ── Rendu d'un item media ──
  const MediaItem = ({ item, className, extraStyle = {} }) => (
      item.type === 'video'
          ? <video
              ref={el => { if (el) videoRefs.current[MEDIA.indexOf(item)] = el }}
              src={item.url} muted loop playsInline
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...extraStyle }}
          />
          : <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${item.url})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            ...extraStyle
          }} />
  )

  // Classe CSS de transition selon direction
  const inClass  = `tr-${tr}-in`
  const outClass = `tr-${tr}-out`

  return (
      <div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{
            minHeight: '100vh', width: '100%',
            display: 'flex', flexDirection: 'column',
            background: '#0d0a1e',
            fontFamily: "'DM Sans', sans-serif",
            overflow: 'hidden', position: 'relative',
          }}
      >
        <style>{CSS}</style>

        {/* ── Étoiles ── */}
        {stars.map(s => (
            <div key={s.id} style={{
              position: 'absolute',
              left: `${s.x}%`, top: `${s.y}%`,
              width: s.size, height: s.size,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.7)',
              animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
              zIndex: 0, pointerEvents: 'none',
            }} />
        ))}

        {/* ── Particules ── */}
        {particles.map(p => (
            <div key={p.id} style={{
              position: 'absolute',
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size,
              borderRadius: '50%',
              background: `rgba(167,139,250,${p.op})`,
              animation: `floatUp ${p.dur}s ease-in-out ${p.delay}s infinite`,
              zIndex: 0, pointerEvents: 'none',
            }} />
        ))}

        {/* ── Orbes déco ── */}
        <div className="orb orb-tr" />
        <div className="orb orb-bl" />

        {/* ═══════════════════════════ LAYOUT ═══════════════════════════ */}
        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', minHeight: '100vh' }}>

          {/* ═══════════ SIDE CARROUSEL (desktop gauche / mobile plein écran) ═══════════ */}
          <div className="carousel-side">

            {/* Layer actuel */}
            <div className={animating ? outClass : ''} style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
              <MediaItem item={MEDIA[idx]}
                         extraStyle={{ animation: !animating && MEDIA[idx].type === 'image' ? 'kenBurns 9s ease-in-out infinite alternate' : 'none' }}
              />
            </div>

            {/* Layer suivant */}
            {animating && nextIdx !== null && (
                <div className={inClass} style={{ position: 'absolute', inset: 0, zIndex: 3 }}>
                  <MediaItem item={MEDIA[nextIdx]} />
                </div>
            )}

            {/* Overlay cinématique */}
            <div className="cinema-overlay" />

            {/* Bandes cinéma */}
            <div className="cinema-band cinema-band-top" />
            <div className="cinema-band cinema-band-bot" />

            {/* Badge + live indicator */}
            <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="glass-badge">
                <div className="dot-pulse" />
                <span>Créé rien que pour toi 💜</span>
              </div>
              {MEDIA[idx].type === 'video' && (
                  <div className="glass-badge live-badge">
                    <div className="dot-pulse live-dot" />
                    <span style={{ fontWeight: 600, letterSpacing: '0.08em' }}>LIVE</span>
                  </div>
              )}
            </div>

            {/* Sélecteur slides (top right) */}
            <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 5 }}>
              {MEDIA.map((m, i) => (
                  <button key={i} onClick={() => goTo(i)} className={`slide-btn ${i === idx ? 'slide-btn-active' : ''}`}>
                    <i className={`fas fa-${m.type === 'video' ? 'play' : 'image'}`} style={{ fontSize: 9 }} />
                  </button>
              ))}
            </div>

            {/* Caption */}
            <div style={{ position: 'absolute', bottom: 28, left: 20, right: 20, zIndex: 10 }}>
              <p key={`sub-${captionKey}`} className="caption-sub">{MEDIA[idx].sub}</p>
              <h2 key={`cap-${captionKey}`} className="caption-main">{MEDIA[idx].caption}</h2>
            </div>

            {/* Barre de progression */}
            <div className="progress-bar-row">
              {MEDIA.map((m, i) => (
                  <div key={i} className="progress-track">
                    {i === idx && (
                        <div
                            key={`prog-${idx}`}
                            className="progress-fill"
                            style={{ animationDuration: `${m.type === 'video' ? 7 : 4.5}s` }}
                        />
                    )}
                    {i < idx && <div className="progress-done" />}
                  </div>
              ))}
            </div>

            {/* Floating cards (desktop uniquement) */}
            <div className="floating-cards-wrap">
              {[
                { icon: 'fa-lock',  label: 'Privé & sécurisé' },
                { icon: 'fa-bolt',  label: 'Accès instantané' },
                { icon: 'fa-heart', label: 'Fait avec amour'  },
              ].map((f, i) => (
                  <div key={i} className="floating-card" style={{ animationDelay: `${0.3 + i * 0.15}s` }}>
                    <div className="floating-card-icon">
                      <i className={`fas ${f.icon}`} />
                    </div>
                    <span>{f.label}</span>
                  </div>
              ))}
            </div>

            {/* Hint swipe (mobile) */}
            {showHint && (
                <div className="swipe-hint">
                  <i className="fas fa-chevron-left" />
                  <i className="fas fa-hand-pointer" style={{ fontSize: 18, margin: '0 4px' }} />
                  <i className="fas fa-chevron-right" />
                  <p>Swipe</p>
                </div>
            )}

            {/* Dots (mobile) */}
            <div className="dots-row">
              {MEDIA.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)} className={`dot ${i === idx ? 'dot-active' : ''}`} />
              ))}
            </div>

            {/* Caption mobile (sous les dots) */}
            <div className="mobile-caption">
              <p key={`msub-${captionKey}`} className="caption-sub">{MEDIA[idx].sub}</p>
              <h2 key={`mcap-${captionKey}`} className="caption-main" style={{ fontSize: 20 }}>{MEDIA[idx].caption}</h2>
            </div>
          </div>

          {/* ═══════════ FORMULAIRE LOGIN ═══════════ */}
          <div className="form-side">
            <div className="form-inner">

              {/* Logo */}
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 18 }}>
                  <div className="logo-box">
                    <i className="fas fa-cloud" />
                  </div>
                  <div className="logo-ring ring-1" />
                  <div className="logo-ring ring-2" />
                </div>
                <h1 className="logo-title">CloudVault</h1>
                <p className="logo-sub">✨ Ton espace, rien qu'à toi</p>
              </div>

              {/* Features */}
              <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {FEATURES.map((f, i) => (
                    <div key={i} className="feature-row" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                      <div className="feature-icon">
                        <i className={`fas ${f.icon}`} />
                      </div>
                      <div>
                        <p className="feature-label">{f.label}</p>
                        <p className="feature-desc">{f.desc}</p>
                      </div>
                    </div>
                ))}
              </div>

              {/* Séparateur */}
              <div className="separator">
                <div className="sep-line" />
                <span className="sep-text">CONNEXION SÉCURISÉE</span>
                <div className="sep-line" />
              </div>

              {/* Bouton Google */}
              <button onClick={login} disabled={loginLoading} className="google-btn">
                {loginLoading ? (
                    <>
                      <div className="spinner" />
                      <span style={{ color: '#c4b5fd', fontSize: 14, fontWeight: 500 }}>Connexion...</span>
                    </>
                ) : (
                    <>
                      <img src="https://www.google.com/favicon.ico" alt="" width={18} height={18} style={{ borderRadius: 3 }} />
                      <span style={{ color: '#2e1a5e', fontSize: 14, fontWeight: 600 }}>Continuer avec Google</span>
                    </>
                )}
              </button>

              {/* Signature */}
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <p style={{ color: 'rgba(196,181,253,0.3)', fontSize: 11, lineHeight: 1.8 }}>
                  Espace privé · 25 Go · Stockage sécurisé<br />
                  <span style={{ color: 'rgba(196,181,253,0.2)' }}>Fait avec 💜 rien que pour toi</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CSS — tout centralisé ici
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&family=DM+Serif+Display:ital@0;1&display=swap');

/* ─ Transitions entrées ─ */
@keyframes tr-fade-in  { from{opacity:0}                                   to{opacity:1} }
@keyframes tr-slide-in { from{opacity:0;transform:translateX(80px)}        to{opacity:1;transform:translateX(0)} }
@keyframes tr-zoom-in  { from{opacity:0;transform:scale(1.15)}             to{opacity:1;transform:scale(1)} }
@keyframes tr-blur-in  { from{opacity:0;filter:blur(24px) brightness(1.4)} to{opacity:1;filter:blur(0) brightness(1)} }
@keyframes tr-wipe-in  { from{clip-path:inset(0 100% 0 0)}                 to{clip-path:inset(0 0% 0 0)} }

/* ─ Transitions sorties ─ */
@keyframes tr-fade-out  { from{opacity:1}                                    to{opacity:0} }
@keyframes tr-slide-out { from{opacity:1;transform:translateX(0)}            to{opacity:0;transform:translateX(-80px)} }
@keyframes tr-zoom-out  { from{opacity:1;transform:scale(1)}                 to{opacity:0;transform:scale(0.88)} }
@keyframes tr-blur-out  { from{opacity:1;filter:blur(0)}                     to{opacity:0;filter:blur(24px)} }
@keyframes tr-wipe-out  { from{clip-path:inset(0 0% 0 0)}                   to{clip-path:inset(0 0 0 100%)} }

.tr-fade-in  { animation: tr-fade-in  0.7s cubic-bezier(0.4,0,0.2,1) forwards; }
.tr-slide-in { animation: tr-slide-in 0.7s cubic-bezier(0.4,0,0.2,1) forwards; }
.tr-zoom-in  { animation: tr-zoom-in  0.7s cubic-bezier(0.4,0,0.2,1) forwards; }
.tr-blur-in  { animation: tr-blur-in  0.7s cubic-bezier(0.4,0,0.2,1) forwards; }
.tr-wipe-in  { animation: tr-wipe-in  0.7s cubic-bezier(0.4,0,0.2,1) forwards; }

.tr-fade-out  { animation: tr-fade-out  0.7s cubic-bezier(0.4,0,0.2,1) forwards; }
.tr-slide-out { animation: tr-slide-out 0.7s cubic-bezier(0.4,0,0.2,1) forwards; }
.tr-zoom-out  { animation: tr-zoom-out  0.7s cubic-bezier(0.4,0,0.2,1) forwards; }
.tr-blur-out  { animation: tr-blur-out  0.7s cubic-bezier(0.4,0,0.2,1) forwards; }
.tr-wipe-out  { animation: tr-wipe-out  0.7s cubic-bezier(0.4,0,0.2,1) forwards; }

/* ─ Déco ─ */
@keyframes kenBurns  { from{transform:scale(1) translate(0,0)} to{transform:scale(1.08) translate(-1%,-0.5%)} }
@keyframes captionUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes progFill  { from{width:0%} to{width:100%} }
@keyframes floatUp   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
@keyframes twinkle   { 0%,100%{opacity:0.15;transform:scale(0.8)} 50%{opacity:0.85;transform:scale(1.2)} }
@keyframes pulseD    { 0%,100%{transform:scale(0.9);opacity:0.6} 50%{transform:scale(1.1);opacity:1} }
@keyframes logoFloat { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-9px) rotate(1deg)} }
@keyframes ringPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.06)} }
@keyframes shimmer   { 0%{background-position:0% center} 100%{background-position:200% center} }
@keyframes fadeSlI   { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
@keyframes fadeSlL   { from{opacity:0;transform:translateX(18px)} to{opacity:1;transform:translateX(0)} }
@keyframes hintIn    { 0%{opacity:0} 20%{opacity:1} 80%{opacity:1} 100%{opacity:0} }
@keyframes spin      { to{transform:rotate(360deg)} }

/* ─ Layout ─ */
.carousel-side {
  position: relative;
  overflow: hidden;
  flex: 0 0 55%;
  min-height: 100vh;
}
.form-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 36px 40px;
  background: linear-gradient(135deg, rgba(139,92,246,0.04) 0%, transparent 60%);
  min-height: 100vh;
}
.form-inner {
  width: 100%;
  max-width: 340px;
}

/* ─ Overlay cinéma ─ */
.cinema-overlay {
  position: absolute; inset: 0; z-index: 4; pointer-events: none;
  background:
    linear-gradient(to right, transparent 50%, rgba(13,10,30,0.88) 100%),
    linear-gradient(to bottom, rgba(13,10,30,0.45) 0%, transparent 22%, transparent 65%, rgba(13,10,30,0.92) 100%);
}
.cinema-band {
  position: absolute; left: 0; right: 0; z-index: 5; pointer-events: none;
  background: rgba(13,10,30,0.55); backdrop-filter: blur(3px);
}
.cinema-band-top { top:0; height:56px; }
.cinema-band-bot { bottom:0; height:76px; }

/* ─ Orbes ─ */
.orb { position: absolute; border-radius: 50%; pointer-events: none; z-index: 0; }
.orb-tr { top:-20%; right:-15%; width:580px; height:580px; background:radial-gradient(circle,rgba(139,92,246,0.14) 0%,transparent 70%); }
.orb-bl { bottom:-15%; left:-10%; width:380px; height:380px; background:radial-gradient(circle,rgba(196,181,253,0.09) 0%,transparent 70%); }

/* ─ Badge glass ─ */
.glass-badge {
  display: flex; align-items: center; gap: 7px;
  background: rgba(139,92,246,0.22);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(196,181,253,0.22);
  border-radius: 20px; padding: 5px 12px;
  color: #e9d5ff; font-size: 11px; font-weight: 500;
}
.live-badge { background: rgba(0,0,0,0.45); border-color: rgba(255,255,255,0.12); }
.dot-pulse  { width:6px; height:6px; border-radius:50%; background:#c4b5fd; animation:pulseD 2s ease-in-out infinite; }
.live-dot   { background:#f87171; animation-duration:1s; }

/* ─ Slide buttons ─ */
.slide-btn {
  width:27px; height:27px; border-radius:7px;
  border:1px solid rgba(255,255,255,0.18);
  background:rgba(0,0,0,0.3); backdrop-filter:blur(8px);
  color:rgba(255,255,255,0.45); cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  transition:all 0.2s;
}
.slide-btn-active {
  border-color:rgba(196,181,253,0.8);
  background:rgba(139,92,246,0.42);
  color:#e9d5ff;
}

/* ─ Caption ─ */
.caption-sub  { color:rgba(196,181,253,0.7); font-size:10px; letter-spacing:0.14em; text-transform:uppercase; margin-bottom:4px; animation:captionUp 0.55s ease 0.2s both; }
.caption-main { color:#fff; font-size:21px; font-family:'DM Serif Display',serif; font-style:italic; font-weight:400; text-shadow:0 2px 18px rgba(0,0,0,0.55); animation:captionUp 0.55s ease 0.35s both; margin:0; }

/* ─ Progress bar ─ */
.progress-bar-row {
  position:absolute; bottom:0; left:0; right:0; height:2px;
  z-index:10; display:flex; gap:2px; padding:0 2px;
}
.progress-track { flex:1; background:rgba(255,255,255,0.13); overflow:hidden; border-radius:1px; }
.progress-fill  { height:100%; background:linear-gradient(to right,#c4b5fd,#8b5cf6); animation:progFill linear forwards; border-radius:1px; }
.progress-done  { height:100%; background:rgba(196,181,253,0.55); }

/* ─ Floating cards ─ */
.floating-cards-wrap {
  position:absolute; top:50%; right:0;
  transform:translateY(-50%);
  z-index:10; display:flex; flex-direction:column; gap:8px; padding:0 10px;
}
.floating-card {
  display:flex; align-items:center; gap:8px;
  background:rgba(18,12,46,0.72); backdrop-filter:blur(16px);
  border:1px solid rgba(196,181,253,0.14); border-radius:12px;
  padding:8px 12px; min-width:148px;
  animation:fadeSlL 0.6s ease both;
  transition:transform 0.2s,border-color 0.2s;
  color:#e9d5ff; font-size:11px; font-weight:500;
}
.floating-card:hover { transform:translateX(-4px); border-color:rgba(196,181,253,0.3); }
.floating-card-icon  { width:26px; height:26px; border-radius:7px; background:rgba(139,92,246,0.3); display:flex; align-items:center; justify-content:center; color:#c4b5fd; font-size:12px; flex-shrink:0; }

/* ─ Swipe hint ─ */
.swipe-hint {
  position:absolute; bottom:88px; left:50%; transform:translateX(-50%);
  z-index:10; display:flex; flex-direction:column; align-items:center; gap:5px;
  animation:hintIn 3s ease both;
  color:rgba(255,255,255,0.4); font-size:11px;
}
.swipe-hint p { margin:0; font-size:10px; letter-spacing:0.1em; }

/* ─ Dots (mobile) ─ */
.dots-row { display:none; justify-content:center; gap:6px; position:absolute; bottom:44%; left:0; right:0; z-index:10; margin-bottom:8px; }
.dot { width:6px; height:6px; border-radius:3px; background:rgba(255,255,255,0.25); border:none; cursor:pointer; padding:0; transition:all 0.3s; }
.dot-active { width:22px; background:rgba(196,181,253,0.9); }

/* ─ Caption mobile ─ */
.mobile-caption { display:none; position:absolute; bottom:calc(44% - 52px); left:20px; z-index:10; }

/* ─ Logo ─ */
.logo-box {
  width:68px; height:68px; border-radius:21px; margin:0 auto;
  background:linear-gradient(135deg,rgba(139,92,246,0.38),rgba(196,181,253,0.16));
  border:1px solid rgba(196,181,253,0.24); backdrop-filter:blur(8px);
  display:flex; align-items:center; justify-content:center;
  color:#c4b5fd; font-size:29px;
  box-shadow:0 8px 32px rgba(139,92,246,0.28);
  animation:logoFloat 4s ease-in-out infinite;
}
.logo-ring {
  position:absolute; border:1px solid rgba(196,181,253,0.1);
  animation:ringPulse 3s ease-in-out infinite;
}
.ring-1 { inset:-9px; border-radius:30px; }
.ring-2 { inset:-17px; border-radius:36px; animation-delay:0.5s; border-color:rgba(196,181,253,0.05); }
.logo-title {
  font-family:'DM Serif Display',serif; font-size:33px; font-weight:400; font-style:italic;
  margin-bottom:5px; line-height:1.1;
  background:linear-gradient(135deg,#f5f0ff,#c4b5fd,#8b5cf6);
  background-size:200% auto;
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  animation:shimmer 5s linear infinite;
}
.logo-sub { color:rgba(196,181,253,0.72); font-size:13px; font-weight:300; letter-spacing:0.03em; margin:0; }

/* ─ Features ─ */
.feature-row {
  display:flex; align-items:center; gap:11px;
  animation:fadeSlI 0.5s ease both;
  transition:transform 0.2s;
}
.feature-row:hover { transform:translateX(4px); }
.feature-icon {
  width:35px; height:35px; border-radius:10px; flex-shrink:0;
  background:rgba(139,92,246,0.16); border:1px solid rgba(196,181,253,0.14);
  display:flex; align-items:center; justify-content:center; color:#c4b5fd; font-size:14px;
}
.feature-label { color:#e9d5ff; font-size:12px; font-weight:500; margin:0 0 1px; }
.feature-desc  { color:rgba(196,181,253,0.48); font-size:11px; margin:0; }

/* ─ Séparateur ─ */
.separator { display:flex; align-items:center; gap:10px; margin-bottom:18px; }
.sep-line  { flex:1; height:0.5px; background:rgba(196,181,253,0.1); }
.sep-text  { color:rgba(196,181,253,0.32); font-size:10px; letter-spacing:0.1em; }

/* ─ Bouton Google ─ */
.google-btn {
  width:100%; padding:14px 20px;
  background:rgba(255,255,255,0.95);
  border:1px solid rgba(196,181,253,0.18); border-radius:14px;
  cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px;
  box-shadow:0 4px 22px rgba(139,92,246,0.18);
  transition:all 0.28s cubic-bezier(0.4,0,0.2,1);
}
.google-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 36px rgba(139,92,246,0.32); }
.google-btn:active:not(:disabled){ transform:scale(0.98); }
.google-btn:disabled { background:rgba(139,92,246,0.18); cursor:default; }

/* ─ Spinner ─ */
.spinner {
  width:20px; height:20px;
  border:2px solid rgba(139,92,246,0.25);
  border-top-color:#8b5cf6; border-radius:50%;
  animation:spin 0.8s linear infinite;
}

/* ════════════════════════
   RESPONSIVE
════════════════════════ */

/* Tablette paysage 900–1200px */
@media (max-width:1100px) {
  .carousel-side { flex: 0 0 50%; }
  .form-side { padding:28px 28px; }
  .floating-cards-wrap { display:none; }
}

/* Tablette portrait 600–768px */
@media (max-width:900px) {
  .carousel-side { flex: 0 0 48%; }
  .form-side { padding:24px 20px; }
  .form-inner { max-width:100%; }
  .floating-cards-wrap { display:none; }
  .logo-box { width:56px; height:56px; font-size:24px; }
  .logo-title { font-size:27px; }
}

/* Mobile < 650px — plein écran superposé */
@media (max-width:650px) {
  .carousel-side {
    position:fixed; inset:0;
    flex: none; width:100%; height:100%;
  }
  .form-side {
    position:fixed; bottom:0; left:0; right:0;
    min-height:auto; height:auto;
    padding:20px 20px 36px;
    background:transparent;
    align-items:flex-end;
    z-index:20;
  }
  .form-inner { max-width:100%; }

  /* Overlay fort en bas pour lire le form */
  .form-side::before {
    content:'';
    position:absolute; inset:0;
    background:linear-gradient(to bottom, transparent 0%, rgba(13,10,30,0.96) 35%, rgba(13,10,30,1) 100%);
    z-index:-1;
  }

  /* Cache éléments desktop dans le carrousel */
  .cinema-overlay {
    background:linear-gradient(to bottom,rgba(13,10,30,0.45) 0%,transparent 25%,transparent 35%,rgba(13,10,30,0.96) 70%,rgba(13,10,30,1) 100%);
  }
  .cinema-band-bot { display:none; }
  .floating-cards-wrap { display:none; }

  /* Affiche dots + caption mobile */
  .dots-row { display:flex; }
  .mobile-caption { display:block; }

  /* Cache caption desktop */
  .carousel-side > div:nth-child(7) { display:none; }

  /* Compact form */
  .logo-box { width:40px; height:40px; font-size:18px; border-radius:12px; animation:none; }
  .ring-1,.ring-2 { display:none; }
  .logo-title { font-size:22px; }
  .logo-sub { font-size:12px; }
  .feature-row { gap:9px; }
  .feature-icon { width:30px; height:30px; font-size:12px; }
  .feature-label { font-size:11px; }
  .feature-desc { font-size:10px; }
  .google-btn { padding:13px 16px; border-radius:13px; }
  .separator { margin-bottom:14px; }

  /* Slide buttons cachés sur mobile */
  .slide-btn { width:22px; height:22px; }
}

/* Très petit écran < 380px */
@media (max-width:380px) {
  .form-side { padding:16px 16px 32px; }
  .logo-title { font-size:20px; }
  .google-btn { padding:12px 14px; }
  .feature-row { gap:8px; }
}
`