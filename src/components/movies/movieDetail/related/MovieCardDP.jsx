"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import s from "./movie-card-dp.module.scss";
import { useParams } from "next/navigation";
import { useFavorites } from "@/lib/hooks/useFavorites";

/** dk -> "2 h 7 min" */
const fmtDuration = (min, t) => {
  if (!min && min !== 0) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} h ${m} ${t("minutes")}` : `${m} ${t("minutes")}`;
};

export default function MovieCardDP({ movie = {}, align = "center" }) {
  const tMovies = useTranslations("movies");
  const tTips = useTranslations("tooltips");
  const { isFavorite, toggleFavorite } = useFavorites();

  const {
    id, slug, title, rating, releaseYear, duration,
    summary, backdropUrl, posterUrl, rankText, isNew,
    age = 16, trailerUrl,
  } = movie;

  const img = backdropUrl || posterUrl || "/images/hero/avatar-pandora-film-IMAGO.jpg";

  const { locale } = useParams();
  const prefix = locale ? `/${locale}` : "";
  const detailsPath = slug ? `${prefix}/movies/${slug}` : id ? `${prefix}/movies/${id}` : "#";

  const starsOutOfFive = rating ? Math.round((Number(rating) / 10) * 5) : 0;
  const stars = Array.from({ length: 5 }).map((_, i) => (i < starsOutOfFive ? "★" : "☆"));

  // Fragman - yeni sekme
  const handleTrailerClick = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (trailerUrl && /^https?:\/\//i.test(trailerUrl)) {
      window.open(trailerUrl, "_blank", "noopener,noreferrer");
    } else if (detailsPath !== "#") {
      window.open(`${detailsPath}?play=trailer`, "_blank", "noopener,noreferrer");
    }
  };

  // Favori
  const faved = isFavorite(id);
  const handleToggleFavorite = (e) => {
    e.preventDefault(); e.stopPropagation();
    toggleFavorite(movie);
  };

  return (
    <div className={s.card}>
      {/* küçük tile */}
      <Link className={s.tileLink} href={detailsPath} aria-label={tTips("showDetails")}>
        <div className={s.thumb}><img src={img} alt={title || "movie"} /></div>
        <div className={s.title}>{title}</div>
      </Link>

      {/* hover pop */}
      <div className={`${s.pop} ${align === "right" ? s.popRight : align === "left" ? s.popLeft : s.popCenter}`}>
        <Link href={detailsPath} className={s.popPoster} aria-label={`${title} ${tMovies("detailsTitle")}`}>
          <img src={img} alt={title || "movie"} />
        </Link>

        <div className={s.popBody}>
          <Link href={detailsPath} className={s.popTitleLink}><h4 className={s.popTitle}>{title}</h4></Link>

          {rankText && <div className={s.rank}>{rankText}</div>}

          <div className={s.ctaRow}>
            {/* Favori butonu: favoriyse arka planı değişir */}
            <button
              type="button"
              className={`${s.roundBtn} ${faved ? s.faved : ""}`}
              onClick={handleToggleFavorite}
              aria-label={faved ? tMovies("removeFromFavorites") : tMovies("addToFavorites")}
              title={faved ? tMovies("removeFromFavorites") : tMovies("addToFavorites")}
            >
              <i className={faved ? "pi pi-plus" : "pi pi-plus"} />
            </button>

            {/* Fragman */}
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

          <div className={s.trial}><i className="ri-check-fill" />{tMovies("primeTrial")}</div>

          <div className={s.metaLine}>
            {isNew && <span className={s.badge}>{tMovies("newMovie")}</span>}
            {rating != null && (
              <span className={s.stars} title={`IMDb ${Number(rating).toFixed(1)}`}>
                <span className={s.starIcons}>{stars.join("")}</span>
                <span className={s.ratingNum}>{Number(rating).toFixed(1)}</span>
              </span>
            )}
            {releaseYear && (<><span className={s.dot} /><span>{releaseYear}</span></>)}
            {duration && (<><span className={s.dot} /><span>{fmtDuration(duration, tMovies)}</span></>)}
          </div>

          <div className={s.age}>{age}</div>
          {summary && <p className={s.excerpt}>{summary}</p>}
        </div>
      </div>
    </div>
  );
}
