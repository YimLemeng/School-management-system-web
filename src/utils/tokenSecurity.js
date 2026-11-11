/**
 * Security utilities for client-side JWT validation, expiration checks, and role integrity.
 */

export const parseJwt = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  const payload = parseJwt(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  // Expired if current timestamp is past exp (subtract 5s buffer for in-flight safety)
  return payload.exp * 1000 <= Date.now() + 5000;
};

export const getTokenRoles = (token) => {
  const payload = parseJwt(token);
  if (!payload) return [];
  const rawRoles = payload.roles || payload.authorities || [];
  if (Array.isArray(rawRoles)) {
    return rawRoles
      .map((r) => (typeof r === 'string' ? r : r?.authority || ''))
      .filter(Boolean);
  }
  return [];
};

export const getTokenUsername = (token) => {
  const payload = parseJwt(token);
  return payload?.sub || null;
};

export const getTimeUntilExpiry = (token) => {
  const payload = parseJwt(token);
  if (!payload || typeof payload.exp !== 'number') return 0;
  const diff = payload.exp * 1000 - Date.now();
  return diff > 0 ? diff : 0;
};

export const isSafeTokenString = (token) => {
  if (!token || typeof token !== 'string') return false;
  const trimmed = token.trim();
  // Valid JWT structure: 3 base64url segments separated by dots, no newlines/control chars
  return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(trimmed);
};
