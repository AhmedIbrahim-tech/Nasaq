import { api } from '@/lib/api/api';

/**
 * Resolves a stored image path (e.g. /images/profile/user-1.jpg) to a browser-loadable URL.
 * Handles existing full URLs, data URIs, blob URLs, and relative paths.
 */
export function getImageUrl(path?: string | null): string {
  if (!path) return '';

  if (
    path.startsWith('blob:') ||
    path.startsWith('data:')
  ) {
    return path;
  }

  const base = (api.defaults.baseURL || 'https://localhost:7155').replace(/\/+$/, '');
  let fullUrl: string;

  if (path.startsWith('http://') || path.startsWith('https://')) {
    fullUrl = path;
  } else {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    fullUrl = `${base}${cleanPath}`;
  }

  return fullUrl;
}
