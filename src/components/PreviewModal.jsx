import { formatSize, formatDate } from '../hooks/useFiles'

export default function PreviewModal({ file, onClose }) {
    const body = () => {
        if (file.type==='image') return <img src={file.url} alt={file.name} style={{ maxWidth:'100%', maxHeight:'65vh', borderRadius:'var(--r-md)', objectFit:'contain', display:'block', margin:'0 auto' }} />
        if (file.type==='pdf')   return <iframe src={file.url} style={{ width:'100%', height:'65vh', border:'none', borderRadius:'var(--r-md)' }} title={file.name} />
        if (file.type==='video') return <video src={file.url} controls style={{ width:'100%', maxHeight:'65vh', borderRadius:'var(--r-md)' }} />
        if (file.type==='audio') return (
            <div style={{ padding:'28px 0', textAlign:'center' }}>
                <i className="fas fa-music" style={{ fontSize:50, color:'var(--purple)', marginBottom:16, display:'block' }} />
                <audio src={file.url} controls style={{ width:'100%' }} />
            </div>
        )
        return (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
                <i className="fas fa-file" style={{ fontSize:52, color:'var(--text3)', display:'block', marginBottom:14 }} />
                <p style={{ color:'var(--text2)', marginBottom:16, fontSize:13 }}>Pas de prévisualisation</p>
                <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'10px 18px', background:'var(--accent)', color:'#fff', borderRadius:'var(--r-md)', fontWeight:500, fontSize:13 }}>
                    <i className="fas fa-download" />Télécharger
                </a>
            </div>
        )
    }

    return (
        <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', display:'flex', alignItems:'flex-end', zIndex:100, backdropFilter:'blur(6px)' }}>
            <div className="slide-up" style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'20px 20px 0 0', width:'100%', maxHeight:'92vh', display:'flex', flexDirection:'column', boxShadow:'var(--shadow)' }}>
                <div style={{ width:32, height:4, background:'var(--border2)', borderRadius:4, margin:'10px auto 0' }} />
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{file.name}</div>
                        <div style={{ fontSize:10, color:'var(--text3)', marginTop:1 }}>
                            {formatSize(file.size)} · {formatDate(file.createdAt)}
                            {(file.tags||[]).length>0 && <span style={{ marginLeft:5 }}>{file.tags.map(t=>`#${t}`).join(' ')}</span>}
                        </div>
                    </div>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ width:30, height:30, border:'1px solid var(--border)', borderRadius:'var(--r-sm)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text2)', fontSize:13, flexShrink:0 }}>
                        <i className="fas fa-download" />
                    </a>
                    <button onClick={onClose} style={{ width:30, height:30, border:'1px solid var(--border)', borderRadius:'var(--r-sm)', background:'none', color:'var(--text2)', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <i className="fas fa-times" />
                    </button>
                </div>
                <div style={{ flex:1, overflow:'auto', padding:14 }}>{body()}</div>
            </div>
        </div>
    )
}