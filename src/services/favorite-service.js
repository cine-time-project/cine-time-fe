import {
  FAVORITE_MOVIES_AUTH_API,
  favoriteMovieApi,
} from "@/helpers/api-routes";
import { authHeaders } from "@/lib/utils/http";

async function dbg(res) {
  const txt = await res.text().catch(() => "");
  console.error("[favorites]", res.status, txt?.slice?.(0, 300));
}

/**
 * Loginli kullanıcının favori film ID'lerini getir (DB)
 * - BE farklı şekiller dönebilir; hepsine dayanıklı parse ediyoruz.
 * - Authorization header zorunlu.
 */
export async function fetchFavoriteMovieIds() {
  const res = await fetch(FAVORITE_MOVIES_AUTH_API, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    cache: "no-store",
  });
  if (!res.ok) { await dbg(res); throw new Error("Failed to load favorites"); }

  const data = await res.json();

  // Olası şekiller:
  // [1,2,3]
  // { object: [1,2,3] }
  // { returnBody: { object: [1,2,3] } }
  // [{ movieId: 1 }, { movie: { id: 2 } }, ...]
  const candidate =
    data?.object ??
    data?.returnBody?.object ??
    data?.returnBody ??
    data;

  let list = Array.isArray(candidate) ? candidate : [];
  list = list
    .map((x) => {
      if (typeof x === "number") return x;
      if (typeof x === "string") return Number(x);
      return Number(x?.movieId ?? x?.movie?.id ?? x?.id ?? NaN);
    })
    .filter(Number.isFinite);

  return list;
}

/**
 * Favoriye ekle (idempotent)
 * - 409 (already exists) -> başarı say
 */
export async function addFavoriteMovie(movieId) {
  const res = await fetch(favoriteMovieApi(movieId), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  if (!res.ok && res.status !== 409) { // 409 => zaten favoride
    await dbg(res);
    throw new Error("Failed to add favorite");
  }
  return true;
}

/**
 * Favoriden çıkar (idempotent)
 * - 404 (already gone) -> başarı say
 */
export async function removeFavoriteMovie(movieId) {
  const res = await fetch(favoriteMovieApi(movieId), {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  if (!res.ok && res.status !== 404) { // 404 => zaten yok
    await dbg(res);
    throw new Error("Failed to remove favorite");
  }
  return true;
}
