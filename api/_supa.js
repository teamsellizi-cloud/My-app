export const SUPA_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
export const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const rest = (path, init = {}) =>
  fetch(`${SUPA_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json", ...(init.headers || {}) } });
