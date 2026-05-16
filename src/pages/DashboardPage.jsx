import { useState, useMemo } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../hooks/useAuth'
import { useFiles, formatSize } from '../hooks/useFiles'
import { useTheme } from '../hooks/useTheme'
import FileCard from '../components/FileCard'
import FileList from '../components/FileList'
import UploadModal from '../components/UploadModal'
import PreviewModal from '../components/PreviewModal'
import StatsPage from '../components/StatsPage'
import BoardsPage from '../components/BoardsPage'
import BottomNav from '../components/BottomNav'
import ThemePicker from '../components/ThemePicker'

const TYPE_FILTERS = [
  { id:'all',      label:'Tous',     icon:'fa-layer-group' },
  { id:'image',    label:'Images',   icon:'fa-image'       },
  { id:'pdf',      label:'PDF',      icon:'fa-file-pdf'    },
  { id:'doc',      label:'Docs',     icon:'fa-file-word'   },
  { id:'video',    label:'Vidéos',   icon:'fa-film'        },
  { id:'audio',    label:'Audio',    icon:'fa-music'       },
  { id:'archive',  label:'Archives', icon:'fa-file-zipper' },
  { id:'favorite', label:'Favoris',  icon:'fa-star'        },
]

export default function DashboardPage() {
  const { user }            = useAuth()
  const { theme, setTheme } = useTheme()
  const { files, loading, uploadFile, deleteFile, toggleFavorite, updateTags, updateFolder, searchFiles, stats } = useFiles(user?.uid)

  const [search, setSearch]         = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [folderFilter, setFolderFilter] = useState('')
  const [view, setView]             = useState('grid')
  const [sort, setSort]             = useState('date')
  const [showUpload, setShowUpload] = useState(false)
  const [preview, setPreview]       = useState(null)
  const [page, setPage]             = useState('files')
  const [showTheme, setShowTheme]   = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  const filtered = useMemo(() => {
    let f = search.trim() ? searchFiles(search) : [...files]
    if (typeFilter === 'favorite') f = f.filter(x => x.favorite)
    else if (typeFilter !== 'all') f = f.filter(x => x.type === typeFilter)
    if (folderFilter) f = f.filter(x => x.folder === folderFilter)
    f.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'size') return (b.size||0) - (a.size||0)
      const da = a.createdAt?.toDate?.() || new Date(a.createdAt||0)
      const db2 = b.createdAt?.toDate?.() || new Date(b.createdAt||0)
      return db2 - da
    })
    return f
  }, [files, search, searchFiles, typeFilter, folderFilter, sort])

  const storagePct = Math.min((stats.totalSize / (25*1024*1024*1024)) * 100, 100)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  return (
      <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column', paddingBottom:64 }}>

        {/* ══ HEADER ══ */}
        <header style={{ background:'var(--bg2)', borderBottom:'1px solid var(--border)', position:'sticky', top:0, zIndex:50 }}>
          <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 12px' }}>

            {/* Row 1 */}
            <div style={{ display:'flex', alignItems:'center', gap:8, height:52 }}>

              {/* Logo */}
              <div style={{ display:'flex', alignItems:'center', gap:7, flexShrink:0 }}>
                <div style={{ width:28, height:28, background:'var(--accent-dim)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)', fontSize:13 }}>
                  <i className="fas fa-cloud" />
                </div>
                <span style={{ fontWeight:600, fontSize:14, letterSpacing:'-0.3px' }}>CloudVault</span>
              </div>

              {/* Search desktop */}
              <div style={{ flex:1, position:'relative', display: showSearch ? 'none' : undefined }}>
                <div className="hide-on-mobile" style={{ position:'relative' }}>
                  <i className="fas fa-search" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', fontSize:12 }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Recherche intelligente..." style={{ width:'100%', padding:'7px 10px 7px 30px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', color:'var(--text)', fontSize:13, outline:'none' }} />
                </div>
              </div>

              {/* Search mobile expanded */}
              {showSearch && (
                  <div style={{ flex:1, position:'relative' }}>
                    <i className="fas fa-search" style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', fontSize:12 }} />
                    <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." style={{ width:'100%', padding:'7px 10px 7px 28px', background:'var(--bg3)', border:'1px solid var(--accent)', borderRadius:'var(--r-md)', color:'var(--text)', fontSize:13, outline:'none' }} />
                  </div>
              )}

              <div style={{ display:'flex', gap:5, alignItems:'center', flexShrink:0 }}>
                {/* Search toggle mobile */}
                <button onClick={() => { setShowSearch(v => !v); if(showSearch) setSearch('') }}
                        style={{ width:32, height:32, border:'1px solid var(--border)', borderRadius:'var(--r-sm)', background: showSearch ? 'var(--accent-dim)' : 'var(--bg3)', color: showSearch ? 'var(--accent)' : 'var(--text2)', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}
                        className="show-on-mobile">
                  <i className={`fas ${showSearch ? 'fa-times' : 'fa-search'}`} />
                </button>

                {/* Sort */}
                <select value={sort} onChange={e => setSort(e.target.value)}
                        className="hide-on-mobile"
                        style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', color:'var(--text2)', fontSize:12, padding:'6px 8px', outline:'none' }}>
                  <option value="date">Date</option>
                  <option value="name">Nom</option>
                  <option value="size">Taille</option>
                </select>

                {/* Grid/List toggle */}
                <div style={{ display:'flex', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', padding:2, gap:1 }}>
                  {['grid','list'].map(v => (
                      <button key={v} onClick={() => setView(v)} style={{ width:28, height:28, border:'none', borderRadius:6, fontSize:11, background: view===v ? 'var(--accent-dim)' : 'transparent', color: view===v ? 'var(--accent)' : 'var(--text3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <i className={`fas fa-${v==='grid' ? 'grip' : 'list'}`} />
                      </button>
                  ))}
                </div>

                {/* Theme */}
                <button onClick={() => setShowTheme(true)} style={{ width:32, height:32, border:'1px solid var(--border)', borderRadius:'var(--r-sm)', background:'var(--bg3)', fontSize:15, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  🎨
                </button>

                {/* Avatar */}
                <button onClick={() => signOut(auth)} title="Déconnexion" style={{ width:30, height:30, borderRadius:'50%', overflow:'hidden', border:'1.5px solid var(--border)', background:'none', flexShrink:0 }}>
                  {user?.photoURL
                      ? <img src={user.photoURL} alt="" width={30} height={30} style={{ display:'block' }} />
                      : <div style={{ width:'100%', height:'100%', background:'var(--accent-dim)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)', fontWeight:600, fontSize:11 }}>{user?.displayName?.[0]?.toUpperCase()||'?'}</div>
                  }
                </button>
              </div>
            </div>

            {/* Row 2 — filtres scrollables */}
            {page === 'files' && (
                <div style={{ overflowX:'auto', paddingBottom:10, WebkitOverflowScrolling:'touch' }}>
                  <div style={{ display:'flex', gap:5, alignItems:'center', minWidth:'max-content', paddingRight:4 }}>
                    {TYPE_FILTERS.map(f => (
                        <button key={f.id} onClick={() => setTypeFilter(f.id)} style={{
                          display:'flex', alignItems:'center', gap:4,
                          padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:500,
                          border: typeFilter===f.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                          background: typeFilter===f.id ? 'var(--accent-dim)' : 'transparent',
                          color: typeFilter===f.id ? 'var(--accent)' : 'var(--text2)',
                          whiteSpace:'nowrap', flexShrink:0
                        }}>
                          <i className={`fas ${f.icon}`} style={{ fontSize:10 }} />{f.label}
                        </button>
                    ))}
                    {stats.folders.length > 0 && <div style={{ width:1, height:16, background:'var(--border)', flexShrink:0 }} />}
                    {stats.folders.map(f => (
                        <button key={f} onClick={() => setFolderFilter(folderFilter===f ? '' : f)} style={{
                          display:'flex', alignItems:'center', gap:4, padding:'4px 10px',
                          borderRadius:20, fontSize:11,
                          border: folderFilter===f ? '1px solid var(--warn)' : '1px solid var(--border)',
                          background: folderFilter===f ? 'rgba(251,191,36,0.1)' : 'transparent',
                          color: folderFilter===f ? 'var(--warn)' : 'var(--text2)',
                          whiteSpace:'nowrap', flexShrink:0
                        }}>
                          <i className="fas fa-folder" style={{ fontSize:10 }} />{f}
                        </button>
                    ))}
                    {/* Storage bar */}
                    <div style={{ display:'flex', alignItems:'center', gap:5, flexShrink:0, marginLeft:4 }}>
                      <div style={{ width:50, height:3, background:'var(--bg3)', borderRadius:3, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${storagePct}%`, background:'var(--accent)', borderRadius:3 }} />
                      </div>
                      <span style={{ fontSize:10, color:'var(--text3)', whiteSpace:'nowrap' }}>{formatSize(stats.totalSize)}/25Go</span>
                    </div>
                  </div>
                </div>
            )}
          </div>
        </header>

        {/* ══ MAIN ══ */}
        <main style={{ flex:1, padding:'12px', maxWidth:1200, margin:'0 auto', width:'100%' }}>

          {page === 'boards' && <BoardsPage files={files} />}
          {page === 'stats'  && <StatsPage stats={stats} files={files} />}

          {page === 'files' && (
              <>
                {/* Stats mini cards */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8, marginBottom:14 }}>
                  {[
                    { label:'Fichiers', value:files.length,                        icon:'fa-file',     color:'var(--info)'   },
                    { label:'Indexés',  value:files.filter(f=>f.summary).length,   icon:'fa-robot',    color:'var(--purple)' },
                    { label:'Favoris',  value:files.filter(f=>f.favorite).length,  icon:'fa-star',     color:'var(--warn)'   },
                    { label:'Stockage', value:formatSize(stats.totalSize),          icon:'fa-database', color:'var(--accent)' },
                  ].map(s => (
                      <div key={s.label} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:'10px 12px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:3 }}>
                          <i className={`fas ${s.icon}`} style={{ fontSize:11, color:s.color }} />
                          <span style={{ fontSize:10, color:'var(--text3)' }}>{s.label}</span>
                        </div>
                        <div style={{ fontSize:18, fontWeight:600 }}>{s.value}</div>
                      </div>
                  ))}
                </div>

                {/* Count */}
                <p style={{ fontSize:12, color:'var(--text2)', marginBottom:10 }}>
                  {loading ? 'Chargement...' : `${filtered.length} fichier${filtered.length!==1?'s':''}`}
                  {search && <span style={{ color:'var(--purple)', marginLeft:6 }}>· IA active</span>}
                </p>

                {/* Files grid/list */}
                {loading ? (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:10 }}>
                      {Array.from({length:8}).map((_,i) => (
                          <div key={i} className="pulse" style={{ height:170, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', animationDelay:`${i*0.1}s` }} />
                      ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'60px 20px' }}>
                      <div className="float" style={{ fontSize:48, marginBottom:14 }}>{search ? '🔍' : '✨'}</div>
                      <p style={{ fontSize:15, fontWeight:500, color:'var(--text2)', marginBottom:6 }}>
                        {search ? 'Aucun résultat' : 'Aucun fichier'}
                      </p>
                      <p style={{ fontSize:13, color:'var(--text3)' }}>
                        {search ? "L'IA a cherché dans tous les contenus" : 'Appuie sur + pour uploader'}
                      </p>
                    </div>
                ) : view === 'grid' ? (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:10 }}>
                      {filtered.map((file, i) => (
                          <FileCard key={file.id} file={file} index={i} searchQuery={search}
                                    onPreview={() => setPreview(file)}
                                    onDelete={() => deleteFile(file)}
                                    onToggleFav={() => toggleFavorite(file)}
                                    onUpdateTags={tags => updateTags(file, tags)}
                          />
                      ))}
                    </div>
                ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      {filtered.map((file, i) => (
                          <FileList key={file.id} file={file} index={i} searchQuery={search}
                                    onPreview={() => setPreview(file)}
                                    onDelete={() => deleteFile(file)}
                                    onToggleFav={() => toggleFavorite(file)}
                          />
                      ))}
                    </div>
                )}
              </>
          )}
        </main>

        {/* FAB */}
        <button onClick={() => setShowUpload(true)} style={{
          position:'fixed', bottom:72, right:16, width:48, height:48, borderRadius:'50%',
          background:'var(--accent)', border:'none', color:'#fff', fontSize:20,
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 4px 16px rgba(0,0,0,0.25)', zIndex:40
        }}>
          <i className="fas fa-plus" />
        </button>

        <BottomNav page={page} onChangePage={setPage} />

        {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUpload={uploadFile} folders={stats.folders} />}
        {preview && <PreviewModal file={preview} onClose={() => setPreview(null)} />}
        {showTheme && <ThemePicker currentTheme={theme} onSelect={setTheme} onClose={() => setShowTheme(false)} />}
      </div>
  )
}