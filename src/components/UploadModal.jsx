import { useState, useRef } from 'react'

const FOLDERS = ['Travail','Perso','Photos','Vidéos','Documents','Archives']
const STAGES = {
    upload:  { icon:'fa-cloud-arrow-up', label:'Upload...',         color:'#60a5fa' },
    extract: { icon:'fa-file-search',    label:'Extraction...',     color:'#22d3a0' },
    ai:      { icon:'fa-robot',          label:'Analyse IA...',     color:'#a78bfa' },
    save:    { icon:'fa-database',       label:'Sauvegarde...',     color:'#fbbf24' },
}

export default function UploadModal({ onClose, onUpload, folders=[] }) {
    const [files, setFiles]     = useState([])
    const [tags, setTags]       = useState('')
    const [folder, setFolder]   = useState('')
    const [dragging, setDragging] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [progresses, setProgresses] = useState({})
    const [stages, setStages]   = useState({})
    const [done, setDone]       = useState(false)
    const ref = useRef()

    const add = f => setFiles(p => [...p, ...Array.from(f)])

    const start = async () => {
        if (!files.length) return
        setUploading(true)
        const tagList = tags.split(',').map(t=>t.trim()).filter(Boolean)
        await Promise.all(files.map((file,i) =>
            onUpload(file, tagList, folder,
                pct => setProgresses(p=>({...p,[i]:pct})),
                stage => setStages(s=>({...s,[i]:stage}))
            )
        ))
        setDone(true)
        setTimeout(onClose, 1200)
    }

    const allFolders = [...new Set([...FOLDERS, ...folders])]

    return (
        <div onClick={e=>e.target===e.currentTarget&&!uploading&&onClose()} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'flex-end', zIndex:100, backdropFilter:'blur(4px)' }}>
            <div className="slide-up" style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'20px 20px 0 0', padding:'18px 16px 36px', width:'100%', maxHeight:'92vh', overflowY:'auto' }}>

                <div style={{ width:32, height:4, background:'var(--border2)', borderRadius:4, margin:'0 auto 16px' }} />

                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                    <h2 style={{ fontSize:16, fontWeight:600 }}>
                        <i className="fas fa-upload" style={{ color:'var(--accent)', marginRight:8 }} />
                        Uploader des fichiers
                    </h2>
                    {!uploading && <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text2)', fontSize:18 }}><i className="fas fa-times" /></button>}
                </div>

                {/* IA badge */}
                <div style={{ display:'flex', alignItems:'center', gap:7, background:'rgba(167,139,250,0.08)', border:'1px solid rgba(167,139,250,0.2)', borderRadius:'var(--r-md)', padding:'7px 10px', marginBottom:12 }}>
                    <i className="fas fa-robot" style={{ color:'#a78bfa', fontSize:13 }} />
                    <span style={{ fontSize:11, color:'var(--text2)' }}><strong style={{ color:'#a78bfa' }}>IA activée</strong> — OCR + résumé automatique après upload</span>
                </div>

                {/* Drop zone */}
                <div
                    onDrop={e=>{e.preventDefault();setDragging(false);add(e.dataTransfer.files)}}
                    onDragOver={e=>{e.preventDefault();setDragging(true)}}
                    onDragLeave={()=>setDragging(false)}
                    onClick={()=>!uploading&&ref.current?.click()}
                    style={{ border:`2px dashed ${dragging?'var(--accent)':'var(--border)'}`, borderRadius:'var(--r-lg)', padding:'22px 14px', textAlign:'center', cursor: uploading?'default':'pointer', background: dragging?'var(--accent-dim)':'var(--bg3)', marginBottom:12, transition:'all 0.15s' }}>
                    <i className="fas fa-cloud-arrow-up" style={{ fontSize:28, color: dragging?'var(--accent)':'var(--text3)', display:'block', marginBottom:7 }} />
                    <p style={{ fontWeight:500, fontSize:13, marginBottom:2 }}>{uploading ? 'Traitement...' : 'Glisse tes fichiers ici'}</p>
                    <p style={{ fontSize:11, color:'var(--text3)' }}>{uploading ? 'IA en cours...' : 'ou appuie pour choisir'}</p>
                    <input ref={ref} type="file" multiple style={{ display:'none' }} onChange={e=>add(e.target.files)} />
                </div>

                {/* File list + stages */}
                {files.length > 0 && (
                    <div style={{ marginBottom:12, maxHeight:150, overflowY:'auto' }}>
                        {files.map((f,i) => {
                            const stage = stages[i]
                            const si = stage ? STAGES[stage] : null
                            return (
                                <div key={i} style={{ padding:'7px 0', borderBottom:'1px solid var(--border)' }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom: si ? 5 : 0 }}>
                                        <i className="fas fa-file" style={{ color:'var(--text3)', fontSize:11 }} />
                                        <span style={{ flex:1, fontSize:12, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</span>
                                        <span style={{ fontSize:10, color:'var(--text3)' }}>{(f.size/1024/1024).toFixed(1)}Mo</span>
                                        {uploading && stage==='upload' && (
                                            <div style={{ width:44, height:3, background:'var(--bg3)', borderRadius:3, overflow:'hidden', flexShrink:0 }}>
                                                <div style={{ height:'100%', borderRadius:3, background:'#60a5fa', width:`${progresses[i]||0}%`, transition:'width 0.3s' }} />
                                            </div>
                                        )}
                                        {!uploading && (
                                            <button onClick={()=>setFiles(p=>p.filter((_,j)=>j!==i))} style={{ background:'none', border:'none', color:'var(--text3)', fontSize:11, cursor:'pointer' }}>
                                                <i className="fas fa-times" />
                                            </button>
                                        )}
                                    </div>
                                    {si && (
                                        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                                            <i className={`fas ${si.icon} ${stage!=='done'?'spin':''}`} style={{ color:si.color, fontSize:11 }} />
                                            <span style={{ fontSize:10, color:si.color }}>{si.label}</span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                {!uploading && (
                    <>
                        {/* Folder */}
                        <div style={{ marginBottom:12 }}>
                            <label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:5 }}>
                                <i className="fas fa-folder" style={{ marginRight:5, color:'var(--warn)' }} />Dossier
                            </label>
                            <input value={folder} onChange={e=>setFolder(e.target.value)} placeholder="ex: Travail, Photos..."
                                   style={{ width:'100%', padding:'8px 11px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', color:'var(--text)', fontSize:13, outline:'none', marginBottom:7 }} />
                            <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                                {allFolders.map(f => (
                                    <button key={f} onClick={()=>setFolder(folder===f?'':f)} style={{ padding:'3px 9px', borderRadius:20, fontSize:11, border:`1px solid ${folder===f?'var(--accent)':'var(--border)'}`, background: folder===f?'var(--accent-dim)':'transparent', color: folder===f?'var(--accent)':'var(--text2)' }}>{f}</button>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div style={{ marginBottom:16 }}>
                            <label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:5 }}>
                                <i className="fas fa-tags" style={{ marginRight:5 }} />Tags (optionnel — l'IA en génère aussi)
                            </label>
                            <input value={tags} onChange={e=>setTags(e.target.value)} placeholder="ex: important, 2025"
                                   style={{ width:'100%', padding:'8px 11px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', color:'var(--text)', fontSize:13, outline:'none' }} />
                        </div>
                    </>
                )}

                <button onClick={start} disabled={!files.length||uploading||done} style={{ width:'100%', padding:13, background: done?'#22c55e':'var(--accent)', border:'none', borderRadius:'var(--r-md)', color:'#fff', fontSize:14, fontWeight:600, opacity: !files.length?0.5:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    {done ? <><i className="fas fa-check" />Terminé — indexé IA</>
                        : uploading ? <><i className="fas fa-spinner spin" />Traitement...</>
                            : <><i className="fas fa-upload" />Uploader {files.length>0?`(${files.length})`:''}</>}
                </button>
            </div>
        </div>
    )
}