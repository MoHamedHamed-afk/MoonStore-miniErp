import { environment } from '../../environments/environment';

const trimmedBaseUrl = environment.apiBaseUrl.replace(/\/+$/, '');

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBaseUrl}${normalizedPath}`;
}

export function assetUrl(path: string | undefined, fallback = 'assets/images/placeholder.png'): string {
  if (!path) {
    return fallback;
  }

  if (path.startsWith('http') || path.startsWith('assets/')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBaseUrl}${normalizedPath}`;
}
