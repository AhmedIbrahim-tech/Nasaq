/* ==========================================================================
   Nasaq Service Worker
   Version: 1.0.0
   Scope: PWA Static Shell Caching & Offline Baseline (DEC-008 Approved)
   Client Company: Sharm Photographer
   
   SECURITY & COMPLIANCE BOUNDARIES:
   1. Never caches authenticated API endpoints (/api/*) or SignalR hubs.
   2. Never caches requests containing Authorization headers.
   3. Never caches employee personal data, biometric, or token records.
   4. Never performs background location tracking or background synchronization.
   5. Only caches immutable public static assets (logos, icons, offline shell).
   ========================================================================== */

const CACHE_NAME = 'nasaq-shell-v1';

const STATIC_ASSETS = [
  '/',
  '/login',
  '/favicon.ico',
  '/icon.png',
  '/apple-icon.png',
  '/images/logos/favicon.png',
  '/images/logos/dark-logo.svg',
  '/images/logos/light-logo.svg',
  '/images/logos/logoIcon.svg',
  '/images/backgrounds/login-bg.svg',
];

// Install Event — Pre-cache critical static shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        // Individual assets failing pre-cache should not fail installation
        console.warn('[PWA SW] Pre-caching partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event — Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[PWA SW] Deleting obsolete cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event — Enforce security boundaries and serve cached shell
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Only handle GET requests; all mutations bypass SW directly
  if (request.method !== 'GET') {
    return;
  }

  // 2. Strict Security: NEVER cache or intercept API calls, SignalR, or auth requests
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.includes('/hubs/') ||
    url.pathname.includes('/swagger') ||
    request.headers.has('Authorization')
  ) {
    return; // Pass through to network with zero SW caching
  }

  // 3. For navigation requests (page visits), try network first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return caches.match('/login');
        });
      })
    );
    return;
  }

  // 4. For static shell assets, try cache first, then network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        // Only cache valid basic same-origin static responses
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic' &&
          (url.pathname.startsWith('/images/') || url.pathname.endsWith('.png') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.ico'))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});
