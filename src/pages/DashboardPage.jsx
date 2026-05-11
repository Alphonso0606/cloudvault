import { useState, useMemo, useRef } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../hooks/useAuth'
import { useFiles, formatSize, formatDate, getFileType } from '../hooks/useFiles'
import FileCard from '../components/FileCard'
import FileList from '../components/FileList'
import UploadModal from '../components/UploadModal'
import PreviewModal from '../components/PreviewModal'

const FILTERS = [
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
  const { files, loading, uploadFile, deleteFile, toggleFavorite, updateTags } = useFiles(user?.uid)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState('grid') // 'grid' | 'list'
  const [sort, setSort] = useState('date') // 'date' | 'name' | 'size'
  const [showUpload, setShowUpload] = useState(false)
  const [preview, setPreview] = useState(null)

  const filtered = useMemo(() => {
    let f = [...files]

    // Filtre par type / favori
    if (filter === 'favorite') f = f.filter(x => x.favorite)
    else if (filter !== 'all') f = f.filter(x => x.type === filter)

    // Recherche (nom + tags)
    if (search.trim()) {
      const q = search.toLowerCase()
      f = f.filter(x =>
        x.name.toLowerCase().includes(q) ||
        (x.tags || []).some(t => t.toLowerCase().includes(q))
      )
    }

    // Tri
    f.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'size') return (b.size || 0) - (a.size || 0)
      const da = a.createdAt?.toDate?.() || new Date(a.createdAt || 0)
      const db2 = b.createdAt?.toDate?.() || new Date(b.createdAt || 0)
      return db2 - da
    })

    return f
  }, [files, filter, search, sort])

  const totalSize = useMemo(() => files.reduce((a, f) => a + (f.size || 0), 0), [files])
  const storagePct = Math.min((totalSize / (5 * 1024 * 1024 * 1024)) * 100, 100)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>

      {/* TOPBAR */}
      <header style={{
        background: 'var(--color-bg-2)', borderBottom: '1px solid var(--color-border)',
        padding: '0 20px', position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Row 1: logo + search + actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
              <div style={{
                width: 32, height: 32, background: 'var(--color-accent-dim)', borderRadius: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-accent)', fontSize: 14
              }}>
                <i className="fas fa-cloud" />
              </div>
              <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.3px' }}>CloudVault</span>
            </div>

            {/* Barre de recherche */}
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
                  borderRadius: 'var(--radius-md)', color: 'var(--color-text)', fontSize: 14,
                  outline: 'none', transition: 'border-color 0.15s'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(34,211,160,0.4)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--color-text-dim)', fontSize: 13
                }}>
                  <i className="fas fa-times" />
                </button>
              )}
            </div>

            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value)} style={{
              background: 'var(--color-bg-3)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)', fontSize: 13,
              padding: '8px 10px', outline: 'none'
            }}>
              <option value="date">Date</option>
              <option value="name">Nom</option>
              <option value="size">Taille</option>
            </select>

            {/* View toggle */}
            <div style={{ display: 'flex', gap: 2, background: 'var(--color-bg-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 3 }}>
              {['grid', 'list'].map(v => (
                <button key={v} onClick={() => setView(v)} style={{
                  width: 30, height: 30, border: 'none',
                  borderRadius: 7, fontSize: 13,
                  background: view === v ? 'rgba(34,211,160,0.15)' : 'transparent',
                  color: view === v ? 'var(--color-accent)' : 'var(--color-text-dim)',
                  transition: 'all 0.15s'
                }}>
                  <i className={`fas fa-${v === 'grid' ? 'grip' : 'list'}`} />
                </button>
              ))}
            </div>

            {/* User avatar */}
            <button onClick={() => signOut(auth)} title="Se déconnecter" style={{
              width: 34, height: 34, borderRadius: '50%', overflow: 'hidden',
              border: '1.5px solid var(--color-border)', background: 'none', flexShrink: 0
            }}>
              {user?.photoURL
                ? <img src={user.photoURL} alt="" width={34} height={34} />
                : <div style={{ width: '100%', height: '100%', background: 'var(--color-accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', fontWeight: 600, fontSize: 13 }}>
                  {user?.displayName?.[0]?.toUpperCase() || '?'}
                </div>
              }
            </button>
          </div>

          {/* Row 2: filtres + storage bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 12 }}>
            <div style={{ display: 'flex', gap: 6, flex: 1, overflowX: 'auto', paddingBottom: 2 }}>
              {FILTERS.map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  border: filter === f.id ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                  background: filter === f.id ? 'var(--color-accent-dim)' : 'transparent',
                  color: filter === f.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  whiteSpace: 'nowrap', transition: 'all 0.15s', cursor: 'pointer'
                }}>
                  <i className={`fas ${f.icon}`} style={{ fontSize: 11 }} />
                  {f.label}
                </button>
              ))}
            </div>

            {/* Storage indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{ width: 80, height: 4, background: 'var(--color-bg-3)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${storagePct}%`, background: storagePct > 80 ? 'var(--color-danger)' : 'var(--color-accent)', borderRadius: 4, transition: 'width 0.5s' }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--color-text-dim)', whiteSpace: 'nowrap' }}>
                {formatSize(totalSize)} / 5 Go
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '20px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>

        {/* Stats rapides */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Fichiers', value: files.length, icon: 'fa-file', color: 'var(--color-info)' },
            { label: 'Favoris', value: files.filter(f => f.favorite).length, icon: 'fa-star', color: 'var(--color-warning)' },
            { label: 'Images', value: files.filter(f => f.type === 'image').length, icon: 'fa-image', color: 'var(--color-accent)' },
            { label: 'Stockage', value: formatSize(totalSize), icon: 'fa-database', color: 'var(--color-purple)' },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, background: 'var(--color-bg-2)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)', padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <i className={`fas ${s.icon}`} style={{ fontSize: 13, color: s.color }} />
                <span style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Résultats */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            {loading ? 'Chargement...' : `${filtered.length} fichier${filtered.length !== 1 ? 's' : ''}`}
            {search && <span style={{ color: 'var(--color-text-dim)' }}> · "{search}"</span>}
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                height: 180, background: 'var(--color-bg-2)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s ease infinite',
                animationDelay: `${i * 0.1}s`
              }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--color-text-dim)' }}>
            <i className="fas fa-cloud-upload-alt" style={{ fontSize: 48, marginBottom: 16, display: 'block', color: 'var(--color-border)' }} />
            <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 8 }}>
              {search ? 'Aucun résultat' : 'Aucun fichier'}
            </p>
            <p style={{ fontSize: 14 }}>
              {search ? 'Essaie un autre mot clé ou tag' : 'Clique sur + pour uploader ton premier fichier'}
            </p>
          </div>
        ) : view === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {filtered.map((file, i) => (
              <FileCard
                key={file.id} file={file} index={i}
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
              <FileList
                key={file.id} file={file} index={i}
                onPreview={() => setPreview(file)}
                onDelete={() => deleteFile(file)}
                onToggleFav={() => toggleFavorite(file)}
              />
            ))}
          </div>
        )}
      </main>

      {/* FAB - Upload */}
      <button onClick={() => setShowUpload(true)} style={{
        position: 'fixed', bottom: 28, right: 28,
        width: 52, height: 52, borderRadius: '50%',
        background: 'var(--color-accent)', border: 'none',
        color: '#0f1117', fontSize: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(34,211,160,0.35)',
        transition: 'transform 0.15s, box-shadow 0.15s',
        zIndex: 40
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(34,211,160,0.5)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(34,211,160,0.35)' }}
        title="Uploader un fichier"
      >
        <i className="fas fa-plus" />
      </button>

      {/* Modals */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUpload={uploadFile}
        />
      )}
      {preview && (
        <PreviewModal
          file={preview}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  )
}
