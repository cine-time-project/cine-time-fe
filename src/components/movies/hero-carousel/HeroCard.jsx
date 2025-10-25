import BiletAl from "@/components/common/button/BiletAl";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "use-intl";
import styles from "@/components/movies/movieDetail/actions-bar.module.scss";
import { useCallback } from "react";

export const HeroCard = ({ movie }) => {
  // i18n
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tMovies = useTranslations("movies");

  const locale = useLocale();
  const router = useRouter();
  // 🎬 Select the scene image for the movie
  // Prefer the one marked as not poster, otherwise use the first image available
  const scene = movie.images?.find((img) => !img.poster) || movie.images?.[0]; // poster fallback
  const imageUrl = scene?.url || "https://via.placeholder.com/600x400"; // ekstra güvenlik

  const prefix = locale ? `/${locale}` : "";
  const showtimesHref = movie?.id
    ? `${prefix}/movies/showtimes/${movie.id}`
    : "#";

  // 1) Fragman
  const handlePlayTrailer = useCallback((e) => {
    e.stopPropagation();
    if (movie?.trailerUrl) window.open(movie.trailerUrl, "_blank", "noopener");
  });

  const handleClick = () => {
    router.push(`/${locale}/movies/${movie.id}`);
  };

  return (
    <div
      className="hero-card"
      style={{ backgroundImage: `url(${imageUrl})` }}
      onClick={handleClick}
      role="button"
    >
      <div className="hero-overlay" />

      <div className="hero-content">
        <h2 className="hero-title">{movie.title}</h2>
        <p className="hero-summary">{movie.summary}</p>
        <div className="hero-buttons">
          <BiletAl
            href={showtimesHref}
            variant="hero"
            onClick={(e) => e.stopPropagation()}
            aria-disabled={!movie?.id}
          >
            <span className="btn-bilet__text">{tNav("buy")}</span>
            <span className="btn-bilet__sub">
              {tMovies("nearby", { default: "Yakındaki sinema ve seanslar" })}
            </span>
          </BiletAl>
          {/* 🎬 Fragman */}
          <button
            type="button"
            className={styles.iconBtn}
            onClick={handlePlayTrailer}
            title={tMovies("trailer", { default: "Fragman" })}
            aria-label={tMovies("trailer", { default: "Fragman" })}
            disabled={!movie?.trailerUrl}
          >
            <i className="pi pi-video" />
          </button>
        </div>
      </div>
    </div>
  );
};
