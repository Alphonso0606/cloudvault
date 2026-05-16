import { formatSize } from '../hooks/useFiles'

const TC = {
    image:   { label:'Images',   icon:'fa-image',       color:'#60a5fa', bg:'rgba(96,165,250,0.1)'  },
    pdf:     { label:'PDF',      icon:'fa-file-pdf',    color:'#f87171', bg:'rgba(248,113,113,0.1)' },
    video:   { label:'Vidéos',   icon:'fa-film',        color:'#f472b6', bg:'rgba(244,114,182,0.1)' },
    doc:     { label:'Docs',     icon:'fa-file-word',   color:'#22d3a0', bg:'rgba(34,211,160,0.1)'  },
    audio:   { label:'Audio',    icon:'fa-music',       color:'#a78bfa', bg:'rgba(167,139,250,0.1)' },
    sheet:   { label:'Tableurs', icon:'fa-file-excel',  color:'#4ade80', bg:'rgba(74,222,128,0.1)'  },
    archive: { label:'Archives', icon:'fa-file-zipper', color:'#fbbf24', bg:'rgba(251,191,36,0.1)'  },
    other:   { label:'Autres',   icon:'fa-file',        color:'#94a3b8', bg:'rgba(148,163,184,0.1)' },
}

export default function StatsPage({ stats, files }) {
    const maxSize = Math.max(...Object.values(stats.byType).map(t=>t.size), 1)
    const pct = Math.min((stats.totalSize/(25*1024*1024*1024))*100,100)
    const recent = [...files].sort((a,b)=>{
        const da=a.createdAt?.toDate?.()||new Date(a.createdAt||0)
        const db2=b.createdAt?.toDate?.()||new Date(b.createdAt||0)
        return db2-da
    }).slice(0,5)

    return (
        <div className="fade-in">
            <div style={{ marginBottom:20 }}>
                <h2 style={{ fontSize:18, fontWeight:600, marginBottom:3 }}>
                    <i className="fas fa-chart-pie" style={{ color:'var(--accent)', marginRight:8 }} />Statistiques
                </h2>
                <p style={{ color:'var(--text2)', fontSize:13 }}>Vue d'ensemble de ton stockage</p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8, marginBottom:16 }}>
                {[
                    { label:'Total fichiers', value:stats.total,                        icon:'fa-file',   color:'#60a5fa' },
                    { label:'Stockage',       value:formatSize(stats.totalSize),         icon:'fa-database',color:'#a78bfa'},
                    { label:'Favoris',        value:files.filter(f=>f.favorite).length, icon:'fa-star',   color:'#fbbf24' },
                    { label:'Dossiers',       value:stats.folders.length,               icon:'fa-folder', color:'#fbbf24' },
                ].map(s => (
                    <div key={s.label} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'14px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:7 }}>
                            <div style={{ width:28, height:28, borderRadius:8, background:`${s.color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <i className={`fas ${s.icon}`} style={{ fontSize:12, color:s.color }} />
                            </div>
                            <span style={{ fontSize:11, color:'var(--text3)' }}>{s.label}</span>
                        </div>
                        <div style={{ fontSize:24, fontWeight:600 }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Storage bar */}
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'16px', marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                    <div>
                        <div style={{ fontSize:13, fontWeight:500 }}>Cloudinary</div>
                        <div style={{ fontSize:11, color:'var(--text2)' }}>Plan gratuit · 25 Go</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:18, fontWeight:600 }}>{formatSize(stats.totalSize)}</div>
                        <div style={{ fontSize:11, color:'var(--text3)' }}>/ 25 Go</div>
                    </div>
                </div>
                <div style={{ height:8, background:'var(--bg3)', borderRadius:5, overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:5, width:`${pct}%`, background: pct>80?'#f87171':pct>60?'#fbbf24':'var(--accent)', transition:'width 0.8s ease' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:5 }}>
                    <span style={{ fontSize:10, color:'var(--text3)' }}>{pct.toFixed(1)}% utilisé</span>
                    <span style={{ fontSize:10, color:'var(--text3)' }}>{formatSize((25*1024*1024*1024)-stats.totalSize)} restant</span>
                </div>
            </div>

            {/* By type */}
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'16px', marginBottom:12 }}>
                <div style={{ fontSize:13, fontWeight:500, marginBottom:14 }}>
                    <i className="fas fa-chart-bar" style={{ color:'var(--accent)', marginRight:7 }} />Par type
                </div>
                {Object.entries(stats.byType).length===0
                    ? <p style={{ color:'var(--text3)', fontSize:13 }}>Aucun fichier encore.</p>
                    : Object.entries(stats.byType).sort((a,b)=>b[1].size-a[1].size).map(([type,data]) => {
                        const cfg = TC[type]||TC.other
                        const p = Math.round((data.size/maxSize)*100)
                        return (
                            <div key={type} style={{ marginBottom:12 }}>
                                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                                        <div style={{ width:24, height:24, borderRadius:7, background:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                            <i className={`fas ${cfg.icon}`} style={{ fontSize:11, color:cfg.color }} />
                                        </div>
                                        <span style={{ fontSize:12, fontWeight:500 }}>{cfg.label}</span>
                                        <span style={{ fontSize:10, color:'var(--text3)' }}>{data.count} fichier{data.count>1?'s':''}</span>
                                    </div>
                                    <span style={{ fontSize:12, color:'var(--text2)' }}>{formatSize(data.size)}</span>
                                </div>
                                <div style={{ height:5, background:'var(--bg3)', borderRadius:4, overflow:'hidden' }}>
                                    <div style={{ height:'100%', borderRadius:4, background:cfg.color, width:`${p}%`, transition:'width 0.6s ease', opacity:0.8 }} />
                                </div>
                            </div>
                        )
                    })
                }
            </div>

            {/* Recent */}
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'16px' }}>
                <div style={{ fontSize:13, fontWeight:500, marginBottom:14 }}>
                    <i className="fas fa-clock" style={{ color:'var(--accent)', marginRight:7 }} />5 derniers fichiers
                </div>
                {recent.map((file,i) => {
                    const cfg = TC[file.type]||TC.other
                    return (
                        <div key={file.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom: i<recent.length-1?'1px solid var(--border)':'none' }}>
                            <div style={{ width:28, height:28, borderRadius:7, background:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                <i className={`fas ${cfg.icon}`} style={{ fontSize:12, color:cfg.color }} />
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ fontSize:12, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{file.name}</div>
                                {file.folder && <div style={{ fontSize:10, color:'var(--text3)' }}><i className="fas fa-folder" style={{ marginRight:3, color:'#fbbf24', fontSize:9 }} />{file.folder}</div>}
                            </div>
                            <span style={{ fontSize:11, color:'var(--text3)', flexShrink:0 }}>{formatSize(file.size)}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}