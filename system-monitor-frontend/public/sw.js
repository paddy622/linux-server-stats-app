const CACHE_NAME = 'system-monitor-v1.1';
const API_CACHE_NAME = 'system-monitor-api-v1';

// Static assets to cache
const urlsToCache = [
    '/',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json',
    '/logo192.png',
    '/logo512.png',
    '/ubuntu-logo.svg',
    '/favicon.ico'
];

// API endpoints to cache (with different strategy)
const apiEndpoints = ['/api/static'];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME).then((cache) => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(urlsToCache).catch((error) => {
                    console.error('Service Worker: Failed to cache static assets:', error);
                    // Cache individual files to avoid failing the entire installation
                    return Promise.allSettled(
                        urlsToCache.map(url => cache.add(url).catch(err => console.log(`Failed to cache ${url}:`, err)))
                    );
                });
            }),
            caches.open(API_CACHE_NAME).then(() => {
                console.log('Service Worker: API cache opened');
            })
        ])
    );
    // Force activation
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Take control of all pages
            return self.clients.claim();
        })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Handle API requests
    if (url.pathname.includes('/api/')) {
        event.respondWith(handleApiRequest(event.request));
        return;
    }

    // Handle WebSocket requests (don't cache)
    if (event.request.url.includes('ws://') || event.request.url.includes('wss://')) {
        return; // Let the request go through normally
    }

    // Handle static assets
    event.respondWith(handleStaticRequest(event.request));
});

// API request handler - Network first, cache fallback
async function handleApiRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);

        // If successful, update cache and return response
        if (networkResponse.ok) {
            const cache = await caches.open(API_CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }

        throw new Error('Network response not ok');
    } catch (error) {
        console.log('Service Worker: Network failed, trying cache for API request');

        // Try cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline response
        return new Response(
            JSON.stringify({
                error: 'Offline',
                message: 'No network connection available and no cached data found',
                timestamp: Date.now()
            }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Static request handler - Cache first, network fallback
async function handleStaticRequest(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Try network
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Both cache and network failed for:', request.url);

        // Return a basic offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/') || new Response(
                '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your connection and try again.</p></body></html>',
                { headers: { 'Content-Type': 'text/html' } }
            );
        }

        throw error;
    }
}

// Background sync for API calls (when online again)
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered');
    if (event.tag === 'api-retry') {
        event.waitUntil(retryFailedApiCalls());
    }
});

async function retryFailedApiCalls() {
    // Implementation for retrying failed API calls when back online
    console.log('Service Worker: Retrying failed API calls');
}

// Push notification support
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');

    const options = {
        body: event.data ? event.data.text() : 'System Monitor Update Available',
        icon: '/logo192.png',
        badge: '/logo192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 'system-monitor-notification'
        },
        actions: [
            {
                action: 'open',
                title: 'Open App',
                icon: '/logo192.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('System Monitor', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');

    event.notification.close();

    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});
