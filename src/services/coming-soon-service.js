// src/services/coming-soon-service.js
import { MOVIES_COMING_SOON_API, imageByIdApi } from "../helpers/api-routes";

/**
 * Coming Soon filmlerini çeker (paginated)
 * UI: 1-based page -> Backend: 0-based page
 * Backend iki şekilde dönebilir:
 *   A) { returnBody: { content, totalPages, totalElements, number, size } }
 *   B) Düz dizi []
 */
export async function fetchComingSoon({ page = 1, size = 12 } = {}) {
  const params = new URLSearchParams({
    page: String(Math.max(0, Number(page) - 1)), // backend 0-based
    size: String(Number(size) || 12),
  });

  const res = await fetch(`${MOVIES_COMING_SOON_API}?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch coming soon movies");

  const data = await res.json();

  // ResponseMessage<Page<Movie>>
  const pageObj =
    data?.returnBody && (data.returnBody.content ? data.returnBody : null);

  if (pageObj) {
    return {
      movies: pageObj.content || [],
      page: (pageObj.number ?? 0) + 1, // UI 1-based
      size: pageObj.size ?? size,
      totalPages: pageObj.totalPages ?? 1,
      totalElements: pageObj.totalElements ?? (pageObj.content?.length || 0),
    };
  }

  // Düz dizi
  const arr = Array.isArray(data)
    ? data
    : Array.isArray(data?.returnBody)
    ? data.returnBody
    : [];

  return {
    movies: arr,
    page,
    size,
    totalPages: 1,
    totalElements: arr.length,
  };
}

/** İçten poster id’sini bulmaya çalışır */
function resolvePosterId(movie) {
  // Sık görülen alanlar
  const direct =
    movie?.posterId ?? movie?.posterID ?? movie?.poster?.id ?? null;

  if (direct) return direct;

  // images[] içinden isPoster=true olan
  if (Array.isArray(movie?.images) && movie.images.length > 0) {
    const poster = movie.images.find((img) => img.isPoster === true);
    if (poster?.id) return poster.id;
  }
  return null;
}

/** Movie objesinden poster URL’si üretir */
export function getPosterUrl(movie) {
  // 1) id -> /api/images/{id}
  const posterId = resolvePosterId(movie);
  if (posterId) return imageByIdApi(posterId);

  // 2) gömülü URL geldiyse
  if (movie?.posterUrl) return movie.posterUrl;

  // 3) fallback
  return "/images/placeholders/poster-fallback.jpg";
}

/**
 * HERO görseli (backdrop/scene) için URL üretir.
 * Öncelik sırası:
 *   heroId/backdropId/sceneId -> images[isPoster=false] -> poster
 */
export function getHeroUrl(movie) {
  // 1) tekil id alanları
  const heroSingleId = movie?.heroId || movie?.backdropId || movie?.sceneId;
  if (heroSingleId) return imageByIdApi(heroSingleId);

  // 2) gömülü URL alanı
  if (movie?.heroUrl || movie?.backdropUrl || movie?.sceneUrl) {
    return movie.heroUrl || movie.backdropUrl || movie.sceneUrl;
  }

  // 3) images[]: isPoster=false olanı tercih et
  if (Array.isArray(movie?.images) && movie.images.length > 0) {
    const scene = movie.images.find((img) => img.isPoster === false);
    if (scene?.id) return imageByIdApi(scene.id);
  }

  // 4) fallback: poster
  return getPosterUrl(movie);
}
