// src/components/movies/movieDetail/related/MovieCardDP.jsx
"use client";

import Link from "next/link";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import s from "./movie-card-dp.module.scss";
import { addFavoriteMovie, removeFavoriteMovie } from "@/services/favorite-service";

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

  const router = useRouter();
  const pathname = usePathname();

  // login durumu sadece client'ta
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => setIsLoggedIn(!!localStorage.getItem("authToken")), []);

  // kart bazlı favori state (BE'den gelmişse kullan)
  const [isFav, setIsFav] = useState(!!movie?.isFavorite);
  const [busy, setBusy] = useState(false);

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
    rankText,            // "#3 in Germany" gibi (opsiyonel)
    isNew,               // true -> NEW MOVIE rozeti
    age = 16,            // yaş etiketi (opsiyonel)
  } = movie;

  const img = useMemo(
    () => backdropUrl || posterUrl || "/images/hero/avatar-pandora-film-IMAGO.jpg",
    [backdropUrl, posterUrl]
  );

  const { locale } = useParams();
  const prefix = locale ? `/${locale}` : "";
  const to = id ? `${prefix}/movies/${id}` : "#";

  // 5 yıldız üzerinden göstermek için
  const starsOutOfFive = rating ? Math.round((Number(rating) / 10) * 5) : 0;
  const stars = Array.from({ length: 5 }).map((_, i) =>
    i < starsOutOfFive ? "★" : "☆"
  );

  // + buton click
  const onToggleFav = async (e) => {
    e.preventDefault(); // karttaki linke tıklamayı engelle
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!id || busy) return;

    setBusy(true);
    const next = !isFav;
    setIsFav(next); // optimistic

    try {
      if (next) {
        await addFavoriteMovie(id);   // 409'u başarı say
      } else {
        await removeFavoriteMovie(id); // 404'ü başarı say
      }
    } catch (err) {
      // geri al
      setIsFav(!next);
      const st = err?.response?.status;
      if (st === 401 || st === 403) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else {
        console.error(err);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={s.card}>
      {/* küçük tile */}
      <Link
        className={s.tileLink}
        href={to}
        aria-label={tTips("showDetails")}
      >
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
          href={to}
          className={s.popPoster}
          aria-label={`${title} ${tMovies("detailsTitle")}`}
        >
          <img src={img} alt={title || "movie"} />
        </Link>

        <div className={s.popBody}>
          <Link href={to} className={s.popTitleLink}>
            <h4 className={s.popTitle}>{title}</h4>
          </Link>

          {rankText && <div className={s.rank}>{rankText}</div>}

          {/* CTA Row */}
          <div className={s.ctaRow}>
            {/* + Favori */}
            <button
              className={`${s.roundBtn} ${isFav ? s.favOn : s.neutral}`}
              onClick={onToggleFav}
              disabled={busy}
              aria-pressed={isFav}
              title={
                !isLoggedIn
                  ? "Favoriye eklemek için giriş yap"
                  : isFav
                  ? tMovies("removeFromFavorites", { default: "Favorilerden çıkar" })
                  : tMovies("addToFavorites", { default: "Favorilere ekle" })
              }
            >
              <i className="pi pi-plus" />
            </button>

            {/* 🎬 Fragman (placeholder) */}
            <button
              className={`${s.roundBtn} ${s.neutral}`}
              aria-label={tMovies("trailer")}
              title={tMovies("trailer")}
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
              <span
                className={s.stars}
                title={`IMDb ${Number(rating).toFixed(1)}`}
              >
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
