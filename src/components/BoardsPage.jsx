import { useState } from 'react'
import { useBoards, BOARD_COVERS } from '../hooks/useBoards'
import { useAuth } from '../hooks/useAuth'
import BoardDetail from './BoardDetail'
import CreateBoardModal from './CreateBoardModal'

export default function BoardsPage({ files }) {
    const { user } = useAuth()
    const { boards, loading, createBoard, updateBoard, deleteBoard, addFileToBoard, removeFileFromBoard } = useBoards(user?.uid)
    const [selected, setSelected] = useState(null)
    const [showCreate, setShowCreate] = useState(false)

    const getCover = id => BOARD_COVERS.find(c=>c.id===id) || BOARD_COVERS[0]

    if (selected) {
        const board = boards.find(b=>b.id===selected)
        if (!board) { setSelected(null); return null }
        const boardFiles = files.filter(f=>(board.fileIds||[]).includes(f.id))
        return <BoardDetail board={board} boardFiles={boardFiles} allFiles={files}
                            onBack={()=>setSelected(null)}
                            onUpdate={data=>updateBoard(board.id,data)}
                            onDelete={()=>{deleteBoard(board.id);setSelected(null)}}
                            onAddFile={fid=>addFileToBoard(board.id,fid)}
                            onRemoveFile={fid=>removeFileFromBoard(board.id,fid)}
        />
    }

    return (
        <div className="fade-in">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                <div>
                    <h2 style={{ fontSize:18, fontWeight:600, marginBottom:2 }}>✨ Moodboards</h2>
                    <p style={{ fontSize:12, color:'var(--text2)' }}>{boards.length} board{boards.length!==1?'s':''}</p>
                </div>
                <button onClick={()=>setShowCreate(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px', background:'var(--accent)', border:'none', borderRadius:'var(--r-md)', color:'#fff', fontSize:13, fontWeight:600 }}>
                    <i className="fas fa-plus" />Nouveau
                </button>
            </div>

            {loading ? (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:12 }}>
                    {Array.from({length:4}).map((_,i) => <div key={i} className="pulse" style={{ height:200, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', animationDelay:`${i*0.1}s` }} />)}
                </div>
            ) : boards.length === 0 ? (
                <div style={{ textAlign:'center', padding:'70px 20px' }}>
                    <div className="float" style={{ fontSize:56, marginBottom:14 }}>✨</div>
                    <p style={{ fontSize:16, fontWeight:500, color:'var(--text)', marginBottom:6 }}>Aucun moodboard</p>
                    <p style={{ fontSize:13, color:'var(--text2)', marginBottom:20 }}>Crée ton premier board pour organiser tes inspirations</p>
                    <button onClick={()=>setShowCreate(true)} style={{ padding:'11px 22px', background:'var(--accent)', border:'none', borderRadius:'var(--r-md)', color:'#fff', fontSize:14, fontWeight:600 }}>
                        Créer un moodboard ✨
                    </button>
                </div>
            ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:12 }}>
                    {boards.map((board,i) => {
                        const cover = getCover(board.cover)
                        const prev = files.filter(f=>(board.fileIds||[]).includes(f.id)).slice(0,4)
                        return (
                            <div key={board.id} className="fade-in" style={{ animationDelay:`${i*0.06}s`, cursor:'pointer', borderRadius:'var(--r-lg)', overflow:'hidden', border:'1px solid var(--border)' }}
                                 onClick={()=>setSelected(board.id)}>
                                <div style={{ height:130, background:cover.style, position:'relative', overflow:'hidden' }}>
                                    {prev.length > 0 ? (
                                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', height:'100%', opacity:0.85 }}>
                                            {prev.slice(0,4).map((f,j) => (
                                                <div key={j} style={{ background: f.type==='image'?`url(${f.url}) center/cover`:'transparent', borderRight: j%2===0?'1px solid rgba(255,255,255,0.2)':'', borderBottom: j<2?'1px solid rgba(255,255,255,0.2)':'', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, color:'rgba(255,255,255,0.5)' }}>
                                                    {f.type!=='image' && <i className="fas fa-file" />}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36 }}>{board.emoji}</div>
                                    )}
                                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.4))' }} />
                                    <div style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)', borderRadius:20, padding:'2px 7px', fontSize:10, color:'#fff', fontWeight:500 }}>
                                        {(board.fileIds||[]).length}
                                    </div>
                                </div>
                                <div style={{ background:'var(--bg2)', padding:'10px 12px' }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2 }}>
                                        <span style={{ fontSize:14 }}>{board.emoji}</span>
                                        <span style={{ fontSize:13, fontWeight:500, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{board.name}</span>
                                    </div>
                                    {board.description && <p style={{ fontSize:11, color:'var(--text2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{board.description}</p>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
            {showCreate && <CreateBoardModal onClose={()=>setShowCreate(false)} onCreate={async data=>{await createBoard(data);setShowCreate(false)}} />}
        </div>
    )
}