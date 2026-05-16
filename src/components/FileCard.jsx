import { useState } from 'react'
import { formatSize, formatDate } from '../hooks/useFiles'

const TC = {
    pdf:     { icon:'fa-file-pdf',    bg:'rgba(248,113,113,0.12)', color:'#f87171' },
    image:   { icon:'fa-image',       bg:'rgba(96,165,250,0.12)',  color:'#60a5fa' },
    doc:     { icon:'fa-file-word',   bg:'rgba(34,211,160,0.12)',  color:'#22d3a0' },
    sheet:   { icon:'fa-file-excel',  bg:'rgba(74,222,128,0.12)',  color:'#4ade80' },
    video:   { icon:'fa-film',        bg:'rgba(244,114,182,0.12)', color:'#f472b6' },
    audio:   { icon:'fa-music',       bg:'rgba(167,139,250,0.12)', color:'#a78bfa' },
    archive: { icon:'fa-file-zipper', bg:'rgba(251,191,36,0.12)',  color:'#fbbf24' },
    other:   { icon:'fa-file',        bg:'rgba(148,163,184,0.12)', color:'#94a3b8' },
}

export default function FileCard({ file, index, onPreview, onDelete, onToggleFav, onUpdateTags, searchQuery }) {
    const [hover, setHover]             = useState(false)
    const [showMenu, setShowMenu]       = useState(false)
    const [editTags, setEditTags]       = useState(false)
    const [tagsInput, setTagsInput]     = useState((file.tags||[]).join(', '))
    const [confirmDel, setConfirmDel]   = useState(false)
    const [deleting, setDeleting]       = useState(false)
    const [copied, setCopied]           = useState(false)
    const cfg = TC[file.type] || TC.other

    const saveTags = () => { onUpdateTags(tagsInput.split(',').map(t=>t.trim()).filter(Boolean)); setEditTags(false) }
    const handleDel = async () => { setDeleting(true); await onDelete(); setDeleting(false) }
    const copyLink = () => { navigator.clipboard.writeText(file.url); setCopied(true); setTimeout(()=>setCopied(false),2000) }

    const hl = (text) => {
        if (!searchQuery || !text) return text
        const re = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi')
        return text.split(re).map((p,i) => re.test(p) ? <mark key={i} style={{ background:'rgba(34,211,160,0.25)', color:'var(--accent)', borderRadius:2 }}>{p}</mark> : p)
    }

    return (
        <div className="fade-in" style={{
            animationDelay:`${index*0.04}s`,
            background:'var(--bg2)', border:`1px solid ${hover ? 'var(--border2)' : 'var(--border)'}`,
            borderRadius:'var(--r-lg)', padding:12, cursor:'pointer',
            transition:'border-color 0.15s, transform 0.15s',
            transform: hover ? 'translateY(-2px)' : 'none',
            position:'relative', overflow:'hidden'
        }}
             onMouseEnter={() => setHover(true)}
             onMouseLeave={() => { setHover(false); setShowMenu(false) }}
        >
            {file.favorite && <div style={{ position:'absolute', top:0, left:0, width:3, height:'100%', background:'var(--warn)', borderRadius:'3px 0 0 3px' }} />}

            {copied && (
                <div style={{ position:'absolute', top:8, left:'50%', transform:'translateX(-50%)', background:'#22c55e', color:'#fff', fontSize:10, fontWeight:600, padding:'3px 10px', borderRadius:20, zIndex:30, whiteSpace:'nowrap' }}>
                    ✓ Lien copié
                </div>
            )}

            {/* Action buttons on hover */}
            <div style={{ position:'absolute', top:7, right:7, display:'flex', gap:3, opacity: hover ? 1 : 0, transition:'opacity 0.15s', zIndex:10 }}>
                <button onClick={e=>{e.stopPropagation();onToggleFav()}} style={{ width:24, height:24, border:'1px solid var(--border)', borderRadius:6, background:'var(--bg3)', color: file.favorite ? 'var(--warn)' : 'var(--text2)', fontSize:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <i className="fas fa-star" />
                </button>
                <button onClick={e=>{e.stopPropagation();setConfirmDel(true)}} style={{ width:24, height:24, border:'1px solid rgba(248,113,113,0.3)', borderRadius:6, background:'rgba(248,113,113,0.1)', color:'#f87171', fontSize:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <i className="fas fa-trash" />
                </button>
                <button onClick={e=>{e.stopPropagation();setShowMenu(v=>!v)}} style={{ width:24, height:24, border:'1px solid var(--border)', borderRadius:6, background:'var(--bg3)', color:'var(--text2)', fontSize:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <i className="fas fa-ellipsis-vertical" />
                </button>
            </div>

            {/* Context menu */}
            {showMenu && (
                <div onClick={e=>e.stopPropagation()} style={{ position:'absolute', top:34, right:7, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:5, zIndex:20, boxShadow:'var(--shadow)', minWidth:150 }}>
                    {[
                        { icon:'fa-eye',      label:'Prévisualiser', fn:()=>{onPreview();setShowMenu(false)} },
                        { icon:'fa-download', label:'Télécharger',   fn:()=>{window.open(file.url,'_blank');setShowMenu(false)} },
                        { icon:'fa-copy',     label:'Copier lien',   fn:()=>{copyLink();setShowMenu(false)} },
                        { icon:'fa-tags',     label:'Tags',          fn:()=>{setEditTags(true);setShowMenu(false)} },
                        { icon:'fa-trash',    label:'Supprimer',     fn:()=>{setConfirmDel(true);setShowMenu(false)}, color:'#f87171' },
                    ].map(item => (
                        <button key={item.label} onClick={item.fn} style={{ display:'flex', alignItems:'center', gap:7, width:'100%', padding:'6px 9px', border:'none', borderRadius:7, background:'transparent', color:item.color||'var(--text2)', fontSize:12, textAlign:'left' }}>
                            <i className={`fas ${item.icon}`} style={{ fontSize:11, width:12 }} />{item.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Confirm delete overlay */}
            {confirmDel && (
                <div onClick={e=>e.stopPropagation()} style={{ position:'absolute', inset:0, zIndex:20, background:'rgba(15,17,23,0.95)', borderRadius:'var(--r-lg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, padding:14, textAlign:'center' }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(248,113,113,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <i className="fas fa-trash" style={{ color:'#f87171', fontSize:14 }} />
                    </div>
                    <p style={{ fontSize:11, color:'var(--text2)', lineHeight:1.4 }}>Supprimer<br /><strong style={{ color:'var(--text)' }}>{file.name.length>18?file.name.slice(0,18)+'...':file.name}</strong> ?</p>
                    <div style={{ display:'flex', gap:5, width:'100%' }}>
                        <button onClick={()=>setConfirmDel(false)} style={{ flex:1, padding:'6px 0', border:'1px solid var(--border)', borderRadius:7, background:'transparent', color:'var(--text2)', fontSize:11 }}>Annuler</button>
                        <button onClick={handleDel} disabled={deleting} style={{ flex:1, padding:'6px 0', border:'none', borderRadius:7, background:'#f87171', color:'#fff', fontSize:11, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:3 }}>
                            {deleting ? <i className="fas fa-spinner spin" /> : <><i className="fas fa-trash" />Oui</>}
                        </button>
                    </div>
                </div>
            )}

            {/* File icon */}
            <div onClick={onPreview} style={{ width:40, height:40, borderRadius:10, background:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:8, color:cfg.color, fontSize:18 }}>
                <i className={`fas ${cfg.icon}`} />
            </div>

            {/* AI badge */}
            {file.summary && (
                <div style={{ display:'inline-flex', alignItems:'center', gap:3, background:'rgba(167,139,250,0.1)', border:'1px solid rgba(167,139,250,0.2)', borderRadius:20, padding:'1px 5px', fontSize:9, color:'#a78bfa', marginBottom:3 }}>
                    <i className="fas fa-robot" style={{ fontSize:9 }} /> IA
                </div>
            )}

            {/* Name */}
            <div onClick={onPreview} style={{ fontSize:12, fontWeight:500, lineHeight:1.3, marginBottom:3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                {hl(file.name)}
            </div>

            {/* Summary */}
            {file.summary && (
                <div style={{ fontSize:10, color:'var(--text2)', marginBottom:4, lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {hl(file.summary)}
                </div>
            )}

            {/* Meta */}
            <div style={{ fontSize:10, color:'var(--text3)', marginBottom:6 }}>
                {formatSize(file.size)} · {formatDate(file.createdAt)}
            </div>

            {/* Tags */}
            {editTags ? (
                <div onClick={e=>e.stopPropagation()} style={{ display:'flex', gap:3 }}>
                    <input autoFocus value={tagsInput} onChange={e=>setTagsInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveTags()} placeholder="tag1, tag2"
                           style={{ flex:1, padding:'3px 6px', fontSize:10, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:5, color:'var(--text)', outline:'none' }} />
                    <button onClick={saveTags} style={{ padding:'3px 7px', background:'var(--accent)', border:'none', borderRadius:5, color:'#fff', fontSize:10, fontWeight:600 }}>OK</button>
                </div>
            ) : (
                <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
                    {(file.tags||[]).slice(0,2).map(t => (
                        <span key={t} style={{ padding:'1px 5px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:20, fontSize:9, color:'var(--text2)' }}>#{t}</span>
                    ))}
                    {(file.aiTags||[]).slice(0,2).map(t => (
                        <span key={t} style={{ padding:'1px 5px', background:'rgba(167,139,250,0.08)', border:'1px solid rgba(167,139,250,0.2)', borderRadius:20, fontSize:9, color:'#a78bfa' }}>✦{t}</span>
                    ))}
                </div>
            )}
        </div>
    )
}