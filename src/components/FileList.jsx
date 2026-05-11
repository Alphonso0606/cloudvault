import { useState } from 'react'
import { formatSize, formatDate } from '../hooks/useFiles'

const TYPE_CONFIG = {
    pdf:     { icon: 'fa-file-pdf',    color: '#f87171' },
    image:   { icon: 'fa-image',       color: '#60a5fa' },
    doc:     { icon: 'fa-file-word',   color: '#22d3a0' },
    sheet:   { icon: 'fa-file-excel',  color: '#4ade80' },
    video:   { icon: 'fa-film',        color: '#f472b6' },
    audio:   { icon: 'fa-music',       color: '#a78bfa' },
    archive: { icon: 'fa-file-zipper', color: '#fbbf24' },
    other:   { icon: 'fa-file',        color: '#94a3b8' },
}

export default function FileList({ file, index, onPreview, onDelete, onToggleFav }) {
    const [hover, setHover] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const cfg = TYPE_CONFIG[file.type] || TYPE_CONFIG.other

    const handleDelete = async () => {
        setDeleting(true)
        await onDelete()
        setDeleting(false)
        setConfirmDelete(false)
    }

    return (
        <>
            <div
                className="fade-in"
                style={{
                    animationDelay: `${index * 0.03}s`,
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: hover ? 'var(--color-bg-3)' : 'var(--color-bg-2)',
                    border: `1px solid ${confirmDelete ? 'rgba(248,113,113,0.4)' : hover ? 'var(--color-border-hover)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)', padding: '10px 14px',
                    cursor: 'pointer', transition: 'all 0.15s', position: 'relative'
                }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                {/* Icône type */}
                <div onClick={onPreview} style={{ color: cfg.color, fontSize: 18, width: 20, flexShrink: 0 }}>
                    <i className={`fas ${cfg.icon}`} />
                </div>

                {/* Infos */}
                <div onClick={onPreview} style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {file.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <span style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{formatSize(file.size)}</span>
                        <span style={{ color: 'var(--color-border)' }}>·</span>
                        <span style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{formatDate(file.createdAt)}</span>
                        {(file.tags || []).slice(0, 2).map(tag => (
                            <span key={tag} style={{
                                padding: '1px 6px', background: 'var(--color-bg-3)',
                                border: '1px solid var(--color-border)', borderRadius: 20,
                                fontSize: 10, color: 'var(--color-text-muted)'
                            }}>#{tag}</span>
                        ))}
                    </div>
                </div>

                {/* Confirmation inline */}
                {confirmDelete ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 12, color: '#f87171' }}>Supprimer ?</span>
                        <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(false) }} style={{
                            padding: '4px 10px', border: '1px solid var(--color-border)',
                            borderRadius: 6, background: 'transparent',
                            color: 'var(--color-text-muted)', fontSize: 12, cursor: 'pointer'
                        }}>Non</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete() }} disabled={deleting} style={{
                            padding: '4px 10px', border: 'none', borderRadius: 6,
                            background: '#f87171', color: '#fff', fontSize: 12,
                            cursor: 'pointer', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: 4
                        }}>
                            {deleting
                                ? <i className="fas fa-spinner" style={{ animation: 'spin 0.8s linear infinite' }} />
                                : <><i className="fas fa-trash" /> Oui</>
                            }
                        </button>
                    </div>
                ) : (
                    /* Boutons normaux */
                    <div style={{ display: 'flex', gap: 4, opacity: hover ? 1 : 0.3, transition: 'opacity 0.15s' }}>
                        <SmallBtn icon="fa-eye" onClick={onPreview} title="Voir" />
                        <SmallBtn icon="fa-download" onClick={() => window.open(file.url, '_blank')} title="Télécharger" />
                        <SmallBtn icon="fa-star" onClick={onToggleFav} title="Favori"
                                  color={file.favorite ? 'var(--color-warning)' : undefined} />
                        <SmallBtn icon="fa-trash" onClick={() => setConfirmDelete(true)}
                                  title="Supprimer" color="#f87171" />
                    </div>
                )}
            </div>
        </>
    )
}

function SmallBtn({ icon, onClick, title, color }) {
    const [h, setH] = useState(false)
    return (
        <button onClick={(e) => { e.stopPropagation(); onClick() }} title={title}
                onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
                style={{
                    width: 28, height: 28, border: '1px solid var(--color-border)',
                    borderRadius: 7, background: h ? 'var(--color-bg-2)' : 'transparent',
                    color: color || (h ? 'var(--color-text)' : 'var(--color-text-muted)'),
                    fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.1s', cursor: 'pointer'
                }}>
            <i className={`fas ${icon}`} />
        </button>
    )
}