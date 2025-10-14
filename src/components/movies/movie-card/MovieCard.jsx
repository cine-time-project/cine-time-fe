"use client";

import Card from "react-bootstrap/Card";
import styles from "./movie-card.module.scss";
import { Button } from "react-bootstrap";
import React, { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";

/**
 * MovieCard Component
 * -------------------
 * Displays a movie card with poster, title, rating, release year, and summary.
 * Includes buttons for "Favorite" and "Buy Ticket".
 * Clicking the card navigates to the movie's detail page, respecting locale.
 */
function MovieCard({ movie }) {
  const t = useTranslations(); // Translation hook
  const router = useRouter(); // Next.js router
  const { locale } = useParams(); // Current locale segment from URL

  const poster = movie.images?.find((img) => img.poster) || movie.images?.[0];
  const imageUrl = poster ? poster.url : "/images/cinetime-logo.png";
  const [favorite, setFavorite] = useState(false);

  // Prefix the URL with locale if available
  const prefix = locale ? `/${locale}` : "";

  // Construct detail page URL using movie ID
  const detailsHref = movie?.id ? `${prefix}/movies/${movie.id}` : "#";

  // Optional: SEO-friendly slug fallback (can combine title + ID)
  // const movieSlug = movie.slug || `${movie.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${movie.id}`;
  // const detailsHref = movie?.id ? `${prefix}/movies/${movieSlug}` : "#";

  /**
   * Navigate to movie detail page
   */
  const handleClick = () => {
    router.push(detailsHref);
  };

  /**
   * Toggle favorite state without triggering card click
   */
  const handleFavorite = useCallback(
    (e) => {
      e.stopPropagation();
      setFavorite((prev) => !prev);
      console.log(
        `${movie.title} ${!favorite ? "added to" : "removed from"} favorites`
      );
    },
    [favorite, movie.title]
  );

  /**
   * Buy ticket click handler
   */
  const handleBuyTicket = useCallback(
    (e) => {
      e.stopPropagation();
      console.log(`Buy ticket for: ${movie.title}`);
    },
    [movie.title]
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
      <Button
        type="button"
        className={`${styles["movie-card__icon-button"]} ${styles["movie-card__favorite-button"]}`}
        onClick={handleFavorite}
        aria-label={t("movies.addToFavorites")}
      >
        {favorite ? (
          <i className="pi pi-heart-fill"></i>
        ) : (
          <i className="pi pi-heart"></i>
        )}
      </Button>

      {/* Buy ticket button (top-right) */}
      {movie.status !== "COMING_SOON" && (
        <Button
          type="button"
          className={`${styles["movie-card__icon-button"]} ${styles["movie-card__buy-button"]}`}
          onClick={handleBuyTicket}
          aria-label={t("movies.buyTicket")}
        >
          <i className="pi pi-ticket"></i>
        </Button>
      )}

      {/* Card body: title, release date, rating, summary */}
      <Card.Body className={styles["movie-card__body"]}>
        <Card.Title className={styles["movie-card__title"]}>
          <div className={styles["movie-card__details"]}>
            {movie.releaseDate && (
              <div className={styles["movie-card__details__releaseDate"]}>
                {movie.releaseDate.substring(0, 4)}
              </div>
            )}
            {movie.rating != null && movie.rating !== 0 && (
              <div className={styles["movie-card__details__rating"]}>
                {String(movie.rating).substring(0, 3)}
                <i className="pi pi-star-fill"></i>
              </div>
            )}
          </div>
          {movie.title}
        </Card.Title>
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
