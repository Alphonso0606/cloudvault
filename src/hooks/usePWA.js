import { useState, useEffect } from 'react'

export function usePWA() {
    const [installPrompt, setInstallPrompt] = useState(null)
    const [isInstalled, setIsInstalled]     = useState(false)
    const [isIOS, setIsIOS]                 = useState(false)

    useEffect(() => {
        // Détecte iOS
        const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
        setIsIOS(ios)

        // Détecte si déjà installée
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
        }

        // Capture l'événement d'installation (Android/Desktop)
        const handler = e => {
            e.preventDefault()
            setInstallPrompt(e)
        }
        window.addEventListener('beforeinstallprompt', handler)

        // Détecte l'installation réussie
        window.addEventListener('appinstalled', () => setIsInstalled(true))

        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const install = async () => {
        if (!installPrompt) return
        await installPrompt.prompt()
        const { outcome } = await installPrompt.userChoice
        if (outcome === 'accepted') setIsInstalled(true)
        setInstallPrompt(null)
    }

    const canInstall = !isInstalled && (!!installPrompt || isIOS)

    return { install, isInstalled, isIOS, canInstall }
}