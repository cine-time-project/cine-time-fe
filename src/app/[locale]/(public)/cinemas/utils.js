import { config } from "@/helpers/config.js";
const API = config.apiURL;

// Prefer backend-provided URL. If empty, fall back to our binary endpoint.
// Also normalize cases where backend returns a path like "/api/cinemaimages/123".
export function resolveCinemaImage(c) {
  const raw = (c?.imageUrl || "").trim();

  if (!raw) {
    return `${API}/cinemaimages/${c.id}`;
  }

  // Absolute http(s) -> use as-is
  if (/^https?:\/\//i.test(raw)) return raw;

  // If backend returned a path starting with "/" -> stitch with server origin (strip trailing /api from base)
  if (raw.startsWith("/")) {
    const base = (API || "").replace(/\/api\/?$/, "");
    return `${base}${raw}`;
  }

  // If backend returned "api/..." or "cinemaimages/..."
  const base = (API || "").replace(/\/$/, "");
  return `${base}/${raw}`;
}

// Find the earliest future showtime date (YYYY-MM-DD) from the halls payload
export function firstUpcomingDate(halls) {
  if (!Array.isArray(halls)) return null;
  const now = new Date();
  const dates = [];

  for (const h of halls) {
    for (const m of h.movies || []) {
      for (const iso of m.times || []) {
        const d = new Date(iso);
        if (!isNaN(d) && d >= now) {
          dates.push(iso.slice(0, 10)); // YYYY-MM-DD
        }
      }
    }
  }
  if (!dates.length) return null;
  return dates.sort()[0]; // earliest day
}