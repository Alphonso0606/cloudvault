import { useState } from 'react'
import { BOARD_COVERS } from '../hooks/useBoards'

const EMOJIS = ['✨','🌸','💜','🌙','🎨','📸','💄','👗','🌿','✈️','🎬','💪','🍓','🦋','🌊','🔮']

export default function CreateBoardModal({ onClose, onCreate }) {
    const [name, setName]       = useState('')
    const [desc, setDesc]       = useState('')
    const [cover, setCover]     = useState(BOARD_COVERS[0].id)
    const [emoji, setEmoji]     = useState('✨')
    const [loading, setLoading] = useState(false)

    const create = async () => {
        if (!name.trim()) return
        setLoading(true)
        await onCreate({ name:name.trim(), description:desc, cover, emoji })
        setLoading(false)
    }

    return (
        <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'flex-end', zIndex:100, backdropFilter:'blur(4px)' }}>
            <div className="slide-up" style={{ background:'var(--bg2)', borderRadius:'20px 20px 0 0', padding:'18px 16px 36px', width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
                <div style={{ width:32, height:4, background:'var(--border2)', borderRadius:4, margin:'0 auto 16px' }} />
                <h2 style={{ fontSize:16, fontWeight:600, marginBottom:16, textAlign:'center' }}>✨ Nouveau moodboard</h2>

                {/* Preview */}
                <div style={{ height:80, borderRadius:'var(--r-lg)', marginBottom:16, background:BOARD_COVERS.find(c=>c.id===cover)?.style, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, transition:'background 0.3s' }}>
                    {emoji}
                </div>

                {/* Name */}
                <div style={{ marginBottom:12 }}>
                    <label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:5 }}>Nom</label>
                    <input value={name} onChange={e=>setName(e.target.value)} placeholder="ex: Inspo Outfit, TikTok Ideas..." autoFocus
                           style={{ width:'100%', padding:'9px 12px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', color:'var(--text)', fontSize:14, outline:'none' }} />
                </div>

                {/* Desc */}
                <div style={{ marginBottom:12 }}>
                    <label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:5 }}>Description (optionnel)</label>
                    <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Une courte description..."
                           style={{ width:'100%', padding:'9px 12px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', color:'var(--text)', fontSize:13, outline:'none' }} />
                </div>

                {/* Emojis */}
                <div style={{ marginBottom:12 }}>
                    <label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:7 }}>Emoji</label>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                        {EMOJIS.map(e => (
                            <button key={e} onClick={()=>setEmoji(e)} style={{ width:38, height:38, borderRadius:9, fontSize:18, background: emoji===e?'var(--accent-dim)':'var(--bg3)', border:`1.5px solid ${emoji===e?'var(--accent)':'var(--border)'}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{e}</button>
                        ))}
                    </div>
                </div>

                {/* Covers */}
                <div style={{ marginBottom:20 }}>
                    <label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:7 }}>Couleur de couverture</label>
                    <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
                        {BOARD_COVERS.map(c => (
                            <button key={c.id} onClick={()=>setCover(c.id)} title={c.label} style={{ width:34, height:34, borderRadius:9, cursor:'pointer', background:c.style, border:`2.5px solid ${cover===c.id?'var(--text)':'transparent'}`, transition:'border-color 0.15s' }} />
                        ))}
                    </div>
                </div>

                <button onClick={create} disabled={!name.trim()||loading} style={{ width:'100%', padding:13, background:'var(--accent)', border:'none', borderRadius:'var(--r-md)', color:'#fff', fontSize:14, fontWeight:600, opacity:!name.trim()?0.5:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                    {loading ? <i className="fas fa-spinner spin" /> : <><i className="fas fa-plus" />Créer le board</>}
                </button>
            </div>
        </div>
    )
}