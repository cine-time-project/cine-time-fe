import { imageByIdApi } from "../helpers/api-routes";

const NOCACHE = true; // geçici! düzeldiğini görünce false yap/kaldır
function addBuster(u) {
  if (!NOCACHE || !u) return u;
  const sep = u.includes("?") ? "&" : "?";
  return `${u}${sep}v=${Date.now()}`;
}

function resolvePosterId(movie) {
  const direct =
    movie?.posterId ?? movie?.posterID ?? movie?.poster?.id ?? null;
  if (direct) return direct;
  if (Array.isArray(movie?.images) && movie.images.length > 0) {
    const poster = movie.images.find((img) => img.isPoster === true);
    if (poster?.id) return poster.id;
  }
  return null;
}

export function getPosterUrl(movie) {
  const posterId = resolvePosterId(movie);
  if (posterId) return addBuster(imageByIdApi(posterId));
  if (movie?.posterUrl) return addBuster(movie.posterUrl);
  return "/images/placeholders/poster-fallback.jpg";
}

export function getHeroUrl(movie) {
  const heroSingleId = movie?.heroId || movie?.backdropId || movie?.sceneId;
  if (heroSingleId) return addBuster(imageByIdApi(heroSingleId));
  if (movie?.heroUrl || movie?.backdropUrl || movie?.sceneUrl) {
    return addBuster(movie.heroUrl || movie.backdropUrl || movie.sceneUrl);
  }
  // Fallback to posterUrl for mock data
  if (movie?.posterUrl) return addBuster(movie.posterUrl);
  if (Array.isArray(movie?.images) && movie.images.length > 0) {
    const scene = movie.images.find((img) => img.isPoster === false);
    if (scene?.id) return addBuster(imageByIdApi(scene.id));
  }
  return getPosterUrl(movie);
}
