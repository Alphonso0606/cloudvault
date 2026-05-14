import { formatSize } from '../hooks/useFiles'

const TYPE_CONFIG = {
    image:   { label: 'Images',   icon: 'fa-image',       color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
    pdf:     { label: 'PDF',      icon: 'fa-file-pdf',    color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
    video:   { label: 'Vidéos',   icon: 'fa-film',        color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
    doc:     { label: 'Docs',     icon: 'fa-file-word',   color: '#22d3a0', bg: 'rgba(34,211,160,0.1)' },
    audio:   { label: 'Audio',    icon: 'fa-music',       color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
    sheet:   { label: 'Tableurs', icon: 'fa-file-excel',  color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
    archive: { label: 'Archives', icon: 'fa-file-zipper', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
    other:   { label: 'Autres',   icon: 'fa-file',        color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
}

export default function StatsPage({ stats, files }) {
    const maxSize = Math.max(...Object.values(stats.byType).map(t => t.size), 1)
    const totalSize = stats.totalSize
    const storagePct = Math.min((totalSize / (25 * 1024 * 1024 * 1024)) * 100, 100)

    const recentFiles = [...files]
        .sort((a, b) => {
            const da = a.createdAt?.toDate?.() || new Date(a.createdAt || 0)
            const db2 = b.createdAt?.toDate?.() || new Date(b.createdAt || 0)
            return db2 - da
        })
        .slice(0, 5)

    return (
        <div className="fade-in">

            {/* Titre */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
                    <i className="fas fa-chart-pie" style={{ color: 'var(--color-accent)', marginRight: 10 }} />
                    Statistiques de stockage
                </h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
                    Vue d'ensemble de tes fichiers CloudVault
                </p>
            </div>

            {/* Cards résumé */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
                {[
                    { label: 'Total fichiers', value: stats.total, icon: 'fa-file', color: '#60a5fa' },
                    { label: 'Stockage utilisé', value: formatSize(totalSize), icon: 'fa-database', color: '#a78bfa' },
                    { label: 'Favoris', value: files.filter(f => f.favorite).length, icon: 'fa-star', color: '#fbbf24' },
                    { label: 'Dossiers', value: stats.folders.length, icon: 'fa-folder', color: '#fbbf24' },
                ].map(s => (
                    <div key={s.label} style={{
                        background: 'var(--color-bg-2)', border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)', padding: '18px 20px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className={`fas ${s.icon}`} style={{ fontSize: 13, color: s.color }} />
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>{s.label}</span>
                        </div>
                        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.5px' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Barre stockage Cloudinary */}
            <div style={{
                background: 'var(--color-bg-2)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 20
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>Stockage Cloudinary</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Plan gratuit · 25 Go inclus</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 20, fontWeight: 600 }}>{formatSize(totalSize)}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>/ 25 Go</div>
                    </div>
                </div>
                <div style={{ height: 10, background: 'var(--color-bg-3)', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', borderRadius: 6, transition: 'width 0.8s ease',
                        width: `${storagePct}%`,
                        background: storagePct > 80 ? '#f87171' : storagePct > 60 ? '#fbbf24' : 'var(--color-accent)'
                    }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{storagePct.toFixed(1)}% utilisé</span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{formatSize((25 * 1024 * 1024 * 1024) - totalSize)} restant</span>
                </div>
            </div>

            {/* Répartition par type */}
            <div style={{
                background: 'var(--color-bg-2)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 20
            }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>
                    <i className="fas fa-chart-bar" style={{ color: 'var(--color-accent)', marginRight: 8 }} />
                    Répartition par type de fichier
                </div>
                {Object.entries(stats.byType).length === 0 ? (
                    <p style={{ color: 'var(--color-text-dim)', fontSize: 14 }}>Aucun fichier encore uploadé.</p>
                ) : (
                    Object.entries(stats.byType)
                        .sort((a, b) => b[1].size - a[1].size)
                        .map(([type, data]) => {
                            const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.other
                            const pct = Math.round((data.size / Math.max(maxSize, 1)) * 100)
                            return (
                                <div key={type} style={{ marginBottom: 14 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 26, height: 26, borderRadius: 7, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className={`fas ${cfg.icon}`} style={{ fontSize: 12, color: cfg.color }} />
                                            </div>
                                            <span style={{ fontSize: 13, fontWeight: 500 }}>{cfg.label}</span>
                                            <span style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{data.count} fichier{data.count > 1 ? 's' : ''}</span>
                                        </div>
                                        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{formatSize(data.size)}</span>
                                    </div>
                                    <div style={{ height: 6, background: 'var(--color-bg-3)', borderRadius: 4, overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', borderRadius: 4, background: cfg.color,
                                            width: `${pct}%`, transition: 'width 0.6s ease', opacity: 0.8
                                        }} />
                                    </div>
                                </div>
                            )
                        })
                )}
            </div>

            {/* Fichiers récents */}
            <div style={{
                background: 'var(--color-bg-2)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', padding: '20px 24px'
            }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>
                    <i className="fas fa-clock" style={{ color: 'var(--color-accent)', marginRight: 8 }} />
                    5 derniers fichiers ajoutés
                </div>
                {recentFiles.map((file, i) => {
                    const cfg = TYPE_CONFIG[file.type] || TYPE_CONFIG.other
                    return (
                        <div key={file.id} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '8px 0',
                            borderBottom: i < recentFiles.length - 1 ? '1px solid var(--color-border)' : 'none'
                        }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <i className={`fas ${cfg.icon}`} style={{ fontSize: 13, color: cfg.color }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {file.name}
                                </div>
                                {file.folder && (
                                    <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>
                                        <i className="fas fa-folder" style={{ marginRight: 4, color: '#fbbf24', fontSize: 10 }} />
                                        {file.folder}
                                    </div>
                                )}
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--color-text-dim)', flexShrink: 0 }}>
                {formatSize(file.size)}
              </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}