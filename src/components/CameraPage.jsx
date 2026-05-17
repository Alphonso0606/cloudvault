import { useState, useRef, useEffect, useCallback } from 'react'
import { useFiles } from '../hooks/useFiles'
import { useAuth } from '../hooks/useAuth'

// ── Filtres CSS appliqués via Canvas ──
const FILTERS = [
    { id: 'natural',    label: 'Naturel',      css: 'none',                                                              preview: '#f5f0f0' },
    { id: 'velvet',     label: 'Velvet Rose',  css: 'saturate(1.3) hue-rotate(340deg) brightness(1.05) contrast(1.05)', preview: '#f0d5e0' },
    { id: 'golden',     label: 'Golden Hour',  css: 'sepia(0.4) saturate(1.5) brightness(1.1) contrast(0.95)',          preview: '#f0e0c0' },
    { id: 'cinema',     label: 'Cinéma',       css: 'contrast(1.2) saturate(0.75) brightness(0.95)',                    preview: '#d0d0d8' },
    { id: 'lavender',   label: 'Lavande',      css: 'hue-rotate(260deg) saturate(0.9) brightness(1.05)',                preview: '#e0d5f0' },
    { id: 'fade',       label: 'Fade',         css: 'saturate(0.6) brightness(1.15) contrast(0.85)',                    preview: '#e8e5e0' },
    { id: 'vivid',      label: 'Vivid',        css: 'saturate(1.8) contrast(1.1) brightness(1.05)',                     preview: '#f0a0c0' },
    { id: 'noir',       label: 'Noir',         css: 'grayscale(1) contrast(1.15) brightness(0.95)',                     preview: '#808080' },
    { id: 'dreamy',     label: 'Dreamy',       css: 'brightness(1.1) saturate(0.85) hue-rotate(20deg) contrast(0.9)',   preview: '#d8e8f0' },
    { id: 'warm',       label: 'Warm',         css: 'sepia(0.25) saturate(1.2) brightness(1.05)',                       preview: '#f0e8d0' },
]

const MODES = ['Photo', 'Vidéo', 'Portrait', 'Slow-mo']
const RATIOS = [
    { id: 'free',  label: 'Libre',     aspect: null  },
    { id: 'sq',    label: '1:1',       aspect: 1     },
    { id: 'insta', label: '4:5 Insta', aspect: 4/5   },
    { id: 'tiktok',label: '9:16 TikTok',aspect: 9/16 },
    { id: 'wide',  label: '16:9',      aspect: 16/9  },
]

const BEAUTY_PRESETS = [
    { key: 'smooth',     label: 'Lissage',   min: 0, max: 10, default: 0 },
    { key: 'brightness', label: 'Luminosité',min: 0, max: 10, default: 5 },
    { key: 'contrast',   label: 'Contraste', min: 0, max: 10, default: 5 },
]

export default function CameraPage({ onClose }) {
    const { user }                        = useAuth()
    const { uploadFile }                  = useFiles(user?.uid)

    const videoRef     = useRef(null)
    const canvasRef    = useRef(null)
    const streamRef    = useRef(null)
    const recorderRef  = useRef(null)
    const chunksRef    = useRef([])
    const animRef      = useRef(null)

    const [ready, setReady]             = useState(false)
    const [error, setError]             = useState(null)
    const [facingMode, setFacingMode]   = useState('user')
    const [filter, setFilter]           = useState(FILTERS[0])
    const [mode, setMode]               = useState('Photo')
    const [ratio, setRatio]             = useState(RATIOS[0])
    const [recording, setRecording]     = useState(false)
    const [recSeconds, setRecSeconds]   = useState(0)
    const [beauty, setBeauty]           = useState({ smooth: 0, brightness: 5, contrast: 5 })
    const [showBeauty, setShowBeauty]   = useState(false)
    const [showRatio, setShowRatio]     = useState(false)
    const [showGrid, setShowGrid]       = useState(true)
    const [flash, setFlash]             = useState(false)
    const [captured, setCaptured]       = useState(null) // preview after shot
    const [uploading, setUploading]     = useState(false)
    const [uploadDone, setUploadDone]   = useState(false)
    const [zoom, setZoom]               = useState(1)
    const [aiTag, setAiTag]             = useState('')
    const [recTimer, setRecTimer]       = useState(null)

    // ── Démarrage caméra ──
    const startCamera = useCallback(async () => {
        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop())
            }
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
                audio: mode === 'Vidéo' || mode === 'Slow-mo'
            })
            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                videoRef.current.play()
                setReady(true)
                setError(null)
                detectScene()
            }
        } catch (e) {
            setError('Caméra non disponible sur cet appareil ou permission refusée.')
        }
    }, [facingMode, mode])

    useEffect(() => {
        startCamera()
        return () => {
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
            if (animRef.current) cancelAnimationFrame(animRef.current)
        }
    }, [startCamera])

    // ── Détection scène IA (simulation) ──
    const detectScene = () => {
        const scenes = ['Portrait détecté ✨', 'Paysage — grand angle suggéré', 'Bonne lumière', 'Mode nuit suggéré', 'Composition idéale']
        setAiTag(scenes[Math.floor(Math.random() * scenes.length)])
    }

    // ── Rendu canvas avec filtre ──
    const drawFrame = useCallback(() => {
        const video  = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas || video.readyState < 2) {
            animRef.current = requestAnimationFrame(drawFrame)
            return
        }
        const ctx = canvas.getContext('2d')
        canvas.width  = video.videoWidth  || 640
        canvas.height = video.videoHeight || 480

        // Applique le filtre CSS via canvas filter
        ctx.filter = filter.css === 'none' ? 'none' : filter.css

        // Beauty adjustments
        const bright = 0.8 + (beauty.brightness / 10) * 0.4
        const cont   = 0.8 + (beauty.contrast   / 10) * 0.4
        if (ctx.filter === 'none') {
            ctx.filter = `brightness(${bright}) contrast(${cont})`
        } else {
            ctx.filter += ` brightness(${bright}) contrast(${cont})`
        }

        ctx.save()
        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0)
            ctx.scale(-1, 1)
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        ctx.restore()

        // Bandes cinéma si mode vidéo
        if (mode === 'Vidéo') {
            const bh = canvas.height * 0.06
            ctx.filter = 'none'
            ctx.fillStyle = 'rgba(0,0,0,0.85)'
            ctx.fillRect(0, 0, canvas.width, bh)
            ctx.fillRect(0, canvas.height - bh, canvas.width, bh)
        }

        animRef.current = requestAnimationFrame(drawFrame)
    }, [filter, beauty, facingMode, mode])

    useEffect(() => {
        if (ready) {
            if (animRef.current) cancelAnimationFrame(animRef.current)
            animRef.current = requestAnimationFrame(drawFrame)
        }
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
    }, [ready, drawFrame])

    // ── Prise de photo ──
    const takePhoto = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        setFlash(true)
        setTimeout(() => setFlash(false), 180)

        canvas.toBlob(blob => {
            if (!blob) return
            const url = URL.createObjectURL(blob)
            setCaptured({ url, blob, type: 'image' })
        }, 'image/jpeg', 0.92)
    }, [])

    // ── Enregistrement vidéo ──
    const startRec = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        chunksRef.current = []
        const stream = canvas.captureStream(30)

        // Ajoute l'audio si disponible
        const audioTracks = streamRef.current?.getAudioTracks() || []
        audioTracks.forEach(t => stream.addTrack(t))

        const rec = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' })
        rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
        rec.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' })
            const url  = URL.createObjectURL(blob)
            setCaptured({ url, blob, type: 'video' })
        }
        recorderRef.current = rec
        rec.start(100)
        setRecording(true)
        setRecSeconds(0)

        const t = setInterval(() => setRecSeconds(s => s + 1), 1000)
        setRecTimer(t)
    }, [])

    const stopRec = useCallback(() => {
        recorderRef.current?.stop()
        clearInterval(recTimer)
        setRecording(false)
    }, [recTimer])

    const handleShutter = () => {
        if (mode === 'Photo' || mode === 'Portrait') return takePhoto()
        if (mode === 'Vidéo' || mode === 'Slow-mo') {
            return recording ? stopRec() : startRec()
        }
    }

    // ── Upload vers CloudVault ──
    const saveToVault = async () => {
        if (!captured) return
        setUploading(true)
        const ext  = captured.type === 'video' ? 'webm' : 'jpg'
        const name = `capture_${Date.now()}.${ext}`
        const file = new File([captured.blob], name, { type: captured.blob.type })
        await uploadFile(file, ['camera', 'cloudvault-cam'], '', () => {})
        setUploading(false)
        setUploadDone(true)
        setTimeout(() => { setUploadDone(false); setCaptured(null) }, 1800)
    }

    const formatSec = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

    return (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 200, display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
        @keyframes flashAnim { 0%{opacity:0.9} 100%{opacity:0} }
        @keyframes recPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes zoomIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
        .cam-btn { background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#fff; transition:all 0.15s; }
        .cam-btn:hover { background:rgba(255,255,255,0.22); }
        .filter-item { display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer; flex-shrink:0; }
        .filter-dot { width:44px; height:44px; border-radius:50%; border:2.5px solid transparent; transition:all 0.2s; }
        .filter-dot.active { border-color:#fff; transform:scale(1.1); }
        .filter-name { font-size:10px; color:rgba(255,255,255,0.7); }
        .panel { background:rgba(15,10,35,0.92); backdrop-filter:blur(12px); border-radius:16px 16px 0 0; padding:16px; animation:slideUp 0.25s ease both; }
        .beauty-row { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
        .beauty-label { font-size:12px; color:rgba(255,255,255,0.7); width:72px; }
        .beauty-slider { flex:1; height:4px; border-radius:2px; cursor:pointer; accent-color:#c4b5fd; }
        .beauty-val { font-size:12px; color:#c4b5fd; width:20px; text-align:right; }
      `}</style>

            {/* ── Viewfinder ── */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

                {/* Canvas (rendu principal) */}
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'cover', display: ready ? 'block' : 'none' }} />
                <video ref={videoRef} style={{ display: 'none' }} muted playsInline />

                {/* Placeholder si pas prêt */}
                {!ready && !error && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                        <div style={{ width: 32, height: 32, border: '2px solid rgba(196,181,253,0.4)', borderTopColor: '#c4b5fd', borderRadius: '50%', animation: 'recPulse 1s linear infinite' }} />
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Ouverture de la caméra...</span>
                    </div>
                )}
                {error && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
                        <div>
                            <i className="fas fa-camera-slash" style={{ fontSize: 40, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 12 }} />
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 20 }}>{error}</p>
                            <button onClick={onClose} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, color: '#fff', cursor: 'pointer', fontSize: 14 }}>
                                Fermer
                            </button>
                        </div>
                    </div>
                )}

                {/* Flash blanc */}
                {flash && <div style={{ position: 'absolute', inset: 0, background: '#fff', animation: 'flashAnim 0.18s ease forwards', zIndex: 10, pointerEvents: 'none' }} />}

                {/* Overlay ratio */}
                {ratio.aspect && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 3 }}>
                        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)' }} />
                        <div style={{
                            position: 'absolute',
                            width: ratio.aspect >= 1 ? '100%' : `${(ratio.aspect) * 100}vh`,
                            paddingBottom: ratio.aspect >= 1 ? `${(1/ratio.aspect)*100}%` : '100%',
                            outline: '2px solid rgba(255,255,255,0.3)',
                            zIndex: 2,
                        }} />
                    </div>
                )}

                {/* Grille de composition */}
                {showGrid && ready && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr 1fr' }}>
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} style={{ border: '0.4px solid rgba(255,255,255,0.14)' }} />
                        ))}
                    </div>
                )}

                {/* Badge IA */}
                {aiTag && ready && (
                    <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 5, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(196,181,253,0.3)', borderRadius: 20, padding: '4px 14px', color: 'rgba(196,181,253,0.9)', fontSize: 11, whiteSpace: 'nowrap' }}>
                        <i className="fas fa-robot" style={{ marginRight: 5, fontSize: 10 }} />
                        {aiTag}
                    </div>
                )}

                {/* Badge filtre actif */}
                {filter.id !== 'natural' && ready && (
                    <div style={{ position: 'absolute', top: 70, left: 16, zIndex: 5, background: 'rgba(139,92,246,0.6)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '4px 10px', color: '#e9d5ff', fontSize: 10, fontWeight: 500 }}>
                        {filter.label}
                    </div>
                )}

                {/* Timer enregistrement */}
                {recording && (
                    <div style={{ position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)', zIndex: 5, background: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#f87171', animation: 'recPulse 1s ease-in-out infinite' }} />
                        <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{formatSec(recSeconds)}</span>
                    </div>
                )}

                {/* Preview après capture */}
                {captured && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, animation: 'zoomIn 0.25s ease' }}>
                        {captured.type === 'image'
                            ? <img src={captured.url} alt="capture" style={{ maxWidth: '90%', maxHeight: '65vh', borderRadius: 12, objectFit: 'contain' }} />
                            : <video src={captured.url} controls style={{ maxWidth: '90%', maxHeight: '65vh', borderRadius: 12 }} />
                        }
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => setCaptured(null)} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, color: '#fff', fontSize: 13, cursor: 'pointer' }}>
                                <i className="fas fa-redo" style={{ marginRight: 6 }} />Reprendre
                            </button>
                            <button onClick={saveToVault} disabled={uploading || uploadDone} style={{ padding: '10px 22px', background: uploadDone ? '#22c55e' : 'rgba(139,92,246,0.8)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
                                {uploadDone
                                    ? <><i className="fas fa-check" /> Sauvegardé !</>
                                    : uploading
                                        ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'recPulse 0.8s linear infinite' }} />Sauvegarde...</>
                                        : <><i className="fas fa-cloud-arrow-up" /> Sauvegarder dans CloudVault</>
                                }
                            </button>
                        </div>
                    </div>
                )}

                {/* Top bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 6, padding: '48px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)' }}>
                    <button onClick={onClose} className="cam-btn" style={{ width: 36, height: 36, fontSize: 16 }} aria-label="Fermer">
                        <i className="fas fa-times" />
                    </button>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setShowGrid(v => !v)} className="cam-btn" style={{ width: 32, height: 32, fontSize: 13, opacity: showGrid ? 1 : 0.4 }} aria-label="Grille">
                            <i className="fas fa-th" />
                        </button>
                        <button onClick={() => setShowBeauty(v => !v)} className="cam-btn" style={{ width: 32, height: 32, fontSize: 13, opacity: showBeauty ? 1 : 0.5, borderColor: showBeauty ? 'rgba(196,181,253,0.7)' : undefined }} aria-label="Beauty">
                            <i className="fas fa-magic" />
                        </button>
                        <button onClick={() => setShowRatio(v => !v)} className="cam-btn" style={{ width: 32, height: 32, fontSize: 11, opacity: showRatio ? 1 : 0.5 }} aria-label="Ratio">
                            <span style={{ fontSize: 9, fontWeight: 600 }}>{ratio.label}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Panel beauty ── */}
            {showBeauty && (
                <div className="panel" style={{ position: 'absolute', bottom: 230, left: 0, right: 0, zIndex: 15 }}>
                    <p style={{ color: 'rgba(196,181,253,0.8)', fontSize: 12, fontWeight: 500, marginBottom: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        <i className="fas fa-magic" style={{ marginRight: 6 }} />Mode Beauty
                    </p>
                    {BEAUTY_PRESETS.map(p => (
                        <div key={p.key} className="beauty-row">
                            <span className="beauty-label">{p.label}</span>
                            <input type="range" min={p.min} max={p.max} value={beauty[p.key]} className="beauty-slider"
                                   onChange={e => setBeauty(b => ({ ...b, [p.key]: +e.target.value }))} />
                            <span className="beauty-val">{beauty[p.key]}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Panel ratio ── */}
            {showRatio && (
                <div className="panel" style={{ position: 'absolute', bottom: 230, left: 0, right: 0, zIndex: 15 }}>
                    <p style={{ color: 'rgba(196,181,253,0.8)', fontSize: 12, fontWeight: 500, marginBottom: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Format</p>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        {RATIOS.map(r => (
                            <button key={r.id} onClick={() => { setRatio(r); setShowRatio(false) }} style={{
                                padding: '8px 14px', background: ratio.id === r.id ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)',
                                border: `1px solid ${ratio.id === r.id ? 'rgba(196,181,253,0.6)' : 'rgba(255,255,255,0.15)'}`,
                                borderRadius: 10, color: ratio.id === r.id ? '#e9d5ff' : 'rgba(255,255,255,0.7)',
                                fontSize: 11, fontWeight: 500, cursor: 'pointer'
                            }}>{r.label}</button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Bottom controls ── */}
            <div style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', padding: '12px 16px 28px' }}>

                {/* Modes */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
                    {MODES.map(m => (
                        <button key={m} onClick={() => setMode(m)} style={{
                            padding: '5px 14px', background: 'transparent', border: 'none',
                            color: mode === m ? '#fff' : 'rgba(255,255,255,0.35)',
                            fontSize: 12, fontWeight: mode === m ? 600 : 400, cursor: 'pointer',
                            borderBottom: mode === m ? '2px solid #c4b5fd' : '2px solid transparent',
                            transition: 'all 0.15s'
                        }}>{m}</button>
                    ))}
                </div>

                {/* Filtres */}
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 14, paddingLeft: 4, marginBottom: 8 }}>
                    {FILTERS.map(f => (
                        <div key={f.id} className="filter-item" onClick={() => setFilter(f)}>
                            <div className={`filter-dot ${filter.id === f.id ? 'active' : ''}`} style={{ background: f.preview, filter: f.css !== 'none' ? f.css : 'none' }} />
                            <span className="filter-name" style={{ color: filter.id === f.id ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: filter.id === f.id ? 500 : 400 }}>{f.label}</span>
                        </div>
                    ))}
                </div>

                {/* Shutter row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 20, paddingRight: 20 }}>

                    {/* Retourner caméra */}
                    <button onClick={() => setFacingMode(f => f === 'user' ? 'environment' : 'user')} className="cam-btn" style={{ width: 44, height: 44, fontSize: 18 }} aria-label="Retourner caméra">
                        <i className="fas fa-sync-alt" />
                    </button>

                    {/* Déclencheur */}
                    <button onClick={handleShutter} aria-label="Déclencheur" style={{
                        width: 72, height: 72, borderRadius: '50%', cursor: 'pointer',
                        background: recording ? '#f87171' : 'transparent',
                        border: recording ? '3px solid rgba(248,113,113,0.4)' : '3px solid rgba(255,255,255,0.8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s', position: 'relative'
                    }}>
                        {mode === 'Vidéo' || mode === 'Slow-mo'
                            ? <div style={{ width: recording ? 24 : 44, height: recording ? 24 : 44, borderRadius: recording ? 4 : '50%', background: recording ? '#fff' : 'rgba(248,113,113,0.9)', transition: 'all 0.2s' }} />
                            : <div style={{ width: 58, height: 58, borderRadius: '50%', background: '#fff' }} />
                        }
                    </button>

                    {/* Zoom */}
                    <button onClick={() => setZoom(z => z === 1 ? 2 : z === 2 ? 3 : 1)} className="cam-btn" style={{ width: 44, height: 44, fontSize: 12, fontWeight: 600 }} aria-label="Zoom">
                        {zoom}x
                    </button>
                </div>
            </div>
        </div>
    )
}