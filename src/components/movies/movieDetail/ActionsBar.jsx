"use client";
import { useState } from "react";
import styles from "./actions-bar.module.scss";
import BiletAl from "@/components/common/button/BiletAl";

export default function ActionsBar({ movie, onToggleFavorite }) {
  const [castOpen, setCastOpen] = useState(false);

  // 1) Fragman
  const playTrailer = () => {
    if (movie?.trailerUrl) window.open(movie.trailerUrl, "_blank", "noopener");
  };

  // 2) Favori (placeholder)
  const toggleFavorite = async () => {
    try {
      // burayı kendi servisine bağla
      // await onToggleFavorite?.(movie.id);
      console.log("toggle favorite", movie?.id);
    } catch (e) {
      console.error(e);
    }
  };

  // 4) Kamera arkası – YouTube araması
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

  // 5) Paylaş
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: movie?.title, text: movie?.summary, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Bağlantı panoya kopyalandı ✅");
      }
    } catch {}
  };

  return (
    <div className={styles.actions}>
      <div className={styles.left}>
        <BiletAl
          href={`/movies/${movie?.slug}/showtimes`}
          variant="hero"
          subtitle="Yakındaki sinema ve seanslar"
        />
      </div>

      {/* -- İKONLAR (sıra önemlidir) -- */}
      <div className={styles.icons} role="group" aria-label="Film işlemleri">
        {/* 🎬 Fragman */}
        <button
          type="button"
          className={styles.iconBtn}
          onClick={playTrailer}
          title="Fragman"
          aria-label="Fragman"
          disabled={!movie?.trailerUrl}
        >
          <i className="pi pi-video" />
        </button>

        {/* ＋ Favorilere ekle */}
        <button
          type="button"
          className={styles.iconBtn}
          onClick={toggleFavorite}
          title="Favorilere ekle"
          aria-label="Favorilere ekle"
        >
          <i className="pi pi-plus" />
        </button>

        {/* 👥 Kadro (modal aç) */}
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => setCastOpen(true)}
          title="Kadro"
          aria-label="Kadro"
        >
          <i className="pi pi-users" />
        </button>

        {/* 🎥 Kamera Arkası (YouTube) */}
        <button
          type="button"
          className={styles.iconBtn}
          onClick={openBehindTheScenes}
          title="Kamera Arkası"
          aria-label="Kamera Arkası"
        >
          <i className="pi pi-youtube" />
        </button>

        {/* 🔗 Paylaş */}
        <button
          type="button"
          className={styles.iconBtn}
          onClick={share}
          title="Paylaş"
          aria-label="Paylaş"
        >
          <i className="pi pi-share-alt" />
        </button>
      </div>

      {/* --- Kadro Modal --- */}
      {castOpen && (
        <div className={styles.modalBackdrop} onClick={() => setCastOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h5 className="m-0">Kadro</h5>
              <button
                className={styles.modalClose}
                onClick={() => setCastOpen(false)}
                aria-label="Kapat"
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
                <div className="text-muted">Kadro bilgisi bulunamadı.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
