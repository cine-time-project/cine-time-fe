// src/lib/movies/poster.js
import Image from "next/image";
import { config } from "@/helpers/config.js";

// Normalize various URL shapes (absolute, /path, relative) → absolute-ish
export function resolvePosterUrl(raw, apiBase = config.apiURL) {
  if (!raw) return null;
  const s = String(raw).trim();
  if (/^https?:\/\//i.test(s)) return s;
  const base = (apiBase || "").replace(/\/api\/?$/, "");
  if (s.startsWith("/")) return `${base}${s}`;
  return `${base}/${s}`;
}

// Robustly extract a poster URL from /movies/id/{id} payload
export function getMoviePosterUrl(movie, apiBase = config.apiURL) {
  if (!movie) return null;

  const images = Array.isArray(movie.images) ? movie.images : [];
  const posterObj =
    images.find((img) => img && img.poster === true) ||
    images.find((img) =>
      String(img?.name || "")
        .toLowerCase()
        .includes("poster")
    ) ||
    images[0];

  let raw = movie.posterUrl || movie.poster_url || posterObj?.url || null;

  // Fallbacks if only ids are present
  const baseNoApi = (apiBase || "").replace(/\/api\/?$/, "");
  if (
    !raw &&
    (typeof movie.posterId === "number" || typeof movie.posterId === "string")
  ) {
    raw = `${baseNoApi}/api/images/${movie.posterId}`;
  }
  if (
    !raw &&
    (typeof movie.heroId === "number" || typeof movie.heroId === "string")
  ) {
    raw = `${baseNoApi}/api/images/${movie.heroId}`;
  }

  return resolvePosterUrl(raw, apiBase);
}

/**
 * Small helper component to render the poster with Next/Image.
 * Usage:
 *   <MoviePoster movie={movie} alt={movie.title} width={200} height={300} />
 * or
 *   <MoviePoster movie={movie} alt={movie.title} fill sizes="(max-width: 900px) 100vw, 300px" />
 */
export function MoviePoster({
  movie,
  alt = "Poster",
  fallback = "/no-poster.png",
  fill = false,
  width,
  height,
  sizes = "(max-width: 900px) 100vw, 300px",
  style,
  ...rest
}) {
  const src = getMoviePosterUrl(movie) || fallback;

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        sizes={sizes}
        style={{ objectFit: "cover", ...(style || {}) }}
        {...rest}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      sizes={sizes}
      style={{ objectFit: "cover", ...(style || {}) }}
      {...rest}
    />
  );
}
