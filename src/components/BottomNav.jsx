export default function BottomNav({ page, onChangePage }) {
    const tabs = [
        { id:'files',  icon:'fa-folder',    label:'Fichiers' },
        { id:'boards', icon:'fa-th-large',  label:'Boards'   },
        { id:'stats',  icon:'fa-chart-pie', label:'Stats'    },
    ]
    return (
        <nav style={{
            position:'fixed', bottom:0, left:0, right:0, zIndex:50,
            background:'var(--bg2)', borderTop:'1px solid var(--border)',
            display:'flex', height:58,
            paddingBottom:'env(safe-area-inset-bottom)',
        }}>
            {tabs.map(tab => (
                <button key={tab.id} onClick={() => onChangePage(tab.id)} style={{
                    flex:1, border:'none', background:'none',
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3,
                    color: page===tab.id ? 'var(--accent)' : 'var(--text3)',
                    fontSize:10, fontWeight: page===tab.id ? 600 : 400,
                    cursor:'pointer', transition:'color 0.15s', position:'relative'
                }}>
                    {page===tab.id && (
                        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:28, height:2, background:'var(--accent)', borderRadius:2 }} />
                    )}
                    <i className={`fas ${tab.icon}`} style={{ fontSize:20, marginTop:4 }} />
                    {tab.label}
                </button>
            ))}
        </nav>
    )
}