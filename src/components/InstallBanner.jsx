import { useState } from 'react'
import { usePWA } from '../hooks/usePWA'

export default function InstallBanner() {
    const { install, isIOS, canInstall } = usePWA()
    const [dismissed, setDismissed] = useState(
        () => localStorage.getItem('cv-install-dismissed') === '1'
    )

    if (!canInstall || dismissed) return null

    const dismiss = () => {
        localStorage.setItem('cv-install-dismissed', '1')
        setDismissed(true)
    }

    return (
        <div className="slide-up" style={{
            position: 'fixed', bottom: 70, left: 12, right: 12, zIndex: 60,
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)', padding: '14px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', gap: 12
        }}>
            {/* Icône app */}
            <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: 'var(--accent-dim)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent)', fontSize: 22
            }}>
                <i className="fas fa-cloud" />
            </div>

            {/* Texte */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                    Installer CloudVault
                </p>
                {isIOS ? (
                    <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.4 }}>
                        Appuie sur <i className="fas fa-arrow-up-from-bracket" /> puis "Sur l'écran d'accueil"
                    </p>
                ) : (
                    <p style={{ fontSize: 11, color: 'var(--text2)' }}>
                        Accès rapide depuis ton écran d'accueil
                    </p>
                )}
            </div>

            {/* Boutons */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={dismiss} style={{
                    padding: '6px 10px', border: '1px solid var(--border)',
                    borderRadius: 8, background: 'transparent',
                    color: 'var(--text2)', fontSize: 12, cursor: 'pointer'
                }}>
                    Plus tard
                </button>
                {!isIOS && (
                    <button onClick={install} style={{
                        padding: '6px 12px', border: 'none',
                        borderRadius: 8, background: 'var(--accent)',
                        color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 5
                    }}>
                        <i className="fas fa-download" style={{ fontSize: 11 }} />
                        Installer
                    </button>
                )}
            </div>
        </div>
    )
}