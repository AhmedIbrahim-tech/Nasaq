'use client';

import { useEffect } from 'react';

/**
 * ServiceWorkerRegister
 * 
 * Registers the Nasaq PWA service worker on mount.
 * 
 * Compliance & Privacy Constraints:
 * 1. Zero permission prompts on startup (no GPS/geolocation prompts, no push prompts).
 * 2. Runs only in browser environment after window loads to avoid blocking first paint.
 * 3. Gracefully handles unsupported environments.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Periodic check for SW updates (without background polling loops)
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (
                installingWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                console.log('[PWA] New version available.');
              }
            });
          }
        });
      } catch (error) {
        console.warn('[PWA] Service Worker registration failed:', error);
      }
    };

    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW, { once: true });
    }
  }, []);

  return null;
}

export default ServiceWorkerRegister;
