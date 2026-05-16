const CACHE = 'cloudvault-v1'

const STATIC = [
    '/',
    '/index.html',
    '/manifest.json',
]

// Installation — met en cache les ressources statiques
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(STATIC))
    )
    self.skipWaiting()
})

// Activation — supprime les anciens caches
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    )
    self.clients.claim()
})

// Fetch — stratégie Network First avec fallback cache
self.addEventListener('fetch', e => {
    // Ignore les requêtes non-GET et Firebase/Cloudinary
    if (e.request.method !== 'GET') return
    if (e.request.url.includes('firestore') || e.request.url.includes('cloudinary')) return

    e.respondWith(
        fetch(e.request)
            .then(res => {
                // Met en cache la réponse fraîche
                if (res.ok) {
                    const clone = res.clone()
                    caches.open(CACHE).then(cache => cache.put(e.request, clone))
                }
                return res
            })
            .catch(() => caches.match(e.request))
    )
})