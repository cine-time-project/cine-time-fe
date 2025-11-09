"use client";

import Card from "react-bootstrap/Card";
import styles from "./movie-card.module.scss";
import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { BuyTicketCardButton } from "./BuyTicketCardButton";
import { FindShowtimeButton } from "@/components/dashboard/cinema/detail/FindShowtimeButton";

/**
 * MovieCard Component
 * -------------------
 * Displays a movie card with poster, title, rating, release year, and summary.
 * Includes buttons for "Favorite" and "Buy Ticket".
 * Clicking the card navigates to the movie's detail page, respecting locale.
 */
function MovieCard({ movie, isMoviePage = true }) {
  const t = useTranslations(); // Translation hook
  const router = useRouter(); // Next.js router
  const { isFavorite, toggleFavorite, isLoggedIn } = useFavorites();
  const locale = useLocale(); // Current locale segment

  const poster = movie.images?.find((img) => img.poster) || movie.images?.[0];
  const imageUrl =
    poster?.url || movie.posterUrl || "/images/cinetime-logo.png";

  // Check if this movie is in favorites
  const isMovieFavorite = isFavorite(movie.id);

  // Prefix the URL with locale if available
  const prefix = locale ? `/${locale}` : "";

  // Construct detail page URL using movie ID
  const detailsHref = movie?.slug
    ? `${prefix}/movies/${movie.slug}`
    : `${prefix}/movies/${movie.id}`;

  /**
   * Navigate to movie detail page
   */
  const handleClick = () => {
    router.push(detailsHref);
  };

  /**
   * Toggle favorite state using the global favorites hook
   */
  const handleFavorite = useCallback(
    (e) => {
      e.stopPropagation();
      toggleFavorite(movie);
    },
    [movie, toggleFavorite]
  );

  return (
    <Card
      className={styles["movie-card"]}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
      aria-label={`Go to details for ${movie.title}`}
    >
      {/* Movie Poster */}
      <div className={styles["movie-card__image-wrapper"]}>
        <Card.Img
          loading="lazy"
          src={imageUrl}
          alt={poster?.name || t("movies.addToFavorites")}
          className={styles["movie-card__image"]}
        />
      </div>

      {/* Overlay gradient */}
      <div className={styles["movie-card__overlay"]}></div>

      {/* Favorite button (top-left) */}
      <div
        type="button"
        className={`${styles["movie-card__icon-button"]} ${styles["movie-card__favorite-button"]}`}
        onClick={handleFavorite}
        title={
          !isLoggedIn
            ? t("movies.loginToFavorite")
            : isMovieFavorite
            ? t("movies.removeFromFavorites")
            : t("movies.addToFavorites")
        }
        aria-label={
          !isLoggedIn
            ? t("movies.loginToFavorite")
            : isMovieFavorite
            ? t("movies.removeFromFavorites")
            : t("movies.addToFavorites")
        }
      >
        {!isLoggedIn ? (
          <i className="pi pi-heart" style={{ color: "#888" }}></i>
        ) : isMovieFavorite ? (
          <i className="pi pi-heart-fill" style={{ color: "#ff4081" }}></i>
        ) : (
          <i className="pi pi-heart" style={{ color: "#220514ff" }}></i>
        )}
      </div>

      {/* Buy ticket button (top-right) */}
      {isMoviePage ? <BuyTicketCardButton movie={movie} /> : <FindShowtimeButton /> }
      

      {/* Card body: title, release date, rating, summary */}
      <Card.Body className={styles["movie-card__body"]}>
        <Card.Title className={styles["movie-card__title"]}>
          {movie.title}
        </Card.Title>
        <Card.Subtitle>
          <div className={styles["movie-card__details"]}>
            {movie.releaseDate && (
              <div className={styles["movie-card__details__releaseDate"]}>
                {movie.releaseDate.substring(0, 4)}
              </div>
            )}
            {movie.rating != null && movie.rating !== 0 && (
              <div className={styles["movie-card__details__rating"]}>
                <span className={styles["movie-card__details__rating__text"]}>
                  {String(movie.rating).substring(0, 3)}{" "}
                </span>
                <i
                  className="pi pi-star-fill"
                  style={{ fontSize: "0.7rem" }}
                ></i>
              </div>
            )}
          </div>
        </Card.Subtitle>
        <Card.Text className={styles["movie-card__summary"]}>
          {movie.summary?.length > 70
            ? movie.summary.substring(0, 70) + "..."
            : movie.summary}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

// Optimize re-rendering: only rerender if movie prop changes
export default React.memo(MovieCard);
