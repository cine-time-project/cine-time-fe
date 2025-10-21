"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import styles from "./actions-bar.module.scss";
import BiletAl from "@/components/common/button/BiletAl";
import { useFavorites } from "@/lib/hooks/useFavorites";

export default function ActionsBar({ movie }) {
  const [castOpen, setCastOpen] = useState(false);

  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tMovies = useTranslations("movies");
  const { isFavorite, toggleFavorite } = useFavorites();

  // locale'li prefix
  const { locale } = useParams();
  const prefix = locale ? `/${locale}` : "";
  const ticketHref = `${prefix}/find-showtime`;

  // Fragman — yeni sekme
  const playTrailer = () => {
    if (movie?.trailerUrl && /^https?:\/\//i.test(movie.trailerUrl)) {
      window.open(movie.trailerUrl, "_blank", "noopener,noreferrer");
      return;
    }
    const details = movie?.slug ? `${prefix}/movies/${movie.slug}` : movie?.id ? `${prefix}/movies/${movie.id}` : null;
    if (details) window.open(`${details}?play=trailer`, "_blank", "noopener,noreferrer");
  };

  // Favori
  const faved = isFavorite(movie?.id);
  const handleFavorite = () => { toggleFavorite(movie); };

  // Kamera arkası
  const openBehindTheScenes = () => {
    const title = movie?.title || "";
    const q = encodeURIComponent(`${title} behind the scenes OR kamera arkası OR making of`);
    window.open(`https://www.youtube.com/results?search_query=${q}`, "_blank", "noopener,noreferrer");
  };

  // Paylaş
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: movie?.title, text: movie?.summary, url });
      else { await navigator.clipboard.writeText(url); alert(tMovies("linkCopied", { default: "Bağlantı panoya kopyalandı ✅" })); }
    } catch {}
  };

  return (
    <div className={styles.actions}>
      <div className={styles.left}>
        <BiletAl href={ticketHref} variant="hero">
          <span className="btn-bilet__text">{tNav("buy")}</span>
          <span className="btn-bilet__sub">
            {tMovies("nearby", { default: "Yakındaki sinema ve seanslar" })}
          </span>
        </BiletAl>
      </div>

      {/* İKONLAR */}
      <div className={styles.icons} role="group" aria-label={tMovies("actionsAria", { default: "Film işlemleri" })}>
        {/* 🎬 Fragman */}
        <button
          type="button"
          className={styles.iconBtn}
          onClick={playTrailer}
          title={tMovies("trailer", { default: "Fragman" })}
          aria-label={tMovies("trailer", { default: "Fragman" })}
          disabled={!movie || (!movie.trailerUrl && !movie.id && !movie.slug)}
        >
          <i className="pi pi-video" />
        </button>

        {/* ＋/✓ Favori (favoriyken arka plan değişir) */}
        <button
          type="button"
          className={[styles.iconBtn, faved && styles.faved].filter(Boolean).join(" ")}
          onClick={handleFavorite}
          title={faved ? tMovies("removeFromFavorites", { default: "Favorilerden çıkar" }) : tMovies("addToFavorites", { default: "Favorilere ekle" })}
          aria-label={faved ? tMovies("removeFromFavorites", { default: "Favorilerden çıkar" }) : tMovies("addToFavorites", { default: "Favorilere ekle" })}
          aria-pressed={faved}
          disabled={!movie?.id}
        >
          <i className={faved ? "pi pi-plus" : "pi pi-plus"} />
        </button>

        {/* 👥 Kadro (modal) */}
        <button type="button" className={styles.iconBtn} onClick={() => setCastOpen(true)} title={tMovies("cast")} aria-label={tMovies("cast")}>
          <i className="pi pi-users" />
        </button>

        {/* 🎥 Kamera Arkası */}
        <button type="button" className={styles.iconBtn} onClick={openBehindTheScenes} title={tMovies("behindTheScenes", { default: "Kamera Arkası" })} aria-label={tMovies("behindTheScenes", { default: "Kamera Arkası" })}>
          <i className="pi pi-youtube" />
        </button>

        {/* 🔗 Paylaş */}
        <button type="button" className={styles.iconBtn} onClick={share} title={tMovies("share", { default: "Paylaş" })} aria-label={tMovies("share", { default: "Paylaş" })}>
          <i className="pi pi-share-alt" />
        </button>
      </div>

      {/* Kadro Modal */}
      {castOpen && (
        <div className={styles.modalBackdrop} onClick={() => setCastOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h5 className="m-0">{tMovies("cast")}</h5>
              <button className={styles.modalClose} onClick={() => setCastOpen(false)} aria-label={tCommon("close")} title={tCommon("close")}>
                <i className="pi pi-times" />
              </button>
            </div>
            <div className={styles.modalBody}>
              {(movie?.cast || []).length ? (
                <ul className={styles.castList}>
                  {movie.cast.map((name, i) => (
                    <li key={i}>
                      <a href={`https://www.google.com/search?q=${encodeURIComponent(name)}`} target="_blank" rel="noreferrer">
                        {name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted">{tMovies("noCast", { default: "Kadro bilgisi bulunamadı." })}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
