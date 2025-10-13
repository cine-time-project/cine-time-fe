
import {
  movieByIdApi,
  MOVIE_SEARCH_API,
  MOVIE_STATUS_API,
  MOVIES_IN_THEATRES_API,
  MOVIES_COMING_SOON_API,
  MOVIE_BY_GENRE_API,
  MOVIE_BY_SLUG_API,  
} from "@/helpers/api-routes";




 const ASSET_BASE =
   process.env.NEXT_PUBLIC_ASSET_BASE ||
   (() => {
     try {
       // MOVIE_SEARCH_API zaten mutlak (api-routes config.apiURL’den kuruyor)
       return new URL(MOVIE_SEARCH_API).origin; // örn: http://localhost:8100
     } catch {
       return "";
     }
   })();

/** ResponseMessage sarmalayıcısını aç (returnBody | object | direct) */
async function unwrap(res) {
  if (!res.ok) {
    let txt = "";
    try { txt = await res.text(); } catch {}
    throw new Error(`HTTP ${res.status} ${txt || ""}`);
  }
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
    rating: dto.imdbRating ?? dto.rating ?? null,
    releaseDate: dto.releaseDate,
    releaseYear: dto.releaseYear || (dto.releaseDate ? new Date(dto.releaseDate).getFullYear() : null),
    duration: dto.duration || dto.runtime || null,
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

export async function getMovieById(id) {
  const res = await fetch(movieByIdApi(id), { next: { revalidate: 0 } });
  const dto = await unwrap(res);
  return normalizeMovie(dto);
}

export async function searchMovies(q = "", page = 0, size = 10) {
  const url = new URL(MOVIE_SEARCH_API);
  if (q) url.searchParams.set("q", q);
  url.searchParams.set("page", page);
  url.searchParams.set("size", size);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  const data = await unwrap(res);
  const content = (data.content || data.items || []).map(normalizeMovie);
  return { ...data, content };
}
// Genel sayfalı liste (BE’de düz /movies yoksa boş arama ile)
export async function getMoviesPaged(page = 0, size = 10) {
  return searchMovies("", page, size);
}


export async function getMoviesByStatus(status, page = 0, size = 10) {
  const url = new URL(MOVIE_STATUS_API);
  if (status) url.searchParams.set("status", status);
  url.searchParams.set("page", page);
  url.searchParams.set("size", size);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  const data = await unwrap(res);
  const content = (data.content || data.items || []).map(normalizeMovie);
  return { ...data, content };
}

export async function getMoviesInTheatres(date, page = 0, size = 10) {
  const url = new URL(MOVIES_IN_THEATRES_API);
  if (date) url.searchParams.set("date", date);
  url.searchParams.set("page", page);
  url.searchParams.set("size", size);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  const data = await unwrap(res);
  const content = (data.content || data.items || []).map(normalizeMovie);
  return { ...data, content };
}

export async function getComingSoonMovies(date, page = 0, size = 10) {
  const url = new URL(MOVIES_COMING_SOON_API);
  if (date) url.searchParams.set("date", date);
  url.searchParams.set("page", page);
  url.searchParams.set("size", size);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  const data = await unwrap(res);
  const content = (data.content || data.items || []).map(normalizeMovie);
  return { ...data, content };
}

export async function getMoviesByGenre(genre, page = 0, size = 10) {
  if (!genre) return { content: [], number: 0, totalPages: 0, totalElements: 0, size, numberOfElements: 0 };

  const url = new URL(MOVIE_BY_GENRE_API);
  url.searchParams.set("genre", genre);
  url.searchParams.set("page", page);
  url.searchParams.set("size", size);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  const data = await unwrap(res);

  const content = (data?.content || data?.items || []).map(normalizeMovie);
  return {
    ...data,
    content,
    number: data?.number ?? page,
    totalPages: data?.totalPages ?? 1,
    totalElements: data?.totalElements ?? content.length,
    size: data?.size ?? size,
    numberOfElements: data?.numberOfElements ?? content.length,
  };
}
export async function getMovieBySlug(slug) {
  const url = `${MOVIE_BY_SLUG_API}/${encodeURIComponent(slug)}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  const dto = await unwrap(res);       // ResponseMessage sarmalını açar
  return normalizeMovie(dto);
}
