import { useState, useMemo } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../hooks/useAuth'
import { useFiles, formatSize, formatDate } from '../hooks/useFiles'
import FileCard from '../components/FileCard'
import FileList from '../components/FileList'
import UploadModal from '../components/UploadModal'
import PreviewModal from '../components/PreviewModal'
import StatsPage from '../components/StatsPage'

const TYPE_FILTERS = [
  { id: 'all', label: 'Tous', icon: 'fa-layer-group' },
  { id: 'image', label: 'Images', icon: 'fa-image' },
  { id: 'pdf', label: 'PDF', icon: 'fa-file-pdf' },
  { id: 'doc', label: 'Docs', icon: 'fa-file-word' },
  { id: 'video', label: 'Vidéos', icon: 'fa-film' },
  { id: 'audio', label: 'Audio', icon: 'fa-music' },
  { id: 'archive', label: 'Archives', icon: 'fa-file-zipper' },
  { id: 'favorite', label: 'Favoris', icon: 'fa-star' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const { files, loading, uploadFile, deleteFile, toggleFavorite, updateTags, updateFolder, stats } = useFiles(user?.uid)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [folderFilter, setFolderFilter] = useState('')
  const [view, setView] = useState('grid')
  const [sort, setSort] = useState('date')
  const [showUpload, setShowUpload] = useState(false)
  const [preview, setPreview] = useState(null)
  const [page, setPage] = useState('files') // 'files' | 'stats'

  const filtered = useMemo(() => {
    let f = [...files]
    if (typeFilter === 'favorite') f = f.filter(x => x.favorite)
    else if (typeFilter !== 'all') f = f.filter(x => x.type === typeFilter)
    if (folderFilter) f = f.filter(x => x.folder === folderFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      f = f.filter(x =>
          x.name.toLowerCase().includes(q) ||
          (x.tags || []).some(t => t.toLowerCase().includes(q))
      )
    }
    f.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'size') return (b.size || 0) - (a.size || 0)
      const da = a.createdAt?.toDate?.() || new Date(a.createdAt || 0)
      const db2 = b.createdAt?.toDate?.() || new Date(b.createdAt || 0)
      return db2 - da
    })
    return f
  }, [files, typeFilter, folderFilter, search, sort])

  const storagePct = Math.min((stats.totalSize / (25 * 1024 * 1024 * 1024)) * 100, 100)

  return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>

        {/* TOPBAR */}
        <header style={{
          background: 'var(--color-bg-2)', borderBottom: '1px solid var(--color-border)',
          padding: '0 20px', position: 'sticky', top: 0, zIndex: 50
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>

            {/* Row 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 4 }}>
                <div style={{
                  width: 32, height: 32, background: 'var(--color-accent-dim)', borderRadius: 9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-accent)', fontSize: 14
                }}>
                  <i className="fas fa-cloud" />
                </div>
                <span style={{ fontWeight: 600, fontSize: 16 }}>CloudVault</span>
              </div>

              {/* Nav tabs */}
              <div style={{ display: 'flex', gap: 2, background: 'var(--color-bg-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 3 }}>
                {[
                  { id: 'files', icon: 'fa-folder', label: 'Fichiers' },
                  { id: 'stats', icon: 'fa-chart-pie', label: 'Stats' },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setPage(tab.id)} style={{
                      padding: '5px 12px', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 500,
                      background: page === tab.id ? 'rgba(34,211,160,0.15)' : 'transparent',
                      color: page === tab.id ? 'var(--color-accent)' : 'var(--color-text-dim)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      <i className={`fas ${tab.icon}`} style={{ fontSize: 12 }} />
                      {tab.label}
                    </button>
                ))}
              </div>

              <div style={{ flex: 1, position: 'relative' }}>
                <i className="fas fa-search" style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--color-text-dim)', fontSize: 13
                }} />
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher par nom, tag..."
                    style={{
                      width: '100%', padding: '9px 12px 9px 34px',
                      background: 'var(--color-bg-3)', border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)', color: 'var(--color-text)', fontSize: 14, outline: 'none'
                    }}
                />
              </div>

              <select value={sort} onChange={e => setSort(e.target.value)} style={{
                background: 'var(--color-bg-3)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)', fontSize: 13,
                padding: '8px 10px', outline: 'none'
              }}>
                <option value="date">Date</option>
                <option value="name">Nom</option>
                <option value="size">Taille</option>
              </select>

              <div style={{ display: 'flex', gap: 2, background: 'var(--color-bg-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 3 }}>
                {['grid', 'list'].map(v => (
                    <button key={v} onClick={() => setView(v)} style={{
                      width: 30, height: 30, border: 'none', borderRadius: 7, fontSize: 13,
                      background: view === v ? 'rgba(34,211,160,0.15)' : 'transparent',
                      color: view === v ? 'var(--color-accent)' : 'var(--color-text-dim)', cursor: 'pointer'
                    }}>
                      <i className={`fas fa-${v === 'grid' ? 'grip' : 'list'}`} />
                    </button>
                ))}
              </div>

              <button onClick={() => signOut(auth)} title="Se déconnecter" style={{
                width: 34, height: 34, borderRadius: '50%', overflow: 'hidden',
                border: '1.5px solid var(--color-border)', background: 'none', cursor: 'pointer', flexShrink: 0
              }}>
                {user?.photoURL
                    ? <img src={user.photoURL} alt="" width={34} height={34} style={{ display: 'block' }} />
                    : <div style={{ width: '100%', height: '100%', background: 'var(--color-accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', fontWeight: 600, fontSize: 13 }}>
                      {user?.displayName?.[0]?.toUpperCase() || '?'}
                    </div>
                }
              </button>
            </div>

            {/* Row 2 — filtres type + dossiers + storage */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
                {TYPE_FILTERS.map(f => (
                    <button key={f.id} onClick={() => setTypeFilter(f.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      border: typeFilter === f.id ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                      background: typeFilter === f.id ? 'var(--color-accent-dim)' : 'transparent',
                      color: typeFilter === f.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      whiteSpace: 'nowrap', cursor: 'pointer'
                    }}>
                      <i className={`fas ${f.icon}`} style={{ fontSize: 11 }} />
                      {f.label}
                    </button>
                ))}
              </div>

              {/* Séparateur */}
              {stats.folders.length > 0 && (
                  <div style={{ width: 1, height: 20, background: 'var(--color-border)', flexShrink: 0 }} />
              )}

              {/* Dossiers */}
              {stats.folders.map(f => (
                  <button key={f} onClick={() => setFolderFilter(folderFilter === f ? '' : f)} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '5px 10px', borderRadius: 20, fontSize: 12,
                    border: folderFilter === f ? '1px solid var(--color-warning)' : '1px solid var(--color-border)',
                    background: folderFilter === f ? 'rgba(251,191,36,0.1)' : 'transparent',
                    color: folderFilter === f ? 'var(--color-warning)' : 'var(--color-text-muted)',
                    whiteSpace: 'nowrap', cursor: 'pointer'
                  }}>
                    <i className="fas fa-folder" style={{ fontSize: 11 }} />
                    {f}
                  </button>
              ))}

              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{ width: 80, height: 4, background: 'var(--color-bg-3)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${storagePct}%`, background: 'var(--color-accent)', borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 11, color: 'var(--color-text-dim)', whiteSpace: 'nowrap' }}>
                {formatSize(stats.totalSize)} / 25 Go
              </span>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main style={{ flex: 1, padding: '20px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>

          {page === 'stats' ? (
              <StatsPage stats={stats} files={files} />
          ) : (
              <>
                {/* Cards stats */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  {[
                    { label: 'Fichiers', value: files.length, icon: 'fa-file', color: 'var(--color-info)' },
                    { label: 'Favoris', value: files.filter(f => f.favorite).length, icon: 'fa-star', color: 'var(--color-warning)' },
                    { label: 'Dossiers', value: stats.folders.length, icon: 'fa-folder', color: '#fbbf24' },
                    { label: 'Stockage', value: formatSize(stats.totalSize), icon: 'fa-database', color: 'var(--color-purple)' },
                  ].map(s => (
                      <div key={s.label} style={{
                        flex: 1, background: 'var(--color-bg-2)', border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)', padding: '14px 16px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <i className={`fas ${s.icon}`} style={{ fontSize: 13, color: s.color }} />
                          <span style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>{s.label}</span>
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 600 }}>{s.value}</div>
                      </div>
                  ))}
                </div>

                <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                {loading ? 'Chargement...' : `${filtered.length} fichier${filtered.length !== 1 ? 's' : ''}`}
                {folderFilter && <span style={{ color: 'var(--color-warning)', marginLeft: 6 }}>· 📁 {folderFilter}</span>}
              </span>
                </div>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                      {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} style={{
                            height: 180, background: 'var(--color-bg-2)', border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s ease infinite'
                          }} />
                      ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--color-text-dim)' }}>
                      <i className="fas fa-cloud-upload-alt" style={{ fontSize: 48, marginBottom: 16, display: 'block' }} />
                      <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                        {search ? 'Aucun résultat' : 'Aucun fichier'}
                      </p>
                      <p style={{ fontSize: 14 }}>
                        {search ? 'Essaie un autre mot clé' : 'Clique sur + pour uploader'}
                      </p>
                    </div>
                ) : view === 'grid' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                      {filtered.map((file, i) => (
                          <FileCard key={file.id} file={file} index={i}
                                    onPreview={() => setPreview(file)}
                                    onDelete={() => deleteFile(file)}
                                    onToggleFav={() => toggleFavorite(file)}
                                    onUpdateTags={(tags) => updateTags(file, tags)}
                          />
                      ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {filtered.map((file, i) => (
                          <FileList key={file.id} file={file} index={i}
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
          position: 'fixed', bottom: 28, right: 28,
          width: 52, height: 52, borderRadius: '50%',
          background: 'var(--color-accent)', border: 'none',
          color: '#0f1117', fontSize: 20, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(34,211,160,0.35)', zIndex: 40
        }}>
          <i className="fas fa-plus" />
        </button>

        {showUpload && (
            <UploadModal
                onClose={() => setShowUpload(false)}
                onUpload={uploadFile}
                folders={stats.folders}
            />
        )}
        {preview && <PreviewModal file={preview} onClose={() => setPreview(null)} />}
      </div>
  )
}