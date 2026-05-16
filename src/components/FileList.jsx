import { useState } from 'react'
import { formatSize, formatDate } from '../hooks/useFiles'

const TC = {
    pdf:     { icon:'fa-file-pdf',    color:'#f87171' },
    image:   { icon:'fa-image',       color:'#60a5fa' },
    doc:     { icon:'fa-file-word',   color:'#22d3a0' },
    sheet:   { icon:'fa-file-excel',  color:'#4ade80' },
    video:   { icon:'fa-film',        color:'#f472b6' },
    audio:   { icon:'fa-music',       color:'#a78bfa' },
    archive: { icon:'fa-file-zipper', color:'#fbbf24' },
    other:   { icon:'fa-file',        color:'#94a3b8' },
}

export default function FileList({ file, index, onPreview, onDelete, onToggleFav, searchQuery }) {
    const [hover, setHover]           = useState(false)
    const [confirmDel, setConfirmDel] = useState(false)
    const [deleting, setDeleting]     = useState(false)
    const cfg = TC[file.type] || TC.other

    const handleDel = async () => { setDeleting(true); await onDelete(); setDeleting(false) }

    return (
        <div className="fade-in" style={{
            animationDelay:`${index*0.03}s`,
            display:'flex', alignItems:'center', gap:10,
            background: hover ? 'var(--bg3)' : 'var(--bg2)',
            border:`1px solid ${confirmDel ? 'rgba(248,113,113,0.3)' : hover ? 'var(--border2)' : 'var(--border)'}`,
            borderRadius:'var(--r-md)', padding:'9px 12px',
            cursor:'pointer', transition:'all 0.15s', position:'relative'
        }}
             onMouseEnter={() => setHover(true)}
             onMouseLeave={() => setHover(false)}
        >
            <div onClick={onPreview} style={{ color:cfg.color, fontSize:17, width:18, flexShrink:0 }}>
                <i className={`fas ${cfg.icon}`} />
            </div>

            <div onClick={onPreview} style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{file.name}</div>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:1, flexWrap:'wrap' }}>
                    <span style={{ fontSize:10, color:'var(--text3)' }}>{formatSize(file.size)}</span>
                    <span style={{ color:'var(--border)', fontSize:10 }}>·</span>
                    <span style={{ fontSize:10, color:'var(--text3)' }}>{formatDate(file.createdAt)}</span>
                    {(file.tags||[]).slice(0,2).map(t => (
                        <span key={t} style={{ padding:'1px 5px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:20, fontSize:9, color:'var(--text2)' }}>#{t}</span>
                    ))}
                </div>
            </div>

            {confirmDel ? (
                <div style={{ display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
                    <span style={{ fontSize:11, color:'#f87171' }}>Supprimer ?</span>
                    <button onClick={e=>{e.stopPropagation();setConfirmDel(false)}} style={{ padding:'3px 8px', border:'1px solid var(--border)', borderRadius:6, background:'transparent', color:'var(--text2)', fontSize:11, cursor:'pointer' }}>Non</button>
                    <button onClick={e=>{e.stopPropagation();handleDel()}} disabled={deleting} style={{ padding:'3px 8px', border:'none', borderRadius:6, background:'#f87171', color:'#fff', fontSize:11, cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', gap:3 }}>
                        {deleting ? <i className="fas fa-spinner spin" /> : <><i className="fas fa-trash" />Oui</>}
                    </button>
                </div>
            ) : (
                <div style={{ display:'flex', gap:3, opacity: hover ? 1 : 0.2, transition:'opacity 0.15s', flexShrink:0 }}>
                    {[
                        { icon:'fa-eye',      fn: onPreview },
                        { icon:'fa-download', fn: ()=>window.open(file.url,'_blank') },
                        { icon:'fa-star',     fn: onToggleFav, color: file.favorite ? 'var(--warn)' : undefined },
                        { icon:'fa-trash',    fn: ()=>setConfirmDel(true), color:'#f87171' },
                    ].map(btn => (
                        <button key={btn.icon} onClick={e=>{e.stopPropagation();btn.fn()}} style={{ width:26, height:26, border:'1px solid var(--border)', borderRadius:6, background:'transparent', color:btn.color||'var(--text2)', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <i className={`fas ${btn.icon}`} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}