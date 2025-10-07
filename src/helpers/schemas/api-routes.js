// src/helpers/api-routes.js
// Env'den oku, yoksa güvenli bir fallback ver. Sondaki "/" varsa at.
const PUBLIC = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8090/api").replace(/\/$/, "");

export const API_BASE = PUBLIC; // örn: http://localhost:8100/api

// DİKKAT: tireli path
export const CONTACT_CREATE_API = `${API_BASE}/contactmessages`;
