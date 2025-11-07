"use client";

import Card from "react-bootstrap/Card";
import styles from "./movie-card.module.scss";
import { Button } from "react-bootstrap";
import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useFavorites } from "@/lib/hooks/useFavorites";

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
  const { isFavorite, toggleFavorite, isLoggedIn } = useFavorites();
  const locale = useLocale(); // Current locale segment

  const poster = movie.images?.find((img) => !img.poster) || movie.images?.[1];
  const imageUrl = poster?.url || movie.posterUrl || "/images/cinetime-logo.png";

  // Check if this movie is in favorites
  const isMovieFavorite = isFavorite(movie.id);

  // Prefix the URL with locale if available
  const prefix = locale ? `/${locale}` : "";

  // Construct detail page URL using movie ID
  const detailsHref = movie?.slug
    ? `${prefix}/movies/${movie.slug}`
    : `${prefix}/movies/${movie.id}`;

  // Construct showtimes page URL using movie ID
  const showtimesHref = movie?.id
    ? `${prefix}/movies/showtimes/${movie.id}`
    : "#";

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

  /**
   * Buy ticket click handler
   */
  const handleBuyTicket = useCallback(
    (e) => {
      e.stopPropagation();
      if (movie.status === "IN_THEATERS") {
        router.push(`${prefix}/movies/showtimes/${movie.id}`);
      }
    },
    [movie.id, movie.status, prefix, router]
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
      {movie.status === "IN_THEATERS" && (
        <Image
          type="button"
          className={`${styles["movie-card__icon-button"]} ${styles["movie-card__buy-button"]}`}
          onClick={handleBuyTicket}
          title={t("movies.buyTicket", { default: "Buy Ticket" })}
          aria-label={t("movies.buyTicket", { default: "Buy Ticket" })}
          src="/icons/buy-tickets.png" // public klasöründeki bir resim
          alt="Buy Tickets"
          width={70} // orijinal genişlik
          height={70} // orijinal yükseklik
        />
      )}

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
