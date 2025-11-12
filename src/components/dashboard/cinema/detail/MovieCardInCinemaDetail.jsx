"use client";

import Card from "react-bootstrap/Card";
import styles from "@/components/movies/movie-card/movie-card.module.scss";
import React, { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useFavorites } from "@/lib/hooks/useFavorites";

function MovieCardInCinemaDetail({
  movie,
  selectedMovieID,
  setSelectedMovieID,
  isDashboard = false,
}) {
  const t = useTranslations(); // Translation hook
  const { isFavorite, toggleFavorite, isLoggedIn } = useFavorites();

  const poster = movie.images?.find((img) => img.poster) || movie.images?.[0];
  const imageUrl =
    poster?.url || movie.posterUrl || "/images/cinetime-logo.png";

  const selectionStyle = selectedMovieID
    ? selectedMovieID === movie.id
      ? styles["selected"]
      : styles["unselected"]
    : null;

  // Check if this movie is in favorites
  const isMovieFavorite = isFavorite(movie.id);

  const handleClick = () => {
    setSelectedMovieID((prevID) => (prevID === movie.id ? null : movie.id));
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
      className={`${styles["movie-card"]} ${selectionStyle}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
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

      {/* Card body: title, release date, rating, summary */}
      <Card.Body className={styles["movie-card__body"]}>
        <Card.Title className={styles["movie-card__title"]}>
          {movie.title}
        </Card.Title>
        <Card.Subtitle>
          <div className={styles["movie-card__details"]}>
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

            {movie.duration && (
              <div className={styles["movie-card__details__releaseDate"]}>
                {movie.duration} {t("movies.minutes")}
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
export default React.memo(MovieCardInCinemaDetail);
