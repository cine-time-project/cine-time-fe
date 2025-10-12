import styles from "./movie-meta.module.scss";

export default function MovieMeta({ movie, className = "" }) {
  const items = [
    movie.rating != null ? <>⭐ {Number(movie.rating).toFixed(1)} IMDb</> : null,
    movie.releaseYear || (movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null),
    movie.duration ? `${movie.duration} dk` : null,
  ].filter(Boolean);

  const halls = (movie.specialHalls || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const formats = Array.isArray(movie.formats) ? movie.formats : [];
  const genres  = Array.isArray(movie.genres || movie.genre)
    ? (movie.genres || movie.genre)
    : [];

  return (
    <div className={`${styles.wrap} ${className}`}>
      {/* ÜST SATIR: meta + (IMAX/3D/X-RAY) */}
      <div className={styles.topRow}>
        {items.length > 0 && (
          <div className={styles.items}>
            {items.map((it, i) => (
              <span key={i} className={styles.item}>{it}</span>
            ))}
          </div>
        )}

        {(halls.length > 0 || formats.length > 0) && (
          <div className={styles.badges}>
            {halls.map((h, i) => (
              <span key={`hall-${i}`} className={styles.pill}>{h}</span>
            ))}
            {formats.map((f, i) => (
              <span key={`fmt-${i}`} className={styles.pill}>{f}</span>
            ))}
          </div>
        )}
      </div>

      {/* ALT SATIR: TÜRLER */}
{genres.length > 0 && (
  <div className={styles.genres}>
    {genres.map((g, i) => (
      <a
        key={`genre-${i}`}
        href={`/movies?genre=${encodeURIComponent(g)}`}
        className={styles.genreLink}
      >
        {g}
      </a>
    ))}
  </div>
)}

    </div>
  );
}
