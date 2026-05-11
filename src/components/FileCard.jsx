import { useState } from 'react'
import { formatSize, formatDate } from '../hooks/useFiles'

const TYPE_CONFIG = {
    pdf:     { icon: 'fa-file-pdf',    bg: 'rgba(248,113,113,0.1)',  color: '#f87171' },
    image:   { icon: 'fa-image',       bg: 'rgba(96,165,250,0.1)',   color: '#60a5fa' },
    doc:     { icon: 'fa-file-word',   bg: 'rgba(34,211,160,0.1)',   color: '#22d3a0' },
    sheet:   { icon: 'fa-file-excel',  bg: 'rgba(74,222,128,0.1)',   color: '#4ade80' },
    video:   { icon: 'fa-film',        bg: 'rgba(244,114,182,0.1)',  color: '#f472b6' },
    audio:   { icon: 'fa-music',       bg: 'rgba(167,139,250,0.1)',  color: '#a78bfa' },
    archive: { icon: 'fa-file-zipper', bg: 'rgba(251,191,36,0.1)',   color: '#fbbf24' },
    other:   { icon: 'fa-file',        bg: 'rgba(148,163,184,0.1)',  color: '#94a3b8' },
}

export default function FileCard({ file, index, onPreview, onDelete, onToggleFav, onUpdateTags }) {
    const [hover, setHover] = useState(false)
    const [showMenu, setShowMenu] = useState(false)
    const [editTags, setEditTags] = useState(false)
    const [tagsInput, setTagsInput] = useState((file.tags || []).join(', '))
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const cfg = TYPE_CONFIG[file.type] || TYPE_CONFIG.other

    const saveTags = () => {
        const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
        onUpdateTags(tags)
        setEditTags(false)
    }

    const handleDelete = async () => {
        setDeleting(true)
        await onDelete()
        setDeleting(false)
        setConfirmDelete(false)
    }

    return (
        <div
            className="fade-in"
            style={{
                animationDelay: `${index * 0.04}s`,
                background: 'var(--color-bg-2)',
                border: `1px solid ${hover ? 'var(--color-border-hover)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-lg)', padding: '14px', cursor: 'pointer',
                transition: 'border-color 0.15s, transform 0.15s',
                transform: hover ? 'translateY(-2px)' : 'none',
                position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => { setHover(false); setShowMenu(false) }}
        >
            {file.favorite && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: 3, height: '100%',
                    background: 'var(--color-warning)', borderRadius: '3px 0 0 3px'
                }} />
            )}

            {/* Boutons d'action (hover) */}
            <div style={{
                position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4,
                opacity: hover ? 1 : 0, transition: 'opacity 0.15s'
            }}>
                <button onClick={(e) => { e.stopPropagation(); onToggleFav() }} style={{
                    width: 26, height: 26, border: '1px solid var(--color-border)', borderRadius: 7,
                    background: 'var(--color-bg-3)', color: file.favorite ? 'var(--color-warning)' : 'var(--color-text-muted)',
                    fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <i className="fas fa-star" />
                </button>

                {/* Bouton supprimer direct */}
                <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); setShowMenu(false) }} style={{
                    width: 26, height: 26, border: '1px solid rgba(248,113,113,0.3)', borderRadius: 7,
                    background: 'rgba(248,113,113,0.1)', color: '#f87171',
                    fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <i className="fas fa-trash" />
                </button>

                <button onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v) }} style={{
                    width: 26, height: 26, border: '1px solid var(--color-border)', borderRadius: 7,
                    background: 'var(--color-bg-3)', color: 'var(--color-text-muted)',
                    fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <i className="fas fa-ellipsis-vertical" />
                </button>
            </div>

            {/* Menu contextuel */}
            {showMenu && (
                <div onClick={e => e.stopPropagation()} style={{
                    position: 'absolute', top: 36, right: 8,
                    background: 'var(--color-bg-3)', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)', padding: 6, zIndex: 10,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)', minWidth: 150
                }}>
                    {[
                        { icon: 'fa-eye', label: 'Prévisualiser', action: () => { onPreview(); setShowMenu(false) } },
                        { icon: 'fa-download', label: 'Télécharger', action: () => { window.open(file.url, '_blank'); setShowMenu(false) } },
                        { icon: 'fa-tags', label: 'Modifier tags', action: () => { setEditTags(true); setShowMenu(false) } },
                        { icon: 'fa-trash', label: 'Supprimer', color: '#f87171', action: () => { setConfirmDelete(true); setShowMenu(false) } },
                    ].map(item => (
                        <button key={item.label} onClick={item.action} style={{
                            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                            padding: '7px 10px', border: 'none', borderRadius: 7,
                            background: 'transparent', color: item.color || 'var(--color-text-muted)',
                            fontSize: 12, cursor: 'pointer', textAlign: 'left'
                        }}>
                            <i className={`fas ${item.icon}`} style={{ fontSize: 12 }} />
                            {item.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Modal confirmation suppression */}
            {confirmDelete && (
                <div onClick={e => e.stopPropagation()} style={{
                    position: 'absolute', inset: 0, zIndex: 20,
                    background: 'rgba(15,17,23,0.95)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 12, padding: 16, textAlign: 'center'
                }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'rgba(248,113,113,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <i className="fas fa-trash" style={{ color: '#f87171', fontSize: 16 }} />
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                        Supprimer<br />
                        <strong style={{ color: 'var(--color-text)', fontSize: 11 }}>
                            {file.name.length > 20 ? file.name.slice(0, 20) + '...' : file.name}
                        </strong> ?
                    </p>
                    <div style={{ display: 'flex', gap: 6, width: '100%' }}>
                        <button onClick={() => setConfirmDelete(false)} style={{
                            flex: 1, padding: '7px 0', border: '1px solid var(--color-border)',
                            borderRadius: 8, background: 'transparent',
                            color: 'var(--color-text-muted)', fontSize: 12, cursor: 'pointer'
                        }}>Annuler</button>
                        <button onClick={handleDelete} disabled={deleting} style={{
                            flex: 1, padding: '7px 0', border: 'none',
                            borderRadius: 8, background: '#f87171',
                            color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 600,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
                        }}>
                            {deleting
                                ? <i className="fas fa-spinner" style={{ animation: 'spin 0.8s linear infinite' }} />
                                : <><i className="fas fa-trash" /> Supprimer</>
                            }
                        </button>
                    </div>
                </div>
            )}

            {/* Icône fichier */}
            <div onClick={onPreview} style={{
                width: 44, height: 44, borderRadius: 12, background: cfg.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10, color: cfg.color, fontSize: 20
            }}>
                <i className={`fas ${cfg.icon}`} />
            </div>

            {/* Nom */}
            <div onClick={onPreview} style={{
                fontSize: 13, fontWeight: 500, lineHeight: 1.3, marginBottom: 4,
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden'
            }}>
                {file.name}
            </div>

            {/* Méta */}
            <div style={{ fontSize: 11, color: 'var(--color-text-dim)', marginBottom: 8 }}>
                {formatSize(file.size)} · {formatDate(file.createdAt)}
            </div>

            {/* Tags */}
            {editTags ? (
                <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 4 }}>
                    <input
                        autoFocus value={tagsInput} onChange={e => setTagsInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveTags()}
                        placeholder="tag1, tag2"
                        style={{
                            flex: 1, padding: '4px 6px', fontSize: 11,
                            background: 'var(--color-bg-3)', border: '1px solid var(--color-border)',
                            borderRadius: 6, color: 'var(--color-text)', outline: 'none'
                        }}
                    />
                    <button onClick={saveTags} style={{
                        padding: '4px 6px', background: 'var(--color-accent)', border: 'none',
                        borderRadius: 6, color: '#0f1117', fontSize: 11, fontWeight: 600, cursor: 'pointer'
                    }}>OK</button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {(file.tags || []).slice(0, 3).map(tag => (
                        <span key={tag} style={{
                            padding: '2px 7px', background: 'var(--color-bg-3)',
                            border: '1px solid var(--color-border)', borderRadius: 20,
                            fontSize: 10, color: 'var(--color-text-muted)'
                        }}>#{tag}</span>
                    ))}
                </div>
            )}
        </div>
    )
}