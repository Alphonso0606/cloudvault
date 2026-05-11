import { useState, useRef, useCallback } from 'react'

export default function UploadModal({ onClose, onUpload }) {
  const [files, setFiles] = useState([])
  const [tags, setTags] = useState('')
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progresses, setProgresses] = useState({})
  const [done, setDone] = useState(false)
  const inputRef = useRef()

  const addFiles = (newFiles) => {
    const arr = Array.from(newFiles)
    setFiles(prev => [...prev, ...arr])
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }, [])

  const startUpload = async () => {
    if (!files.length) return
    setUploading(true)
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)

    await Promise.all(files.map((file, i) =>
      onUpload(file, tagList, (pct) => {
        setProgresses(p => ({ ...p, [i]: pct }))
      })
    ))

    setDone(true)
    setTimeout(onClose, 1000)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, backdropFilter: 'blur(4px)'
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="slide-up" style={{
        background: 'var(--color-bg-2)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)', padding: '28px', width: 440,
        maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>
            <i className="fas fa-upload" style={{ color: 'var(--color-accent)', marginRight: 10 }} />
            Uploader des fichiers
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--color-text-muted)',
            fontSize: 18, cursor: 'pointer'
          }}><i className="fas fa-times" /></button>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--color-accent)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-lg)', padding: '32px 20px',
            textAlign: 'center', cursor: 'pointer',
            background: dragging ? 'var(--color-accent-dim)' : 'var(--color-bg-3)',
            transition: 'all 0.15s', marginBottom: 16
          }}>
          <i className="fas fa-cloud-arrow-up" style={{
            fontSize: 36, color: dragging ? 'var(--color-accent)' : 'var(--color-text-dim)',
            display: 'block', marginBottom: 10, transition: 'color 0.15s'
          }} />
          <p style={{ fontWeight: 500, marginBottom: 4 }}>
            {dragging ? 'Lâche pour uploader' : 'Glisse tes fichiers ici'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-text-dim)' }}>ou clique pour choisir</p>
          <input ref={inputRef} type="file" multiple style={{ display: 'none' }}
            onChange={(e) => addFiles(e.target.files)} />
        </div>

        {/* Liste fichiers sélectionnés */}
        {files.length > 0 && (
          <div style={{ marginBottom: 16, maxHeight: 140, overflowY: 'auto' }}>
            {files.map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 0', borderBottom: '1px solid var(--color-border)'
              }}>
                <i className="fas fa-file" style={{ color: 'var(--color-text-dim)', fontSize: 13 }} />
                <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-text-dim)', flexShrink: 0 }}>
                  {(f.size / 1024 / 1024).toFixed(1)} Mo
                </span>
                {uploading && (
                  <div style={{ width: 50, height: 4, background: 'var(--color-bg-3)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 4, background: 'var(--color-accent)',
                      width: `${progresses[i] || 0}%`, transition: 'width 0.3s'
                    }} />
                  </div>
                )}
                {!uploading && (
                  <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-dim)', cursor: 'pointer', fontSize: 12 }}>
                    <i className="fas fa-times" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
            <i className="fas fa-tags" style={{ marginRight: 6 }} />
            Tags (séparés par une virgule)
          </label>
          <input
            value={tags} onChange={e => setTags(e.target.value)}
            placeholder="ex: travail, important, 2025"
            style={{
              width: '100%', padding: '9px 12px',
              background: 'var(--color-bg-3)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', color: 'var(--color-text)', fontSize: 14, outline: 'none'
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(34,211,160,0.4)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
          />
        </div>

        {/* Boutons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '10px 18px', background: 'transparent',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-muted)', fontSize: 14, cursor: 'pointer'
          }}>Annuler</button>
          <button onClick={startUpload} disabled={!files.length || uploading || done} style={{
            padding: '10px 24px',
            background: done ? '#22c55e' : 'var(--color-accent)',
            border: 'none', borderRadius: 'var(--radius-md)',
            color: '#0f1117', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            opacity: !files.length ? 0.5 : 1,
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            {done
              ? <><i className="fas fa-check" /> Terminé !</>
              : uploading
              ? <><i className="fas fa-spinner" style={{ animation: 'spin 0.8s linear infinite' }} /> Upload...</>
              : <><i className="fas fa-upload" /> Uploader {files.length > 0 ? `(${files.length})` : ''}</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
