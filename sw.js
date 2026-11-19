// sw.js - Ultra-lightweight passthrough service worker for PWA installation (v=V402_TRANSPARENT_FAVICON)
self.addEventListener('install', function(e) {
    self.skipWaiting();
});

self.addEventListener('activate', function(e) {
    e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(e) {
    // Bypass cross-origin (Supabase API/Storage) and non-GET requests
    if (e.request.method !== 'GET' || e.request.url.indexOf(self.location.origin) !== 0) {
        return;
    }
    // Network-first pass-through to ensure fresh real-time content
    e.respondWith(fetch(e.request).catch(function() {
        return caches.match(e.request);
    }));
});
