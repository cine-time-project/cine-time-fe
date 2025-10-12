// src/services/movie-serviceDP.js
// FE → BE kök adresleri
const RAW = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8100/api").replace(/\/$/, "");
const API_BASE = RAW;                        // ör: http://localhost:8100/api
const ORIGIN   = RAW.replace(/\/api$/, "");  // ör: http://localhost:8100
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE || ORIGIN;

/** ResponseMessage sarmalayıcısını aç (returnBody | object | direct) */
async function unwrap(res) {
  if (!res.ok) {
    let txt = "";
    try { txt = await res.text(); } catch {}
    throw new Error(`HTTP ${res.status} ${txt || ""}`);
  }
  // BE bazen ResponseMessage{returnBody: ...}, bazen object, bazen düz DTO döndürüyor
  const json = await res.json();
  return json?.returnBody ?? json?.object ?? json;
}

/** relative → absolute URL (görseller için) */
function absUrl(u) {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/")) return ASSET_BASE + u;
  return ASSET_BASE + "/" + u;
}

/** images[] içinden poster/backdrop seç (varsa) */
function pickFromImages(images = []) {
  if (!Array.isArray(images)) return {};
  const byType = (re) =>
    images.find((x) => re.test(String(x?.type || x?.imageType || x?.kind || "")))?.url
    || images.find((x) => re.test(String(x?.name || "")))?.url;

  const poster =
    byType(/poster|cover/i) ||
    images.find((x) => x?.isPoster)?.url ||
    images[0]?.url;

  const backdrop =
    byType(/backdrop|background|hero/i) ||
    images.find((x) => x?.isBackdrop)?.url;

  return { poster, backdrop };
}

/** BE -> UI normalize */
function normalizeMovie(dto = {}) {
  const imgs = pickFromImages(dto.images || dto.imageList || dto.media || []);
  const posterRaw   = dto.posterUrl   || dto.poster   || dto.posterPath   || imgs.poster;
  const backdropRaw = dto.backdropUrl || dto.backdrop || dto.backdropPath || dto.heroImage || imgs.backdrop;

  return {
    id: dto.id,
    title: dto.title,
    slug: dto.slug || dto.title?.toLowerCase().replace(/\s+/g, "-"),
    summary: dto.summary || dto.overview,
    rating: dto.imdbRating ?? dto.rating ?? null,         // 0..10
    releaseDate: dto.releaseDate,
    releaseYear: dto.releaseYear || (dto.releaseDate ? new Date(dto.releaseDate).getFullYear() : null),
    duration: dto.duration || dto.runtime || null,        // dakika
    genres: dto.genres || dto.genre || [],
    director: dto.director,
    cast: dto.cast || dto.actors || [],
    posterUrl: absUrl(posterRaw),
    backdropUrl: absUrl(backdropRaw),
    trailerUrl: dto.trailerUrl,
    status: dto.status,
    specialHalls: dto.specialHalls || "",
    formats: dto.formats || [],
  };
}

/* ===========================
   PUBLIC API FONKSİYONLARI
   =========================== */

/** Hero için tekil film */
export async function getMovieById(id) {
  const res = await fetch(`${API_BASE}/movies/id/${id}`, { next: { revalidate: 0 } });
  const dto = await unwrap(res);
  return normalizeMovie(dto);
}

/** Arama (slug metni için fallback) */
export async function searchMovies(q = "", page = 0, size = 10) {
  const url = new URL(`${API_BASE}/movies/search`);
  if (q) url.searchParams.set("q", q);
  url.searchParams.set("page", page);
  url.searchParams.set("size", size);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  const data = await unwrap(res);
  const content = (data.content || data.items || []).map(normalizeMovie);
  return { ...data, content };
}

/** Status filtresi gerekiyorsa (opsiyon) */
export async function getMoviesByStatus(status, page = 0, size = 10) {
  const url = new URL(`${API_BASE}/movies/status`);
  if (status) url.searchParams.set("status", status);
  url.searchParams.set("page", page);
  url.searchParams.set("size", size);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  const data = await unwrap(res);
  const content = (data.content || data.items || []).map(normalizeMovie);
  return { ...data, content };
}

/** Vizyondakiler (opsiyon) */
export async function getMoviesInTheatres(date, page = 0, size = 10) {
  const url = new URL(`${API_BASE}/movies/in-theatres`);
  if (date) url.searchParams.set("date", date);
  url.searchParams.set("page", page);
  url.searchParams.set("size", size);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  const data = await unwrap(res);
  const content = (data.content || data.items || []).map(normalizeMovie);
  return { ...data, content };
}

/** Yakında (opsiyon) */
export async function getComingSoonMovies(date, page = 0, size = 10) {
  const url = new URL(`${API_BASE}/movies/coming-soon`);
  if (date) url.searchParams.set("date", date);
  url.searchParams.set("page", page);
  url.searchParams.set("size", size);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  const data = await unwrap(res);
  const content = (data.content || data.items || []).map(normalizeMovie);
  return { ...data, content };
}

/** Genel sayfalı liste (BE’de düz /movies yoksa boş arama ile) */
export async function getMoviesPaged(page = 0, size = 10) {
  return searchMovies("", page, size);
}
