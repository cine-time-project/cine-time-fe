"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import styles from "./actions-bar.module.scss";
import BiletAl from "@/components/common/button/BiletAl";

/**
 * Props:
 *  - movie
 *  - onToggleFavorite()
 *  - isFavorite?: boolean
 *  - favBusy?: boolean
 *  - isLoggedIn?: boolean
 */
export default function ActionsBar({
  movie,
  onToggleFavorite,
  isFavorite = false,
  favBusy = false,
  isLoggedIn = true,
}) {
  const [castOpen, setCastOpen] = useState(false);

  // SSR/CSR farkı için mount bayrağı
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tMovies = useTranslations("movies");

  const { locale } = useParams();
  const prefix = locale ? `/${locale}` : "";
  const ticketHref = `${prefix}/find-showtime?movieId=${movie?.id}&movieTitle=${encodeURIComponent(
    movie?.title || ""
  )}`;

  const playTrailer = () => {
    if (movie?.trailerUrl) window.open(movie.trailerUrl, "_blank", "noopener");
  };

  const toggleFavorite = () => {
    if (favBusy) return;
    onToggleFavorite?.(movie);
  };

  const openBehindTheScenes = () => {
    const title = movie?.title || "";
    const q = encodeURIComponent(
      `${title} behind the scenes OR kamera arkası OR making of`
    );
    window.open(
      `https://www.youtube.com/results?search_query=${q}`,
      "_blank",
      "noopener"
    );
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: movie?.title, text: movie?.summary, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert(tMovies("linkCopied", { default: "Bağlantı panoya kopyalandı ✅" }));
      }
    } catch {}
  };

  // title/aria — SSR'da sabit, mount sonrası doğru metin
  const addMsg   = tMovies("addToFavorites", { default: "Favorilere ekle" });
  const rmMsg    = tMovies("removeFromFavorites", { default: "Favorilerden çıkar" });
  const loginMsg = "Favoriye eklemek için giriş yap";

  const favTitle = !mounted
    ? addMsg
    : !isLoggedIn
      ? loginMsg
      : isFavorite
        ? rmMsg
        : addMsg;

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

      <div
        className={styles.icons}
        role="group"
        aria-label={tMovies("actionsAria", { default: "Film işlemleri" })}
      >
        {/* 🎬 Fragman */}
        <button
          type="button"
          className={[styles.iconBtn, styles.neutral].join(" ")}
          onClick={playTrailer}
          title={tMovies("trailer", { default: "Fragman" })}
          aria-label={tMovies("trailer", { default: "Fragman" })}
          disabled={!movie?.trailerUrl}
        >
          <i className="pi pi-video" />
        </button>

        {/* ＋ Favoriler */}
      <button
  type="button"
  className={[
    styles.iconBtn,
    isFavorite ? styles.favOn : styles.neutral, // <= unfav = neutral
  ].join(" ")}
  onClick={toggleFavorite}
  disabled={favBusy}
  title={favTitle}
  aria-label={favTitle}
  aria-pressed={isFavorite}
  suppressHydrationWarning
>
  <i className="pi pi-plus" />
</button>

        {/* 👥 Kadro */}
        <button
          type="button"
          className={[styles.iconBtn, styles.neutral].join(" ")}
          onClick={() => setCastOpen(true)}
          title={tMovies("cast")}
          aria-label={tMovies("cast")}
        >
          <i className="pi pi-users" />
        </button>

        {/* 🎥 Kamera Arkası */}
        <button
          type="button"
          className={[styles.iconBtn, styles.neutral].join(" ")}
          onClick={openBehindTheScenes}
          title={tMovies("behindTheScenes", { default: "Kamera Arkası" })}
          aria-label={tMovies("behindTheScenes", { default: "Kamera Arkası" })}
        >
          <i className="pi pi-youtube" />
        </button>

        {/* 🔗 Paylaş */}
        <button
          type="button"
          className={[styles.iconBtn, styles.neutral].join(" ")}
          onClick={share}
          title={tMovies("share", { default: "Paylaş" })}
          aria-label={tMovies("share", { default: "Paylaş" })}
        >
          <i className="pi pi-share-alt" />
        </button>
      </div>

      {/* --- Kadro Modal --- */}
      {castOpen && (
        <div className={styles.modalBackdrop} onClick={() => setCastOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h5 className="m-0">{tMovies("cast")}</h5>
              <button
                className={styles.modalClose}
                onClick={() => setCastOpen(false)}
                aria-label={tCommon("close")}
                title={tCommon("close")}
              >
                <i className="pi pi-times" />
              </button>
            </div>
            <div className={styles.modalBody}>
              {(movie?.cast || []).length ? (
                <ul className={styles.castList}>
                  {movie.cast.map((name, i) => (
                    <li key={i}>
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(name)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted">
                  {tMovies("noCast", { default: "Kadro bilgisi bulunamadı." })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
