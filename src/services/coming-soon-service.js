import { imageByIdApi } from "../helpers/api-routes";

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
  if (posterId) return imageByIdApi(posterId);
  if (movie?.posterUrl) return movie.posterUrl;
  return "/images/placeholders/poster-fallback.jpg";
}

export function getHeroUrl(movie) {
  const heroSingleId = movie?.heroId || movie?.backdropId || movie?.sceneId;
  if (heroSingleId) return imageByIdApi(heroSingleId);
  if (movie?.heroUrl || movie?.backdropUrl || movie?.sceneUrl) {
    return movie.heroUrl || movie.backdropUrl || movie.sceneUrl;
  }
  // Fallback to posterUrl for mock data
  if (movie?.posterUrl) return movie.posterUrl;
  if (Array.isArray(movie?.images) && movie.images.length > 0) {
    const scene = movie.images.find((img) => img.isPoster === false);
    if (scene?.id) return imageByIdApi(scene.id);
  }
  return getPosterUrl(movie);
}
