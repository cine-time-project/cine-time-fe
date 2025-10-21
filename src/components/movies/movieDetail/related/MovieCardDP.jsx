"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import s from "./movie-card-dp.module.scss";
import { useParams } from "next/navigation";

/** dk -> "2 h 7 min" */
const fmtDuration = (min, t) => {
  if (!min && min !== 0) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} h ${m} ${t("minutes")}` : `${m} ${t("minutes")}`;
};

export default function MovieCardDP({
  movie = {},
  align = "center",
  onAddFavorite, // opsiyonel callback
}) {
  const tMovies = useTranslations("movies");
  const tTips = useTranslations("tooltips");

  const {
    id,
    slug,
    title,
    rating,              // 6.4
    releaseYear,         // 2022
    duration,            // dk
    summary,             // kısa özet
    backdropUrl,
    posterUrl,
    rankText,            // "#3 in Germany" (opsiyonel)
    isNew,               // true -> NEW MOVIE rozeti
    age = 16,            // yaş etiketi (opsiyonel)
    trailerUrl,          // "https://youtube.com/..." veya null
  } = movie;

  const img =
    backdropUrl || posterUrl || "/images/hero/avatar-pandora-film-IMAGO.jpg";

  const { locale } = useParams();
  const prefix = locale ? `/${locale}` : "";
  const detailsPath = slug
    ? `${prefix}/movies/${slug}`
    : id
    ? `${prefix}/movies/${id}`
    : "#";

  // 5 yıldız üzerinden göstermek için
  const starsOutOfFive = rating ? Math.round((Number(rating) / 10) * 5) : 0;
  const stars = Array.from({ length: 5 }).map((_, i) =>
    i < starsOutOfFive ? "★" : "☆"
  );

  const handleTrailerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (trailerUrl && /^https?:\/\//i.test(trailerUrl)) {
      window.open(trailerUrl, "_blank", "noopener,noreferrer");
    } else if (detailsPath !== "#") {
      window.open(`${detailsPath}?play=trailer`, "_blank", "noopener,noreferrer");
    }
  };

  const handleAddFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddFavorite?.(movie);
  };

  return (
    <div className={s.card}>
      {/* küçük tile */}
      <Link className={s.tileLink} href={detailsPath} aria-label={tTips("showDetails")}>
        <div className={s.thumb}>
          <img src={img} alt={title || "movie"} />
        </div>
        <div className={s.title}>{title}</div>
      </Link>

      {/* hover pop (prime tarzı) */}
      <div
        className={`${s.pop} ${
          align === "right" ? s.popRight : align === "left" ? s.popLeft : s.popCenter
        }`}
      >
        <Link
          href={detailsPath}
          className={s.popPoster}
          aria-label={`${title} ${tMovies("detailsTitle")}`}
        >
          <img src={img} alt={title || "movie"} />
        </Link>

        <div className={s.popBody}>
          <Link href={detailsPath} className={s.popTitleLink}>
            <h4 className={s.popTitle}>{title}</h4>
          </Link>

          {rankText && <div className={s.rank}>{rankText}</div>}

          <div className={s.ctaRow}>
            <button
              type="button"
              className={s.roundBtn}
              onClick={handleAddFavorite}
              aria-label={tMovies("addToFavorites")}
              title={tMovies("addToFavorites")}
            >
              <i className="pi pi-plus" />
            </button>

            <button
              type="button"
              className={s.roundBtn}
              onClick={handleTrailerClick}
              aria-label={tMovies("trailer")}
              title={tMovies("trailer")}
              disabled={!trailerUrl && detailsPath === "#"}
            >
              <i className="pi pi-video" />
            </button>
          </div>

          <div className={s.trial}>
            <i className="ri-check-fill" />
            {tMovies("primeTrial")}
          </div>

          <div className={s.metaLine}>
            {isNew && <span className={s.badge}>{tMovies("newMovie")}</span>}

            {rating != null && (
              <span className={s.stars} title={`IMDb ${Number(rating).toFixed(1)}`}>
                <span className={s.starIcons}>{stars.join("")}</span>
                <span className={s.ratingNum}>{Number(rating).toFixed(1)}</span>
              </span>
            )}

            {releaseYear && (
              <>
                <span className={s.dot} />
                <span>{releaseYear}</span>
              </>
            )}

            {duration && (
              <>
                <span className={s.dot} />
                <span>{fmtDuration(duration, tMovies)}</span>
              </>
            )}
          </div>

          <div className={s.age}>{age}</div>

          {summary && <p className={s.excerpt}>{summary}</p>}
        </div>
      </div>
    </div>
  );
}
