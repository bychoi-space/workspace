// sw.js - Ultra-lightweight passthrough service worker for PWA installation
self.addEventListener('install', function(e) {
    self.skipWaiting();
});

self.addEventListener('activate', function(e) {
    e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(e) {
    // Network-first pass-through to ensure fresh real-time content
    e.respondWith(fetch(e.request).catch(function() {
        return caches.match(e.request);
    }));
});
