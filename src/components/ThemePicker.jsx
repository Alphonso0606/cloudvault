import { THEMES } from '../hooks/useTheme'

export default function ThemePicker({ currentTheme, onSelect, onClose }) {
    return (
        <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'flex-end', zIndex:200, backdropFilter:'blur(4px)' }}>
            <div className="slide-up" style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'20px 20px 0 0', padding:'18px 16px 36px', width:'100%' }}>
                <div style={{ width:32, height:4, background:'var(--border2)', borderRadius:4, margin:'0 auto 16px' }} />
                <h2 style={{ fontSize:16, fontWeight:600, marginBottom:4, textAlign:'center' }}>🎨 Choisir un thème</h2>
                <p style={{ fontSize:12, color:'var(--text2)', textAlign:'center', marginBottom:20 }}>Personnalise ton espace</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
                    {THEMES.map(t => (
                        <button key={t.id} onClick={()=>{onSelect(t.id);onClose()}} style={{ padding:'14px 10px', background: currentTheme===t.id?'var(--accent-dim)':'var(--bg3)', border:`2px solid ${currentTheme===t.id?'var(--accent)':'var(--border)'}`, borderRadius:'var(--r-lg)', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:7, transition:'all 0.15s' }}>
                            <div style={{ width:44, height:44, borderRadius:12, background:t.preview, border:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{t.emoji}</div>
                            <span style={{ fontSize:12, fontWeight:500, color: currentTheme===t.id?'var(--accent)':'var(--text)' }}>{t.label}</span>
                            {currentTheme===t.id && <div style={{ width:18, height:18, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff' }}><i className="fas fa-check" /></div>}
                        </button>
                    ))}
                </div>
                <button onClick={onClose} style={{ width:'100%', padding:11, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', color:'var(--text2)', fontSize:13, cursor:'pointer' }}>Fermer</button>
            </div>
        </div>
    )
}