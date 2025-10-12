"use client";

import Link from "next/link";
import s from "./movie-card-dp.module.scss";

/** dk -> "2 h 7 min" */
const fmtDuration = (min) => {
  if (!min && min !== 0) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} h ${m} min` : `${m} min`;
};

export default function MovieCardDP({ movie = {}, align = "center" }) {
  const {
    slug,
    title,
    rating,              // 6.4
    releaseYear,         // 2022
    duration,            // dk
    summary,             // kısa özet
    backdropUrl,
    posterUrl,
    rankText,            // "#3 in Germany" gibi (opsiyonel)
    isNew,               // true -> NEW MOVIE rozeti
    age = 16,            // yaş etiketi (opsiyonel)
  } = movie;

  const img = backdropUrl || posterUrl || "/images/hero/avatar-pandora-film-IMAGO.jpg";
  const to  = slug ? `/movies/${slug}` : "#";

  // 5 yıldız üzerinden göstermek için
  const starsOutOfFive = rating ? Math.round((Number(rating) / 10) * 5) : 0;
  const stars = Array.from({ length: 5 }).map((_, i) => (i < starsOutOfFive ? "★" : "☆"));

  return (
    <div className={s.card}>
      {/* küçük tile */}
      <Link className={s.tileLink} href={to}>
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
        <Link href={to} className={s.popPoster} aria-label={`${title} details`}>
          <img src={img} alt={title || "movie"} />
        </Link>

        <div className={s.popBody}>
          <Link href={to} className={s.popTitleLink}>
            <h4 className={s.popTitle}>{title}</h4>
          </Link>

          {rankText && <div className={s.rank}>{rankText}</div>}

          <div className={s.ctaRow}>
            <button className={s.roundBtn} aria-label="Favorilere ekle">
              <i className="ri-add-line" />
            </button>
            <button className={s.roundBtn} aria-label="Fragman">
              <i className="ri-clapperboard-line" />
            </button>
          </div>

          <div className={s.trial}>
            <i className="ri-check-fill" />
            Watch with a 30 day free Prime trial, auto renews at €8.99/month
          </div>

          <div className={s.metaLine}>
            {isNew && <span className={s.badge}>NEW MOVIE</span>}

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
                <span>{fmtDuration(duration)}</span>
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
