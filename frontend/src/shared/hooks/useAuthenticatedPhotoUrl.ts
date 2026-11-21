'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api/api';
import { Router } from '@/lib/api/router';

// In-memory blob cache by normalized photoId to avoid redundant network roundtrips
const blobCache = new Map<string, string>();

// In-flight request deduplication map to prevent parallel duplicate fetches
const inFlightRequests = new Map<string, Promise<string | null>>();

const PHOTO_INVALIDATION_EVENT = 'nasaq-photo-invalidated';

/**
 * Normalizes a photo identifier (GUID) for case-insensitive caching.
 */
function normalizeId(id?: string | null): string | null {
  if (!id) return null;
  const trimmed = id.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Seeds the blob cache directly with an existing object URL (e.g. from local file upload preview).
 */
export function setCachedPhotoBlob(photoId: string, objectUrl: string): void {
  const normId = normalizeId(photoId);
  if (normId && objectUrl) {
    blobCache.set(normId, objectUrl);
  }
}

/**
 * Invalidates and revokes an authenticated photo blob URL from memory cache.
 */
export function invalidatePhotoBlob(photoId?: string | null): void {
  if (!photoId) {
    // If no ID passed, revoke all cached blobs
    blobCache.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // Ignore revocation errors
      }
    });
    blobCache.clear();
    inFlightRequests.clear();
    return;
  }

  const normId = normalizeId(photoId);
  if (!normId) return;

  const existingUrl = blobCache.get(normId);
  if (existingUrl) {
    try {
      URL.revokeObjectURL(existingUrl);
    } catch {
      // Ignore revocation errors
    }
    blobCache.delete(normId);
  }
  inFlightRequests.delete(normId);
}

/**
 * Broadcasts a photo invalidation event to all active React hook listeners across the application.
 */
export function broadcastPhotoInvalidation(photoId?: string | null): void {
  invalidatePhotoBlob(photoId);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(PHOTO_INVALIDATION_EVENT, {
        detail: { photoId: normalizeId(photoId) },
      })
    );
  }
}

/**
 * Custom React hook to fetch and render authenticated profile photos via Axios Bearer tokens.
 * Automatically handles blob caching, loading, errors, parallel request deduplication, and cross-component synchronization.
 */
export function useAuthenticatedPhotoUrl(photoId?: string | null): string | null {
  const normId = normalizeId(photoId);

  const [photoUrl, setPhotoUrl] = useState<string | null>(() => {
    if (!normId) return null;
    return blobCache.get(normId) || null;
  });

  const fetchPhoto = useCallback((targetId: string) => {
    // Check cache first
    if (blobCache.has(targetId)) {
      setPhotoUrl(blobCache.get(targetId)!);
      return;
    }

    // Check in-flight requests for deduplication
    if (inFlightRequests.has(targetId)) {
      inFlightRequests.get(targetId)!.then((url) => {
        setPhotoUrl(url);
      });
      return;
    }

    // Initiate new authenticated request
    const downloadUrl = Router.Files.Download(targetId);
    const requestPromise = api
      .get(downloadUrl, { responseType: 'blob' })
      .then((response) => {
        const objectUrl = URL.createObjectURL(response.data);
        blobCache.set(targetId, objectUrl);
        inFlightRequests.delete(targetId);
        return objectUrl;
      })
      .catch(() => {
        inFlightRequests.delete(targetId);
        return null;
      });

    inFlightRequests.set(targetId, requestPromise);

    requestPromise.then((url) => {
      setPhotoUrl(url);
    });
  }, []);

  useEffect(() => {
    if (!normId) {
      setPhotoUrl(null);
      return;
    }

    // Immediately reflect cache if present, otherwise clear state before fetching
    if (blobCache.has(normId)) {
      setPhotoUrl(blobCache.get(normId)!);
    } else {
      setPhotoUrl(null);
      fetchPhoto(normId);
    }

    // Listen for invalidation events
    const handleInvalidation = (e: Event) => {
      const customEvent = e as CustomEvent<{ photoId: string | null }>;
      const invalidatedId = customEvent.detail?.photoId;
      if (!invalidatedId || invalidatedId === normId) {
        setPhotoUrl(null);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(PHOTO_INVALIDATION_EVENT, handleInvalidation);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(PHOTO_INVALIDATION_EVENT, handleInvalidation);
      }
    };
  }, [normId, fetchPhoto]);

  return photoUrl;
}
