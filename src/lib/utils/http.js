// src/lib/utils/http.js

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL; // e.g. http://localhost:8090/api

// ==== TEMP AUTH TOKEN FOR LOCAL TESTING ====
// Flip to false once real login is wired.
const USE_HARDCODED_TOKEN = true;

// Keep your current dev token here so it's controlled in one place.
const HARDCODED_TOKEN =
  "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJtZW1iZXJAY2luZXRpbWUubG9jYWwiLCJpYXQiOjE3NTk3MjkyNTgsImV4cCI6MTc1OTgxNTY1OH0.57nugKeynCpmW9mheudedTvsCE1r2CKqQjxE2nic1yseF1U6OYH6Z5pMvgpOaljVP5T9Nnfk8feWCtrFJVsGcQ";
// ===========================================

export function getToken() {
  try {
    if (USE_HARDCODED_TOKEN && HARDCODED_TOKEN) return HARDCODED_TOKEN;

    // Fallbacks once login is implemented
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("authToken") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        ""
      );
    }
    return "";
  } catch {
    return "";
  }
}

/**
 * Build Authorization headers (and optionally merge extra headers).
 * Usage:
 *   axios.get(url, { headers: authHeaders() })
 *   axios.post(url, data, { headers: authHeaders({ "Idempotency-Key": key }) })
 */
export function authHeaders(extra = {}) {
  const token = getToken();
  const base = token ? { Authorization: `Bearer ${String(token).trim()}` } : {};
  return { ...base, ...extra };
}
