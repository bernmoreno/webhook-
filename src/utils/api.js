// api.js — resolve API URLs for dev/prod environments
const rawBase = import.meta.env.VITE_API_URL ?? '';

// Normalize trailing slash for safe concatenation
const API_BASE = rawBase.replace(/\/$/, '');
const isProd = import.meta.env.PROD;

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
export const isApiConfigured = !isProd || Boolean(API_BASE);

export const apiSetupHint =
  'Set VITE_API_URL to your deployed backend origin (for example: https://your-backend.onrender.com).';

export const parseJsonSafe = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

export const formatApiError = (status, fallback = 'Request failed') => {
  if (isProd && !isApiConfigured && status === 404) {
    return `${fallback}: ${status}. ${apiSetupHint}`;
  }

  return `${fallback}: ${status}`;
};
