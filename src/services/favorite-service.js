import {
  FAVORITE_MOVIES_AUTH_API,
  favoriteMovieApi,
} from "@/helpers/api-routes";
import { authHeaders } from "@/lib/utils/http";

async function dbg(res) {
  const txt = await res.text().catch(() => "");
  console.error("[favorites]", res.status, txt?.slice?.(0, 300));
}

// Loginli kullanıcının favori film ID'lerini getir (DB)
export async function fetchFavoriteMovieIds() {
  const res = await fetch(FAVORITE_MOVIES_AUTH_API, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    cache: "no-store",
  });
  if (!res.ok) { await dbg(res); throw new Error("Failed to load favorites"); }
  const data = await res.json();
  const list = Array.isArray(data?.object) ? data.object : Array.isArray(data) ? data : [];
  return list.map(Number);
}

// Favoriye ekle (idempotent kabul)
export async function addFavoriteMovie(movieId) {
  const res = await fetch(favoriteMovieApi(movieId), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  if (!res.ok) { await dbg(res); throw new Error("Failed to add favorite"); }
  return true;
}

// Favoriden çıkar (idempotent kabul)
export async function removeFavoriteMovie(movieId) {
  const res = await fetch(favoriteMovieApi(movieId), {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  if (!res.ok) { await dbg(res); throw new Error("Failed to remove favorite"); }
  return true;
}
