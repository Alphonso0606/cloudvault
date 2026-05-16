import { useState } from 'react'

export default function SearchBar({ value, onChange, resultCount, isSearching }) {
    const [focused, setFocused] = useState(false)

    return (
        <div style={{ position: 'relative', flex: 1 }}>
            <i className="fas fa-search" style={{
                position: 'absolute', left: 11, top: '50%',
                transform: 'translateY(-50%)',
                color: focused ? 'var(--color-accent)' : 'var(--color-text-dim)',
                fontSize: 13, transition: 'color 0.15s', zIndex: 1
            }} />

            <input
                value={value}
                onChange={e => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Recherche intelligente — nom, tag, contenu du fichier..."
                style={{
                    width: '100%', padding: '9px 36px 9px 32px',
                    background: 'var(--color-bg-3)',
                    border: `1px solid ${focused ? 'rgba(34,211,160,0.5)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)', color: 'var(--color-text)',
                    fontSize: 14, outline: 'none', transition: 'border-color 0.15s'
                }}
            />

            {/* Badge IA */}
            <div style={{
                position: 'absolute', right: value ? 32 : 10, top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)',
                borderRadius: 20, padding: '2px 7px', fontSize: 10,
                color: '#a78bfa', whiteSpace: 'nowrap', pointerEvents: 'none'
            }}>
                <i className="fas fa-robot" style={{ fontSize: 10 }} />
                IA
            </div>

            {/* Clear */}
            {value && (
                <button onClick={() => onChange('')} style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--color-text-dim)',
                    cursor: 'pointer', fontSize: 13, zIndex: 1
                }}>
                    <i className="fas fa-times" />
                </button>
            )}

            {/* Résultats sous la barre */}
            {value && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                    background: 'var(--color-bg-2)', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)', padding: '6px 12px',
                    fontSize: 12, color: 'var(--color-text-muted)', zIndex: 20,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                }}>
                    <i className="fas fa-robot" style={{ color: '#a78bfa', marginRight: 6 }} />
                    {resultCount} résultat{resultCount !== 1 ? 's' : ''} — recherche dans les noms, tags et <strong style={{ color: 'var(--color-text)' }}>contenu des fichiers</strong>
                </div>
            )}
        </div>
    )
}