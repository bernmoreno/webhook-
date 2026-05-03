// api.js — resolve API URLs for dev/prod environments
const rawBase = import.meta.env.VITE_API_URL ?? '';

// Normalize trailing slash for safe concatenation
const API_BASE = rawBase.replace(/\/$/, '');

/**
 * Build a full API URL from a path.
 * - Dev default: '/api/...'(uses Vite proxy)
 * - Prod: set VITE_API_URL to your backend origin
 */
export const apiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};

export const webhookEndpoint = apiUrl('/api/webhook');
