import { useState } from 'react'
import { BOARD_COVERS } from '../hooks/useBoards'
import { formatSize } from '../hooks/useFiles'

const TC = {
    pdf:     { icon:'fa-file-pdf',    color:'#f87171' },
    image:   { icon:'fa-image',       color:'#60a5fa' },
    doc:     { icon:'fa-file-word',   color:'#22d3a0' },
    video:   { icon:'fa-film',        color:'#f472b6' },
    audio:   { icon:'fa-music',       color:'#a78bfa' },
    archive: { icon:'fa-file-zipper', color:'#fbbf24' },
    other:   { icon:'fa-file',        color:'#94a3b8' },
}

export default function BoardDetail({ board, boardFiles, allFiles, onBack, onUpdate, onDelete, onAddFile, onRemoveFile }) {
    const [showAdd, setShowAdd]       = useState(false)
    const [confirmDel, setConfirmDel] = useState(false)
    const [editName, setEditName]     = useState(false)
    const [nameVal, setNameVal]       = useState(board.name)
    const [preview, setPreview]       = useState(null)

    const cover = BOARD_COVERS.find(c=>c.id===board.cover) || BOARD_COVERS[0]
    const avail = allFiles.filter(f=>!(board.fileIds||[]).includes(f.id))

    const saveName = () => { if(nameVal.trim()) onUpdate({name:nameVal.trim()}); setEditName(false) }

    return (
        <div className="fade-in">
            {/* Cover header */}
            <div style={{ height:160, borderRadius:'var(--r-lg)', background:cover.style, position:'relative', marginBottom:16, overflow:'hidden', display:'flex', alignItems:'flex-end' }}>
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.55))' }} />

                <button onClick={onBack} style={{ position:'absolute', top:12, left:12, width:34, height:34, borderRadius:'50%', background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)', border:'none', color:'#fff', fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <i className="fas fa-arrow-left" />
                </button>

                <div style={{ position:'absolute', top:12, right:12, display:'flex', gap:7 }}>
                    <button onClick={()=>setShowAdd(true)} style={{ padding:'5px 12px', borderRadius:20, background:'rgba(255,255,255,0.2)', backdropFilter:'blur(4px)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', fontSize:11, fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
                        <i className="fas fa-plus" />Ajouter
                    </button>
                    <button onClick={()=>setConfirmDel(true)} style={{ width:30, height:30, borderRadius:'50%', background:'rgba(248,113,113,0.3)', border:'1px solid rgba(248,113,113,0.4)', color:'#fff', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <i className="fas fa-trash" />
                    </button>
                </div>

                <div style={{ position:'relative', zIndex:1, padding:'0 14px 14px', width:'100%' }}>
                    <span style={{ fontSize:24, display:'block', marginBottom:3 }}>{board.emoji}</span>
                    {editName ? (
                        <input autoFocus value={nameVal} onChange={e=>setNameVal(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')saveName();if(e.key==='Escape')setEditName(false)}} onBlur={saveName}
                               style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.4)', borderRadius:7, color:'#fff', fontSize:17, fontWeight:600, padding:'3px 9px', outline:'none', width:'80%' }} />
                    ) : (
                        <h1 onClick={()=>setEditName(true)} style={{ fontSize:19, fontWeight:700, color:'#fff', textShadow:'0 2px 8px rgba(0,0,0,0.4)', cursor:'pointer' }}>
                            {board.name} <i className="fas fa-pen" style={{ fontSize:11, opacity:0.7 }} />
                        </h1>
                    )}
                    {board.description && <p style={{ fontSize:12, color:'rgba(255,255,255,0.8)', marginTop:2 }}>{board.description}</p>}
                </div>
            </div>

            <p style={{ fontSize:12, color:'var(--text2)', marginBottom:14 }}>{boardFiles.length} fichier{boardFiles.length!==1?'s':''}</p>

            {boardFiles.length === 0 ? (
                <div style={{ textAlign:'center', padding:'50px 20px' }}>
                    <div className="float" style={{ fontSize:44, marginBottom:12 }}>🎨</div>
                    <p style={{ fontSize:15, fontWeight:500, color:'var(--text2)', marginBottom:6 }}>Board vide</p>
                    <p style={{ fontSize:12, color:'var(--text3)', marginBottom:18 }}>Ajoute des fichiers pour créer ton moodboard</p>
                    <button onClick={()=>setShowAdd(true)} style={{ padding:'9px 18px', background:'var(--accent)', border:'none', borderRadius:'var(--r-md)', color:'#fff', fontSize:13, fontWeight:600 }}>
                        <i className="fas fa-plus" style={{ marginRight:6 }} />Ajouter des fichiers
                    </button>
                </div>
            ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:9 }}>
                    {boardFiles.map((file,i) => {
                        const cfg = TC[file.type]||TC.other
                        return (
                            <div key={file.id} className="fade-in" style={{ animationDelay:`${i*0.04}s`, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', overflow:'hidden', cursor:'pointer' }}
                                 onClick={()=>setPreview(file)}>
                                {file.type==='image' ? (
                                    <div style={{ height:100, background:`url(${file.url}) center/cover`, position:'relative' }}>
                                        <button onClick={e=>{e.stopPropagation();onRemoveFile(file.id)}} style={{ position:'absolute', top:5, right:5, width:22, height:22, borderRadius:'50%', background:'rgba(0,0,0,0.5)', border:'none', color:'#fff', fontSize:9, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                            <i className="fas fa-times" />
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ height:72, background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, color:cfg.color, position:'relative' }}>
                                        <i className={`fas ${cfg.icon}`} />
                                        <button onClick={e=>{e.stopPropagation();onRemoveFile(file.id)}} style={{ position:'absolute', top:5, right:5, width:20, height:20, borderRadius:'50%', background:'rgba(0,0,0,0.3)', border:'none', color:'#fff', fontSize:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                            <i className="fas fa-times" />
                                        </button>
                                    </div>
                                )}
                                <div style={{ padding:'7px 9px' }}>
                                    <div style={{ fontSize:11, fontWeight:500, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{file.name}</div>
                                    <div style={{ fontSize:9, color:'var(--text3)', marginTop:1 }}>{formatSize(file.size)}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Modal ajout fichiers */}
            {showAdd && (
                <div onClick={e=>e.target===e.currentTarget&&setShowAdd(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'flex-end', zIndex:100, backdropFilter:'blur(4px)' }}>
                    <div className="slide-up" style={{ background:'var(--bg2)', borderRadius:'20px 20px 0 0', padding:'18px 16px 36px', width:'100%', maxHeight:'70vh', overflowY:'auto' }}>
                        <div style={{ width:32, height:4, background:'var(--border2)', borderRadius:4, margin:'0 auto 14px' }} />
                        <h3 style={{ fontSize:15, fontWeight:600, marginBottom:14 }}>Ajouter à "{board.name}"</h3>
                        {avail.length===0 ? (
                            <p style={{ color:'var(--text2)', fontSize:13, textAlign:'center', padding:'18px 0' }}>Tous tes fichiers sont déjà dans ce board !</p>
                        ) : (
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))', gap:9 }}>
                                {avail.map(file => {
                                    const cfg = TC[file.type]||TC.other
                                    return (
                                        <button key={file.id} onClick={()=>{onAddFile(file.id);setShowAdd(false)}} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', overflow:'hidden', cursor:'pointer', textAlign:'left' }}>
                                            {file.type==='image' ? (
                                                <div style={{ height:70, background:`url(${file.url}) center/cover` }} />
                                            ) : (
                                                <div style={{ height:56, background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, color:cfg.color }}>
                                                    <i className={`fas ${cfg.icon}`} />
                                                </div>
                                            )}
                                            <div style={{ padding:'5px 7px' }}>
                                                <div style={{ fontSize:10, fontWeight:500, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{file.name}</div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Preview plein écran */}
            {preview && (
                <div onClick={()=>setPreview(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:16 }}>
                    {preview.type==='image'
                        ? <img src={preview.url} alt={preview.name} style={{ maxWidth:'100%', maxHeight:'90vh', borderRadius:'var(--r-md)', objectFit:'contain' }} />
                        : <div style={{ color:'#fff', textAlign:'center' }}><i className="fas fa-file" style={{ fontSize:60, marginBottom:12 }} /><p>{preview.name}</p></div>
                    }
                    <button onClick={()=>setPreview(null)} style={{ position:'fixed', top:16, right:16, width:38, height:38, borderRadius:'50%', background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', fontSize:17, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <i className="fas fa-times" />
                    </button>
                </div>
            )}

            {/* Confirm delete */}
            {confirmDel && (
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:20 }}>
                    <div className="slide-up" style={{ background:'var(--bg2)', borderRadius:'var(--r-xl)', padding:24, width:'100%', maxWidth:320, textAlign:'center' }}>
                        <div style={{ fontSize:36, marginBottom:10 }}>🗑️</div>
                        <h3 style={{ fontSize:16, fontWeight:600, marginBottom:7 }}>Supprimer ce board ?</h3>
                        <p style={{ fontSize:13, color:'var(--text2)', marginBottom:20 }}>"{board.name}" sera supprimé. Les fichiers restent dans ta bibliothèque.</p>
                        <div style={{ display:'flex', gap:9 }}>
                            <button onClick={()=>setConfirmDel(false)} style={{ flex:1, padding:10, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', color:'var(--text2)', fontSize:13, cursor:'pointer' }}>Annuler</button>
                            <button onClick={onDelete} style={{ flex:1, padding:10, background:'#f87171', border:'none', borderRadius:'var(--r-md)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>Supprimer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}