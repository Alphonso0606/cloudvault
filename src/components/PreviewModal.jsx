import { formatSize, formatDate } from '../hooks/useFiles'

export default function PreviewModal({ file, onClose }) {
  const renderPreview = () => {
    if (file.type === 'image') return (
      <img src={file.url} alt={file.name} style={{
        maxWidth: '100%', maxHeight: '70vh', borderRadius: 'var(--radius-md)',
        objectFit: 'contain', display: 'block', margin: '0 auto'
      }} />
    )
    if (file.type === 'pdf') return (
      <iframe src={file.url} style={{ width: '100%', height: '70vh', border: 'none', borderRadius: 'var(--radius-md)' }} title={file.name} />
    )
    if (file.type === 'video') return (
      <video src={file.url} controls style={{ width: '100%', maxHeight: '70vh', borderRadius: 'var(--radius-md)' }} />
    )
    if (file.type === 'audio') return (
      <div style={{ padding: '30px 0', textAlign: 'center' }}>
        <i className="fas fa-music" style={{ fontSize: 60, color: 'var(--color-purple)', marginBottom: 20, display: 'block' }} />
        <audio src={file.url} controls style={{ width: '100%' }} />
      </div>
    )
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <i className="fas fa-file" style={{ fontSize: 64, color: 'var(--color-text-dim)', display: 'block', marginBottom: 16 }} />
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 20 }}>Pas de prévisualisation disponible</p>
        <a href={file.url} target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', background: 'var(--color-accent)',
          color: '#0f1117', borderRadius: 'var(--radius-md)', fontWeight: 500, fontSize: 14
        }}>
          <i className="fas fa-download" /> Télécharger
        </a>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 20, backdropFilter: 'blur(6px)'
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fade-in" style={{
        background: 'var(--color-bg-2)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 800,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 30px 80px rgba(0,0,0,0.6)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px', borderBottom: '1px solid var(--color-border)'
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {file.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-dim)', marginTop: 2 }}>
              {formatSize(file.size)} · {formatDate(file.createdAt)}
              {(file.tags || []).length > 0 && (
                <span style={{ marginLeft: 8 }}>
                  {file.tags.map(t => `#${t}`).join(' ')}
                </span>
              )}
            </div>
          </div>
          <a href={file.url} target="_blank" rel="noopener noreferrer" title="Télécharger" style={{
            width: 34, height: 34, border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-text-muted)', fontSize: 14
          }}>
            <i className="fas fa-download" />
          </a>
          <button onClick={onClose} style={{
            width: 34, height: 34, border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', background: 'none',
            color: 'var(--color-text-muted)', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Preview area */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {renderPreview()}
        </div>
      </div>
    </div>
  )
}
